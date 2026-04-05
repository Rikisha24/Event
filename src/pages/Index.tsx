import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MapPin, Sparkles, Ticket, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import SearchBar from '@/components/SearchBar';
import EventCard from '@/components/EventCard';
import { CATEGORIES } from '@/lib/mockData';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEvents } from '@/hooks/useEvents';

export default function Index() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: events = [], isLoading } = useEvents();

  const featured = events.slice(0, 4);
  const trending = events.filter(e => e.availableSeats < 100).slice(0, 3);

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="container relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="bg-primary/20 text-primary-foreground border-0">
              <Sparkles className="h-3 w-3 mr-1" />{t('home.heroBadge')}
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-secondary-foreground leading-tight">
              {t('home.heroTitle1')}<br />
              <span className="gradient-primary bg-clip-text text-transparent">{t('home.heroTitle2')}</span>
            </h1>
            <p className="text-lg text-secondary-foreground/70 max-w-lg mx-auto">
              {t('home.heroSubtitle')}
            </p>
            <div className="max-w-xl mx-auto">
              <SearchBar onSearch={handleSearch} size="large" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">{t('home.browseByCategory')}</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <Link key={cat} to={`/search?category=${cat}`}>
              <Badge variant="outline" className="px-4 py-2 text-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors cursor-pointer whitespace-nowrap">
                {cat}
              </Badge>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Events */}
      <section className="container pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />{t('home.featuredEvents')}
          </h2>
          <Link to="/search">
            <Button variant="ghost" size="sm">{t('common.viewAll')} <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      </section>

      {/* Trending / Low availability */}
      {trending.length > 0 && (
        <section className="container pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold flex items-center gap-2">
              {t('home.sellingFast')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trending.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Map CTA */}
      <section className="container pb-16">
        <div className="rounded-2xl gradient-hero p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl font-bold text-secondary-foreground mb-2">{t('home.exploreMap')}</h3>
            <p className="text-secondary-foreground/70">{t('home.exploreMapDesc')}</p>
          </div>
          <Link to="/map">
            <Button size="lg" className="shrink-0">
              <MapPin className="h-5 w-5 mr-2" />{t('home.openMap')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-display font-bold text-foreground">
            <Ticket className="h-5 w-5 text-primary" />EventHub
          </div>
          <p>{t('home.footer')}</p>
        </div>
      </footer>
    </div>
  );
}
