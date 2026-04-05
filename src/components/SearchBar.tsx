import { useState, useCallback } from 'react';
import { Search, Sparkles, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import VoiceMicButton from '@/components/VoiceMicButton';
import { useLanguage } from '@/contexts/LanguageContext';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  loading?: boolean;
  size?: 'default' | 'large';
}

export default function SearchBar({ onSearch, placeholder, loading = false, size = 'default' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const { t } = useLanguage();

  const defaultPlaceholder = size === 'large'
    ? t('search.placeholderLarge')
    : t('search.placeholder');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  const handleVoiceResult = useCallback((text: string) => {
    setQuery(text);
    if (text.trim()) onSearch(text.trim());
  }, [onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (query.trim()) onSearch(query.trim());
    }
  };

  const isLarge = size === 'large';

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className={cn(
        'flex items-start gap-2 rounded-xl border border-border bg-card shadow-card transition-all focus-within:shadow-elevated focus-within:ring-2 focus-within:ring-ring',
        isLarge ? 'p-3' : 'p-2'
      )}>
        <div className="flex flex-col items-center gap-1 pt-2 ml-2">
          <Brain className={cn('text-primary', isLarge ? 'h-5 w-5' : 'h-4 w-4')} />
          <span className="text-[9px] font-semibold text-primary/70 uppercase tracking-wider">Sabin</span>
        </div>

        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || defaultPlaceholder}
          rows={isLarge ? 2 : 2}
          className={cn(
            'flex-1 resize-none border-0 bg-transparent focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60',
            isLarge ? 'text-base leading-relaxed py-2' : 'text-sm leading-relaxed py-1.5'
          )}
        />

        <div className="flex flex-col items-center gap-1.5 pt-1">
          <VoiceMicButton onResult={handleVoiceResult} size={isLarge ? 'default' : 'sm'} />
          <Button type="submit" disabled={loading || !query.trim()} size={isLarge ? 'default' : 'sm'} className="shrink-0">
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
            ) : (
              <><Sparkles className="h-4 w-4 mr-1" />{t('common.search')}</>
            )}
          </Button>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground/50 mt-1.5 ml-3 italic">
        Powered by Sabin AI · Try "I feel like laughing" or "date night in Mumbai"
      </p>
    </form>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
