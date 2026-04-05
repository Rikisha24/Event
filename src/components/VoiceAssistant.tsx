import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface VoiceAssistantProps {
  /** Current contextual message key from translations, e.g. "voice.selectSeat" */
  messageKey: string;
}

export default function VoiceAssistant({ messageKey }: VoiceAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const { t } = useLanguage();

  const message = t(messageKey);

  const speakMessage = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleTts = () => {
    if (ttsEnabled) {
      window.speechSynthesis?.cancel();
      setTtsEnabled(false);
    } else {
      setTtsEnabled(true);
      speakMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-card border border-border rounded-xl shadow-elevated p-4 max-w-xs w-72"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4 text-primary" />
                {t('voice.assistant')}
              </span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleTts}>
                  {ttsEnabled ? <Volume2 className="h-3.5 w-3.5 text-primary" /> : <VolumeX className="h-3.5 w-3.5" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          size="icon"
          className="h-12 w-12 rounded-full shadow-elevated"
          onClick={() => setIsOpen(!isOpen)}
          id="voice-assistant-fab"
        >
          {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        </Button>
      </motion.div>
    </div>
  );
}
