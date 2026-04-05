import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Bike, Truck, CheckCircle2, ParkingCircle, MapPin, IndianRupee, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  generateParkingSlots,
  allocateParking,
  getParkingAvailability,
  type ParkingAllocation,
  type VehicleType,
  type ParkingSlot,
  type ParkingZone,
} from '@/lib/parkingData';

interface ParkingConsentProps {
  eventId: string;
  parkingSlotCount: number;
  bookingId: string;
  userId: string;
  onComplete: (allocation: ParkingAllocation | null) => void;
}

const vehicleIcons: Record<VehicleType, React.ReactNode> = {
  car: <Car className="h-5 w-5" />,
  bike: <Bike className="h-5 w-5" />,
  suv: <Truck className="h-5 w-5" />,
};

export default function ParkingConsent({ eventId, parkingSlotCount, bookingId, userId, onComplete }: ParkingConsentProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<'ask' | 'select' | 'allocated'>('ask');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('car');
  const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(null);
  const [allocation, setAllocation] = useState<ParkingAllocation | null>(null);

  const slots = useMemo(() => generateParkingSlots(eventId, parkingSlotCount), [eventId, parkingSlotCount]);
  const availability = useMemo(() => getParkingAvailability(slots), [slots]);

  const handleReserve = () => {
    if (!selectedZone) return; // Must pick a zone
    const result = allocateParking(slots, selectedVehicle, eventId, bookingId, userId, selectedZone);
    if (result) {
      setAllocation(result);
      setStep('allocated');
    }
  };

  const vehicleTypes: VehicleType[] = ['car', 'bike', 'suv'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className="border-primary/20 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-3 flex items-center gap-2">
            <ParkingCircle className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">{t('parking.title')}</span>
          </div>
          <CardContent className="pt-5 space-y-4">
            {/* Step 1: Ask consent */}
            {step === 'ask' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{t('parking.question')}</p>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Badge variant="secondary" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {availability.available} {t('parking.slotsAvailable')}
                  </Badge>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => setStep('select')} className="flex-1">
                    {t('common.yes')}
                  </Button>
                  <Button variant="outline" onClick={() => onComplete(null)} className="flex-1">
                    {t('parking.skipParking')}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Select vehicle & reserve */}
            {step === 'select' && (
              <div className="space-y-4">
                <p className="text-sm font-medium">{t('parking.selectVehicle')}</p>
                <div className="grid grid-cols-3 gap-2">
                  {vehicleTypes.map(vt => (
                    <button
                      key={vt}
                      onClick={() => setSelectedVehicle(vt)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                        selectedVehicle === vt
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      {vehicleIcons[vt]}
                      <span className="text-xs font-medium capitalize">{t(`parking.${vt}`)}</span>
                    </button>
                  ))}
                </div>

                {/* Zone availability selection */}
                <div className="space-y-2 mt-4">
                  <p className="text-sm font-medium">{t('parking.selectZone') || 'Select Parking Zone'}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {availability.byZone.map(z => {
                      const isAvailable = z.available > 0;
                      return (
                        <button
                          key={z.zone}
                          disabled={!isAvailable}
                          onClick={() => setSelectedZone(z.zone)}
                          className={`flex flex-col text-left text-xs p-2 rounded-lg border transition-all ${
                            !isAvailable ? 'opacity-50 grayscale cursor-not-allowed border-dashed'
                            : selectedZone === z.zone ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/40 bg-card hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex justify-between w-full mb-1">
                            <span className="font-semibold">
                              {t('parking.zone')} {z.zone}
                              {z.zone === 'Premium' && <Badge variant="secondary" className="ml-1 text-[9px] px-1 py-0 h-3 leading-none">{t('parking.premium')}</Badge>}
                            </span>
                          </div>
                          <span className={selectedZone === z.zone ? 'text-primary' : 'text-muted-foreground'}>
                            {z.available}/{z.total} slots · <br/>₹{z.fee}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {availability.available === 0 ? (
                  <p className="text-sm text-destructive">{t('parking.noSlotsAvailable')}</p>
                ) : (
                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleReserve} disabled={!selectedZone} className="flex-1">
                      {t('parking.reserveParking')}
                    </Button>
                    <Button variant="ghost" onClick={() => onComplete(null)}>
                      {t('parking.skipParking')}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Allocation confirmed */}
            {step === 'allocated' && allocation && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4 text-center"
              >
                <CheckCircle2 className="h-10 w-10 text-accent mx-auto" />
                <h3 className="font-semibold text-lg">{t('parking.allocated')}</h3>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm text-left">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('parking.zone')}</span>
                    <span className="font-medium">{allocation.zone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('parking.slot')}</span>
                    <span className="font-medium">#{allocation.slotNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('parking.vehicleType')}</span>
                    <span className="font-medium capitalize">{t(`parking.${allocation.vehicleType}`)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('parking.gate')}</span>
                    <span className="font-medium text-xs">{allocation.gateHint}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-muted-foreground">{t('parking.fee')}</span>
                    <span className="font-bold flex items-center gap-0.5">
                      <IndianRupee className="h-3 w-3" />{allocation.fee}
                    </span>
                  </div>
                </div>

                <Button onClick={() => onComplete(allocation)} className="w-full">
                  {t('common.confirm')}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
