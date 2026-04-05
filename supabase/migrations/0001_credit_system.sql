-- 0001_credit_system.sql

-- 1. Create payment_attempts table
CREATE TABLE payment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    event_id UUID NOT NULL REFERENCES events(id),
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL, -- 'pending', 'failed', 'success', 'credit_settled'
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create user_credits table
CREATE TABLE user_credits (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    balance NUMERIC NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create credit_ledger table for audit
CREATE TABLE credit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    type TEXT NOT NULL, -- 'issue', 'use', 'reverse'
    amount NUMERIC NOT NULL,
    linked_attempt_id UUID REFERENCES payment_attempts(id),
    linked_booking_id UUID REFERENCES bookings(id),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;

-- Policies for payment_attempts
CREATE POLICY "Users can view their own payment attempts" 
ON payment_attempts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment attempts" 
ON payment_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment attempts" 
ON payment_attempts FOR UPDATE USING (auth.uid() = user_id);

-- Policies for user_credits
CREATE POLICY "Users can view their own credit balance" 
ON user_credits FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credit balance" 
ON user_credits FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit balance" 
ON user_credits FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for credit_ledger
CREATE POLICY "Users can view their own ledger" 
ON credit_ledger FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ledger logs" 
ON credit_ledger FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Helper function and trigger to ensure user_credits rows exist
CREATE OR REPLACE FUNCTION secure_initial_credit_balance()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_credits (user_id, balance)
    VALUES (NEW.id, 0)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create balance row when a user is created
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION secure_initial_credit_balance();
