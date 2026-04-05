import { Link } from 'react-router-dom';
import { Calendar, MapPin, IndianRupee, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Event } from '@/lib/mockData';
import { motion } from 'framer-motion';

export default function EventCard({ event, index = 0 }: { event: Event; index?: number }) {
  const dateStr = new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link to={`/event/${event.id}`} className="group block">
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all hover:shadow-elevated hover:-translate-y-1">
          <div className="aspect-[16/9] bg-muted relative overflow-hidden">
            {event.image ? (
              <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full gradient-primary opacity-80 flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-primary-foreground/80">{event.category}</span>
              </div>
            )}
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">{event.category}</Badge>
            {event.availableSeats < 20 && (
              <Badge variant="destructive" className="absolute top-3 right-3">Few seats left!</Badge>
            )}
          </div>
          <div className="p-4 space-y-2">
            <h3 className="font-display font-semibold text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{dateStr}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.city}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="flex items-center font-semibold text-foreground">
                <IndianRupee className="h-4 w-4" />{event.price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-muted-foreground">{event.availableSeats} seats left</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
