import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type SeatStatus = 'available' | 'held' | 'booked' | 'selected';
interface Seat {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
}

interface SeatMapProps {
  seats: Seat[];
  onConfirm: (selectedIds: string[]) => void;
  maxSelect?: number;
}

export default function SeatMap({ seats, onConfirm, maxSelect = 6 }: SeatMapProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [holdTimers, setHoldTimers] = useState<Record<string, number>>({});
  const intervalsRef = useRef<Record<string, NodeJS.Timeout>>({});

  const toggleSeat = useCallback((seatId: string) => {
    setSelected(prev => {
      if (prev.includes(seatId)) {
        // Clear hold timer
        if (intervalsRef.current[seatId]) {
          clearInterval(intervalsRef.current[seatId]);
          delete intervalsRef.current[seatId];
        }
        setHoldTimers(t => { const n = { ...t }; delete n[seatId]; return n; });
        return prev.filter(s => s !== seatId);
      }
      if (prev.length >= maxSelect) return prev;

      // Start 10s hold timer
      setHoldTimers(t => ({ ...t, [seatId]: 10 }));
      intervalsRef.current[seatId] = setInterval(() => {
        setHoldTimers(t => {
          const val = (t[seatId] ?? 0) - 1;
          if (val <= 0) {
            clearInterval(intervalsRef.current[seatId]);
            delete intervalsRef.current[seatId];
            setSelected(s => s.filter(id => id !== seatId));
            const n = { ...t }; delete n[seatId]; return n;
          }
          return { ...t, [seatId]: val };
        });
      }, 1000);

      return [...prev, seatId];
    });
  }, [maxSelect]);

  useEffect(() => {
    return () => {
      Object.values(intervalsRef.current).forEach(clearInterval);
    };
  }, []);

  const rows = Array.from(new Set(seats.map(s => s.row))).sort();

  const colorMap: Record<SeatStatus, string> = {
    available: 'bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground cursor-pointer',
    selected: 'bg-primary text-primary-foreground animate-pulse-glow cursor-pointer',
    held: 'bg-muted text-muted-foreground cursor-not-allowed opacity-50',
    booked: 'bg-secondary text-secondary-foreground cursor-not-allowed opacity-40',
  };

  return (
    <div className="space-y-6">
      {/* Screen indicator */}
      <div className="mx-auto w-3/4 h-2 rounded-full bg-primary/30 mb-2" />
      <p className="text-center text-xs text-muted-foreground mb-4">SCREEN</p>

      {/* Seat grid */}
      <div className="space-y-2 overflow-x-auto">
        {rows.map(row => (
          <div key={row} className="flex items-center gap-1 justify-center">
            <span className="w-6 text-xs text-muted-foreground font-mono">{row}</span>
            {seats.filter(s => s.row === row).map(seat => {
              const status: SeatStatus = selected.includes(seat.id) ? 'selected' : seat.status;
              return (
                <button
                  key={seat.id}
                  disabled={seat.status === 'booked' || seat.status === 'held'}
                  onClick={() => toggleSeat(seat.id)}
                  className={cn(
                    'w-8 h-8 rounded-md text-[10px] font-medium transition-all',
                    colorMap[status]
                  )}
                  title={seat.id}
                >
                  {seat.number}
                  {holdTimers[seat.id] && (
                    <span className="block text-[8px] leading-none">{holdTimers[seat.id]}s</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-accent" /> Available</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-primary" /> Selected</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-secondary opacity-40" /> Booked</span>
      </div>

      {/* Selection summary */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm font-medium">{selected.length} seat{selected.length > 1 ? 's' : ''} selected</p>
            <div className="flex gap-1 mt-1">
              {selected.map(id => <Badge key={id} variant="secondary">{id}</Badge>)}
            </div>
          </div>
          <Button onClick={() => onConfirm(selected)}>Proceed to Pay</Button>
        </div>
      )}
    </div>
  );
}
