import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface VoiceMicButtonProps {
  onResult: (text: string) => void;
  size?: 'sm' | 'default';
}

export default function VoiceMicButton({ onResult, size = 'default' }: VoiceMicButtonProps) {
  const { isListening, transcript, startListening, stopListening, isSupported, error } = useVoiceInput();
  const { t } = useLanguage();

  // When listening stops and we have a transcript, emit it
  useEffect(() => {
    if (!isListening && transcript) {
      onResult(transcript);
    }
  }, [isListening, transcript, onResult]);

  if (!isSupported) return null;

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const btnSize = size === 'sm' ? 'sm' : 'default';

  return (
    <div className="relative flex items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={isListening ? 'default' : 'ghost'}
            size="icon"
            className={`relative shrink-0 ${size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'}`}
            onClick={isListening ? stopListening : startListening}
            id="voice-mic-button"
          >
            {isListening ? (
              <>
                {/* Pulsing ring animation */}
                <motion.div
                  className="absolute inset-0 rounded-md bg-primary/30"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
                <MicOff className={iconSize} />
              </>
            ) : (
              <Mic className={iconSize} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isListening ? t('voice.listening') : t('voice.tapToSpeak')}
        </TooltipContent>
      </Tooltip>

      {/* Live transcript bubble */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap"
          >
            <div className="bg-card border border-border rounded-lg shadow-elevated px-3 py-1.5 text-xs text-muted-foreground">
              {transcript || t('voice.speakNow')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
