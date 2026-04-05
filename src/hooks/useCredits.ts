import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useCreditBalance() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-credits', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching credit balance:', error);
        return 0; // fallback securely
      }
      return data?.balance || 0;
    },
    enabled: !!user,
  });
}

export function useCreditLedger() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['credit-ledger', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('credit_ledger')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useUnifiedLedger() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['unified-ledger', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: ledgerData, error: ledgerError } = await supabase
        .from('credit_ledger')
        .select('*')
        .eq('user_id', user.id);
        
      if (ledgerError) throw ledgerError;
      
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, events!inner(title)')
        .eq('user_id', user.id);
        
      if (bookingsError) throw bookingsError;
      
      const unified = [
        ...(ledgerData || []).map((t: any) => ({
          id: t.id,
          type: t.type, // 'issue' | 'use' | 'reverse'
          amount: t.amount,
          timestamp: t.timestamp,
          label: t.type === 'issue' ? 'Credit Received' : 'Payment Using Wallet',
          isCredit: true
        })),
        ...(bookingsData || []).map((b: any) => ({
          id: b.id,
          type: 'booking',
          amount: b.total_amount,
          timestamp: b.created_at,
          label: `Event Booking: ${b.events?.title || 'Ticket'}`,
          isCredit: false
        }))
      ];
      
      return unified.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    enabled: !!user,
  });
}
