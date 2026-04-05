import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { Event as DomainEvent } from '@/lib/mockData';

export type DbEvent = Database['public']['Tables']['events']['Row'];

function mapDbEventToDomain(dbEvent: DbEvent): DomainEvent {
  return {
    ...dbEvent,
    totalSeats: dbEvent.total_seats,
    availableSeats: dbEvent.available_seats,
    familyFriendly: dbEvent.family_friendly,
    hasParking: dbEvent.has_parking,
    parkingSlots: dbEvent.parking_slots,
    artist: dbEvent.artist ?? undefined,
  };
}

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }
      return (data as DbEvent[]).map(mapDbEventToDomain);
    },
  });
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
        throw error;
      }
      return mapDbEventToDomain(data as DbEvent);
    },
    enabled: !!id,
  });
}
