import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface StripeCheckoutFormProps {
  amount: number; // in rupees
  onSuccess: (paymentIntentId: string) => void;
  onSlowPayment: () => void; // triggers after timeout
  disabled?: boolean;
  label?: string;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#e2e8f0',
      fontFamily: '"Inter", sans-serif',
      '::placeholder': { color: '#64748b' },
    },
    invalid: { color: '#ef4444' },
  },
};

const API_BASE = '/api';

export default function StripeCheckoutForm({ amount, onSuccess, onSlowPayment, disabled, label }: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    // Set up a slow-payment timer (4 seconds)
    const slowTimer = setTimeout(() => {
      onSlowPayment();
    }, 4000);

    try {
      // 1. Create PaymentIntent on our backend
      const res = await fetch(`${API_BASE}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(amount * 100) }), // convert rupees to paise
      });

      const { clientSecret, error: serverError } = await res.json();
      if (serverError) throw new Error(serverError);

      // 2. Confirm the payment with the card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      clearTimeout(slowTimer);

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (err: any) {
      clearTimeout(slowTimer);
      setError(err.message);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 rounded-lg border border-border bg-background">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{t('booking.cardDetails') || 'Card Details'}</span>
        </div>
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || isProcessing || disabled}
      >
        {isProcessing ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('booking.waitingApproval') || 'Processing payment...'}</>
        ) : (
          label || `${t('booking.pay')} ₹${amount.toLocaleString('en-IN')}`
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        {t('booking.poweredByStripe') || 'Payments powered by Stripe'} · Test card: 4242 4242 4242 4242
      </p>
    </form>
  );
}
