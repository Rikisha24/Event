import { useMemo, useState } from 'react';
import EventMap from '@/components/EventMap';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CITIES } from '@/lib/mockData';
import { useEvents } from '@/hooks/useEvents';
import { useLanguage } from '@/contexts/LanguageContext';

export default function MapPage() {
  const { t } = useLanguage();
  const { data: dbEvents = [], isLoading } = useEvents();
  const [city, setCity] = useState<string>('all');

  const filtered = useMemo(() => {
    if (city === 'all') return dbEvents;
    return dbEvents.filter(e => e.city === city);
  }, [city, dbEvents]);

  const center = useMemo<[number, number]>(() => {
    if (filtered.length === 0) return [20.5937, 78.9629]; // India center
    const avgLat = filtered.reduce((s, e) => s + e.lat, 0) / filtered.length;
    const avgLng = filtered.reduce((s, e) => s + e.lng, 0) / filtered.length;
    return [avgLat, avgLng];
  }, [filtered]);

  const zoom = city === 'all' ? 5 : 12;

  return (
    <div className="container py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{t('common.map') || 'Event Map'}</h1>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter city" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('search.allCities')}</SelectItem>
            {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <div className="h-[calc(100vh-200px)] rounded-xl bg-muted animate-pulse flex items-center justify-center">
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      ) : (
        <EventMap events={filtered} center={center} zoom={zoom} className="h-[calc(100vh-200px)]" />
      )}
    </div>
  );
}
