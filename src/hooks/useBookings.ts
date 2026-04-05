import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ParkingAllocation } from '@/lib/parkingData';

interface CreateBookingParams {
  userId: string;
  eventId: string;
  seats: string[];
  totalAmount: number;
  parkingAllocation?: ParkingAllocation | null;
  creditUsed?: number;
}

export function useCreateBooking() {
  return useMutation({
    mutationFn: async ({ userId, eventId, seats, totalAmount, parkingAllocation, creditUsed }: CreateBookingParams) => {
      // 1. Insert booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: userId,
          event_id: eventId,
          seats,
          total_amount: totalAmount,
        } as any)
        .select()
        .single();

      if (bookingError) throw bookingError;

      // 2. Insert parking allocation if present
      if (parkingAllocation && (booking as any)?.id) {
        const { error: parkingError } = await supabase
          .from('parking_allocations')
          .insert({
            booking_id: (booking as any).id,
            user_id: userId,
            event_id: eventId,
            zone: parkingAllocation.zone,
            slot_number: parkingAllocation.slotNumber,
            vehicle_type: parkingAllocation.vehicleType,
            gate_hint: parkingAllocation.gateHint,
            fee: parkingAllocation.fee,
          } as any);

        if (parkingError) throw parkingError;
      }

      // 3. Process credit deduction if credit was used
      if (creditUsed && creditUsed > 0 && (booking as any)?.id) {
        // Technically this should be an RPC for exact atomic concurrency safety, 
        // but for MVP we deduct it sequentially here.
        // Fetch current
        const { data: creditData } = await supabase.from('user_credits').select('balance').eq('user_id', userId).single();
        const currentBalance = creditData?.balance || 0;
        
        if (currentBalance >= creditUsed) {
          // Update balance
          await supabase.from('user_credits').update({ balance: currentBalance - creditUsed } as any).eq('user_id', userId);
          // Log ledger
          await supabase.from('credit_ledger').insert({
            user_id: userId,
            type: 'use',
            amount: creditUsed,
            linked_booking_id: (booking as any).id
          } as any);
        }
      }

      return booking;
    },
  });
}

// SIMULATE: Failed payment & credit issuance
export function useMockPaymentFailure() {
  return useMutation({
    mutationFn: async ({ userId, eventId, seats, amount, failureReason }: { userId: string; eventId: string; seats: string[]; amount: number; failureReason: string }) => {
      // 1. Log payment attempt
      const { data: attempt, error: attemptError } = await supabase
        .from('payment_attempts')
        .insert({
          user_id: userId,
          event_id: eventId,
          amount,
          status: 'failed',
          failure_reason: failureReason
        } as any)
        .select()
        .single();
        
      if (attemptError) throw attemptError;

      // 2. We acknowledge it's recoverable, so we manually settle it into platform credit.
      await supabase.from('payment_attempts').update({ status: 'credit_settled' } as any).eq('id', (attempt as any).id);

      // 3. Issue the credit
      const { data: creditData } = await supabase.from('user_credits').select('balance').eq('user_id', userId).maybeSingle();
      const currentBalance = creditData?.balance || 0;
      
      const { error: creditError } = await supabase.from('user_credits').upsert({
        user_id: userId,
        balance: currentBalance + amount
      } as any);

      if (creditError) throw creditError;

      // 4. Log the ledger
      await supabase.from('credit_ledger').insert({
        user_id: userId,
        type: 'issue',
        amount,
        linked_attempt_id: (attempt as any).id
      } as any);

      return attempt;
    }
  });
}

// REAL MONEY: Top Up Wallet explicitly
export function useTopUpWallet() {
  return useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      // Fetch current
      const { data: creditData } = await supabase.from('user_credits').select('balance').eq('user_id', userId).maybeSingle();
      const currentBalance = creditData?.balance || 0;
      
      const { error: creditError } = await supabase.from('user_credits').upsert({
        user_id: userId,
        balance: currentBalance + amount
      } as any);

      if (creditError) throw creditError;

      // Log the ledger
      await supabase.from('credit_ledger').insert({
        user_id: userId,
        type: 'issue',
        amount,
      } as any);

      return currentBalance + amount;
    }
  });
}
