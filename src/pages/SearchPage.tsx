import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import EventCard from '@/components/EventCard';
import { CATEGORIES, CITIES, type Event } from '@/lib/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, SlidersHorizontal, X, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEvents } from '@/hooks/useEvents';

export interface SearchIntent {
  categories?: string[];
  priceMax?: number;
  city?: string;
  language?: string;
  keywords?: string[];
  familyFriendly?: boolean;
  wantsParking?: boolean;
  mood?: string;
  intent?: string;
  confidence?: number;
}

// Fallback keyword rules engine (used if Sabin API is unavailable)
function parseIntentLocal(query: string): SearchIntent {
  const q = query.toLowerCase();
  const intent: SearchIntent = {};

  const catMap: Record<string, string> = {
    'comedy': 'Comedy', 'standup': 'Comedy', 'stand-up': 'Comedy', 'laugh': 'Comedy', 'funny': 'Comedy', 'humor': 'Comedy',
    'music': 'Music', 'concert': 'Music', 'live': 'Music', 'song': 'Music', 'band': 'Music',
    'theatre': 'Theatre', 'theater': 'Theatre', 'play': 'Theatre', 'drama': 'Theatre',
    'sports': 'Sports', 'cricket': 'Sports', 'ipl': 'Sports', 'match': 'Sports',
    'workshop': 'Workshop', 'class': 'Workshop', 'learn': 'Workshop',
    'festival': 'Festival', 'fest': 'Festival', 'carnival': 'Festival',
    'tech': 'Tech', 'conference': 'Tech', 'hackathon': 'Tech',
    'food': 'Food', 'foodie': 'Food', 'culinary': 'Food',
  };
  const cats = new Set<string>();
  Object.entries(catMap).forEach(([kw, cat]) => { if (q.includes(kw)) cats.add(cat); });
  if (cats.size) intent.categories = Array.from(cats);

  // Mood-based fallback
  if (q.includes('bored') || q.includes('nothing to do')) intent.categories = ['Comedy', 'Music', 'Festival'];
  if (q.includes('date') || q.includes('romantic')) intent.categories = ['Theatre', 'Music'];
  if (q.includes('chill') || q.includes('relax')) intent.categories = ['Music', 'Food'];

  if (q.includes('cheap') || q.includes('budget') || q.includes('affordable')) intent.priceMax = 1500;
  const priceMatch = q.match(/under\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
  if (priceMatch) intent.priceMax = parseInt(priceMatch[1]);

  const cityMap: Record<string, string> = {
    'bengaluru': 'Bengaluru', 'bangalore': 'Bengaluru', 'blr': 'Bengaluru',
    'mumbai': 'Mumbai', 'bombay': 'Mumbai',
    'delhi': 'Delhi', 'ncr': 'Delhi',
    'chennai': 'Chennai', 'madras': 'Chennai',
    'hyderabad': 'Hyderabad', 'pune': 'Pune',
    'kolkata': 'Kolkata', 'calcutta': 'Kolkata',
    'jaipur': 'Jaipur',
  };
  Object.entries(cityMap).forEach(([kw, city]) => { if (q.includes(kw)) intent.city = city; });

  if (q.includes('family') || q.includes('kid')) intent.familyFriendly = true;
  if (q.includes('parking')) intent.wantsParking = true;

  return intent;
}

function applyIntent(events: Event[], intent: SearchIntent): Event[] {
  return events.filter(e => {
    if (intent.categories?.length && !intent.categories.includes(e.category)) return false;
    if (intent.priceMax && e.price > intent.priceMax) return false;
    if (intent.city && e.city !== intent.city) return false;
    if (intent.language && e.language !== intent.language) return false;
    if (intent.familyFriendly && !e.familyFriendly) return false;
    if (intent.wantsParking && !e.hasParking) return false;
    return true;
  });
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const { data: dbEvents = [], isLoading: eventsLoading } = useEvents();
  const [results, setResults] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIntent, setActiveIntent] = useState<SearchIntent | null>(null);
  const [aiSource, setAiSource] = useState<'sabin' | 'local' | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState<string>('all');
  const [city, setCity] = useState<string>('all');
  const [priceRange, setPriceRange] = useState([0, 5000]);

  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
    if (!eventsLoading && results.length === 0) setResults(dbEvents);
    if (initialQuery && !eventsLoading) handleSearch(initialQuery);
  }, [eventsLoading]);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setAiSource(null);

    try {
      // Call our Sabin backend
      const res = await fetch('/api/search-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.intent) {
          setActiveIntent(data.intent);
          setAiSource('sabin');
          setResults(applyIntent(dbEvents, data.intent));
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fall through to local parser
    }

    // Fallback: local keyword parser
    const intent = parseIntentLocal(query);
    setActiveIntent(intent);
    setAiSource('local');
    setResults(applyIntent(dbEvents, intent));
    setLoading(false);
  };

  const filtered = useMemo(() => {
    let base = activeIntent ? results : dbEvents;
    if (category && category !== 'all') base = base.filter(e => e.category === category);
    if (city && city !== 'all') base = base.filter(e => e.city === city);
    base = base.filter(e => e.price >= priceRange[0] && e.price <= priceRange[1]);
    return base;
  }, [results, activeIntent, category, city, priceRange, dbEvents]);

  const clearFilters = () => {
    setCategory('all');
    setCity('all');
    setPriceRange([0, 5000]);
    setActiveIntent(null);
    setAiSource(null);
    setResults(dbEvents);
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="max-w-2xl mx-auto">
        <SearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {/* AI Intent Display */}
      {activeIntent && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {aiSource === 'sabin' && (
              <Badge variant="outline" className="gap-1 text-primary border-primary/30 bg-primary/5">
                <Brain className="h-3 w-3" /> Sabin AI
              </Badge>
            )}
            {activeIntent.intent && (
              <span className="text-sm text-muted-foreground italic">"{activeIntent.intent}"</span>
            )}
            {activeIntent.mood && (
              <Badge variant="secondary" className="text-xs">Mood: {activeIntent.mood}</Badge>
            )}
            {activeIntent.confidence != null && activeIntent.confidence > 0 && (
              <Badge variant="secondary" className="text-xs">{Math.round(activeIntent.confidence * 100)}% confident</Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('search.aiFilters')}</span>
            {activeIntent.categories?.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
            {activeIntent.city && <Badge variant="secondary">{activeIntent.city}</Badge>}
            {activeIntent.language && <Badge variant="secondary">{activeIntent.language}</Badge>}
            {activeIntent.priceMax && <Badge variant="secondary">{t('search.under')} ₹{activeIntent.priceMax}</Badge>}
            {activeIntent.familyFriendly && <Badge variant="secondary">{t('common.familyFriendly')}</Badge>}
            {activeIntent.wantsParking && <Badge variant="secondary">{t('search.parking')}</Badge>}
            <Button variant="ghost" size="sm" onClick={clearFilters}><X className="h-3 w-3 mr-1" />{t('search.clear')}</Button>
          </div>
        </div>
      )}

      {/* Manual Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal className="h-4 w-4 mr-1" />{t('search.filters')}
        </Button>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('search.allCategories')}</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="City" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('search.allCities')}</SelectItem>
            {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {showFilters && (
        <div className="p-4 bg-muted rounded-lg space-y-3">
          <div>
            <label className="text-sm font-medium flex items-center gap-1 mb-2"><IndianRupee className="h-3 w-3" />{t('search.priceRange')}: ₹{priceRange[0]} – ₹{priceRange[1]}</label>
            <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={5000} step={100} className="max-w-sm" />
          </div>
        </div>
      )}

      {/* Results */}
      <div>
        <p className="text-sm text-muted-foreground mb-4">{filtered.length} {t('search.eventsFound')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventsLoading ? (
            <p className="text-muted-foreground">{t('common.loading')}</p>
          ) : filtered.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
        {!eventsLoading && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">{t('search.noEvents')}</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>{t('search.clearAllFilters')}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
