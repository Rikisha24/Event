import { useParams, useNavigate } from 'react-router-dom';
import { generateSeatLayout } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, IndianRupee, Car, Users, ArrowLeft, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import SeatMap from '@/components/SeatMap';
import VoiceAssistant from '@/components/VoiceAssistant';
import { useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEvent } from '@/hooks/useEvents';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: event, isLoading } = useEvent(id);
  const [showSeatMap, setShowSeatMap] = useState(false);

  const seats = useMemo(() => event ? generateSeatLayout(event.totalSeats) : [], [event]);

  if (isLoading) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('common.loading')}</h1>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Event not found</h1>
        <Button onClick={() => navigate('/search')}>{t('common.browseEvents')}</Button>
      </div>
    );
  }

  const dateStr = new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const handleSeatConfirm = (selectedIds: string[]) => {
    navigate(`/booking/${event.id}?seats=${selectedIds.join(',')}`);
  };

  const openMaps = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${event.lat},${event.lng}`, '_blank');
  };

  return (
    <div className="min-h-screen">
      {/* Hero banner */}
      <div className="gradient-hero py-8">
        <div className="container">
          <Button variant="ghost" className="text-secondary-foreground/70 mb-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />{t('common.back')}
          </Button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-3 gap-8">
            {/* Event image */}
            <div className="md:col-span-1">
              <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                {event.image ? (
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full gradient-primary opacity-80 flex items-center justify-center">
                    <span className="font-display text-3xl font-bold text-primary-foreground/80">{event.category}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Event info */}
            <div className="md:col-span-2 text-secondary-foreground space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary text-primary-foreground">{event.category}</Badge>
                <Badge variant="outline" className="border-secondary-foreground/30 text-secondary-foreground">{event.language}</Badge>
                {event.familyFriendly && <Badge variant="outline" className="border-secondary-foreground/30 text-secondary-foreground">{t('common.familyFriendly')}</Badge>}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">{event.title}</h1>
              {event.artist && <p className="text-lg text-secondary-foreground/70">by {event.artist}</p>}
              <div className="flex flex-wrap gap-4 text-sm text-secondary-foreground/80">
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{dateStr}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{event.time}</span>
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{event.venue}, {event.city}</span>
                {event.hasParking && <span className="flex items-center gap-1"><Car className="h-4 w-4" />{t('common.parkingAvailable')}</span>}
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center text-2xl font-bold"><IndianRupee className="h-6 w-6" />{event.price.toLocaleString('en-IN')}</span>
                <span className="flex items-center gap-1 text-sm text-secondary-foreground/70"><Users className="h-4 w-4" />{event.availableSeats} {t('event.seatsAvailable')}</span>
              </div>
              <div className="flex gap-3 pt-2">
                <Button size="lg" onClick={() => setShowSeatMap(true)}>{t('common.bookNow')}</Button>
                <Button variant="outline" size="lg" className="text-secondary-foreground border-secondary-foreground/30 hover:bg-secondary-foreground/10" onClick={openMaps}>
                  <ExternalLink className="h-4 w-4 mr-1" />{t('common.directions')}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Description */}
      <div className="container py-8 max-w-3xl">
        <h2 className="font-display text-xl font-bold mb-3">{t('event.aboutThisEvent')}</h2>
        <p className="text-muted-foreground leading-relaxed">{event.description}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {event.tags.map(tag => <Badge key={tag} variant="outline">#{tag}</Badge>)}
        </div>
      </div>

      {/* Seat Map */}
      {showSeatMap && (
        <div className="container pb-16 max-w-3xl">
          <h2 className="font-display text-xl font-bold mb-4">{t('event.selectYourSeats')}</h2>
          <SeatMap seats={seats} onConfirm={handleSeatConfirm} />
        </div>
      )}

      <VoiceAssistant messageKey={showSeatMap ? 'voice.selectSeat' : 'voice.selectSeat'} />
    </div>
  );
}
