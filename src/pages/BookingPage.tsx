import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, CheckCircle2, Ticket, ArrowLeft, ParkingCircle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ParkingConsent from '@/components/ParkingConsent';
import VoiceAssistant from '@/components/VoiceAssistant';
import type { ParkingAllocation } from '@/lib/parkingData';
import { useEvent } from '@/hooks/useEvents';
import { useCreateBooking } from '@/hooks/useBookings';
import { useCreditBalance } from '@/hooks/useCredits';
import { Checkbox } from '@/components/ui/checkbox';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import StripeCheckoutForm from '@/components/StripeCheckoutForm';
import TicketDownload from '@/components/TicketDownload';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type BookingStep = 'parking-consent' | 'pending' | 'processing' | 'success';

export default function BookingPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [parkingAllocation, setParkingAllocation] = useState<ParkingAllocation | null>(null);
  const [useWallet, setUseWallet] = useState(false);
  const [showSlowPrompt, setShowSlowPrompt] = useState(false);

  const { data: event, isLoading: eventLoading } = useEvent(id);
  const { data: walletBalance = 0 } = useCreditBalance();
  const createBooking = useCreateBooking();
  const seatIds = searchParams.get('seats')?.split(',') || [];

  // Determine initial step
  const initialStep: BookingStep = event?.hasParking ? 'parking-consent' : 'pending';
  const [bookingStep, setBookingStep] = useState<BookingStep>(initialStep);

  if (eventLoading) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('common.loading')}</h1>
      </div>
    );
  }

  if (!event || seatIds.length === 0) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('booking.invalidBooking')}</h1>
        <Button onClick={() => navigate('/search')}>{t('common.browseEvents')}</Button>
      </div>
    );
  }

  const ticketTotal = event.price * seatIds.length;
  const parkingFee = parkingAllocation?.fee ?? 0;
  const subTotal = ticketTotal + parkingFee;
  const creditApplied = useWallet ? Math.min(walletBalance, subTotal) : 0;
  const totalPrice = subTotal - creditApplied;

  const handleParkingComplete = (allocation: ParkingAllocation | null) => {
    setParkingAllocation(allocation);
    setBookingStep('pending');
    if (allocation) {
      toast({ title: t('parking.allocated'), description: t('parking.slotAssigned').replace('{slot}', String(allocation.slotNumber)).replace('{zone}', allocation.zone) });
    }
  };

  const executeBooking = async (forceFullWallet: boolean = false) => {
    if (!user || !event) return;

    if (forceFullWallet) setUseWallet(true);
    const finalCreditUsed = forceFullWallet ? subTotal : creditApplied;

    try {
      await createBooking.mutateAsync({
        userId: user.id,
        eventId: event.id,
        seats: seatIds,
        totalAmount: forceFullWallet ? 0 : totalPrice,
        parkingAllocation,
        creditUsed: finalCreditUsed
      });

      setBookingStep('success');
      toast({ title: t('booking.bookingConfirmed') + ' 🎉', description: t('booking.bookingConfirmedDesc').replace('{event}', event.title) });
    } catch (err: any) {
      toast({ title: 'Booking failed', description: err.message, variant: 'destructive' });
      setBookingStep('pending');
    }
  };

  // Called when Stripe payment succeeds
  const handleStripeSuccess = async (paymentIntentId: string) => {
    console.log('Stripe payment succeeded:', paymentIntentId);
    await executeBooking(false);
  };

  // Called when Stripe takes too long (4s)
  const handleSlowPayment = () => {
    if (walletBalance > 0) {
      setShowSlowPrompt(true);
    }
    // If no wallet balance, just let Stripe continue naturally
  };

  // Switch to wallet from the slow-payment prompt
  const handleSwitchToWallet = async () => {
    setShowSlowPrompt(false);
    if (walletBalance >= subTotal) {
      await executeBooking(true);
    } else {
      toast({
        title: t('booking.topUpWallet') || 'Insufficient Wallet Balance',
        description: 'Please top up your wallet and try again.',
        variant: 'destructive'
      });
      navigate('/wallet');
    }
  };

  const handleContinueWaiting = () => {
    setShowSlowPrompt(false);
    // Stripe will continue processing in the background
  };

  // Handle fully-wallet-covered payment (no card needed)
  const handleWalletOnlyPayment = async () => {
    if (!user) {
      toast({ title: t('booking.pleaseSignIn'), description: t('booking.signInRequired'), variant: 'destructive' });
      navigate('/login');
      return;
    }
    setBookingStep('processing');
    await executeBooking(false);
  };

  const voiceMessage = bookingStep === 'parking-consent'
    ? 'voice.parkingPrompt'
    : bookingStep === 'processing'
      ? 'voice.paymentPending'
      : bookingStep === 'success'
        ? 'voice.bookingDone'
        : 'voice.selectSeat';

  if (bookingStep === 'success') {
    return (
      <div className="container py-16 max-w-lg mx-auto text-center space-y-6">
        <CheckCircle2 className="h-16 w-16 text-accent mx-auto" />
        <h1 className="font-display text-3xl font-bold">{t('booking.bookingConfirmed')}</h1>
        <Card>
          <CardContent className="pt-6 space-y-3">
            <p className="font-semibold text-lg">{event.title}</p>
            <p className="text-sm text-muted-foreground">{event.venue}, {event.city}</p>
            <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} at {event.time}</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {seatIds.map(s => <Badge key={s}>{s}</Badge>)}
            </div>

            {parkingAllocation ? (
              <div className="border-t border-border pt-3 mt-3 space-y-1.5">
                <p className="text-sm font-medium flex items-center gap-1.5 justify-center">
                  <ParkingCircle className="h-4 w-4 text-primary" /> {t('parking.parkingDetails')}
                </p>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>{t('parking.zone')}: {parkingAllocation.zone} · {t('parking.slot')}: #{parkingAllocation.slotNumber}</p>
                  <p>{t('parking.vehicleType')}: {t(`parking.${parkingAllocation.vehicleType}`)} · {t('parking.gate')}: {parkingAllocation.gateHint}</p>
                  <p className="font-medium text-foreground">{t('parking.fee')}: ₹{parkingAllocation.fee}</p>
                </div>
              </div>
            ) : event.hasParking ? (
              <p className="text-xs text-muted-foreground">{t('booking.noParkingBooked')}</p>
            ) : null}

            <p className="text-xl font-bold flex items-center justify-center gap-1"><IndianRupee className="h-5 w-5" />{totalPrice.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        <div className="flex gap-3 justify-center flex-wrap">
          <TicketDownload data={{
            eventTitle: event.title,
            venue: event.venue,
            city: event.city,
            date: new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
            time: event.time,
            seats: seatIds,
            totalPrice,
            bookingId: `BK-${Date.now().toString(36).toUpperCase()}`,
            parking: parkingAllocation ? {
              zone: parkingAllocation.zone,
              slotNumber: parkingAllocation.slotNumber,
              vehicleType: parkingAllocation.vehicleType,
              fee: parkingAllocation.fee,
            } : null,
          }} />
          <Button onClick={() => navigate('/')}>{t('common.backToHome')}</Button>
          <Button variant="outline" onClick={() => navigate('/search')}>{t('common.findMoreEvents')}</Button>
        </div>
        <VoiceAssistant messageKey={voiceMessage} />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-lg mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-1" />{t('common.back')}</Button>

      <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Ticket className="h-6 w-6 text-primary" />{t('booking.confirmBooking')}</h1>

      {/* Parking consent step */}
      {bookingStep === 'parking-consent' && event.hasParking && (
        <ParkingConsent
          eventId={event.id}
          parkingSlotCount={event.parkingSlots}
          bookingId={`BK-${Date.now()}`}
          userId={user?.id ?? 'guest'}
          onComplete={handleParkingComplete}
        />
      )}

      {/* Payment card */}
      {(bookingStep === 'pending' || bookingStep === 'processing') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{event.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{event.venue}, {event.city}</p>
              <p>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} at {event.time}</p>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">{t('booking.selectedSeats')} ({seatIds.length})</p>
              <div className="flex flex-wrap gap-1">
                {seatIds.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('booking.pricePerSeat')}</span>
                <span className="flex items-center"><IndianRupee className="h-3 w-3" />{event.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('booking.seats')}</span>
                <span>× {seatIds.length}</span>
              </div>
              {parkingAllocation && (
                <div className="flex justify-between text-sm text-primary">
                  <span className="flex items-center gap-1"><ParkingCircle className="h-3 w-3" />{t('parking.fee')} ({t('parking.zone')} {parkingAllocation.zone})</span>
                  <span className="flex items-center"><IndianRupee className="h-3 w-3" />{parkingAllocation.fee}</span>
                </div>
              )}

              {/* Wallet Usage Section */}
              {walletBalance > 0 && (
                <div className="flex items-center space-x-2 py-2 border-y border-border my-2">
                  <Checkbox
                    id="use-wallet"
                    checked={useWallet}
                    onCheckedChange={(c) => setUseWallet(c as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label htmlFor="use-wallet" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Use Platform Wallet (₹{walletBalance.toLocaleString('en-IN')})
                    </label>
                  </div>
                </div>
              )}

              {useWallet && creditApplied > 0 && (
                <div className="flex justify-between text-sm text-emerald-500">
                  <span>Wallet Applied</span>
                  <span>- ₹{creditApplied.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                <span>{t('booking.total')}</span>
                <span className="flex items-center"><IndianRupee className="h-5 w-5" />{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Stripe or Wallet-only payment */}
            {totalPrice === 0 ? (
              <div className="space-y-3 pt-2">
                <Button className="w-full" size="lg" onClick={handleWalletOnlyPayment} disabled={bookingStep === 'processing'}>
                  {bookingStep === 'processing' ? (t('booking.waitingApproval') || 'Processing...') : `${t('booking.pay')} ₹0 (Wallet)`}
                </Button>
              </div>
            ) : (
              <Elements stripe={stripePromise}>
                <StripeCheckoutForm
                  amount={totalPrice}
                  onSuccess={handleStripeSuccess}
                  onSlowPayment={handleSlowPayment}
                  disabled={bookingStep === 'processing'}
                />
              </Elements>
            )}
          </CardContent>
        </Card>
      )}

      {/* Slow payment alert */}
      <AlertDialog open={showSlowPrompt} onOpenChange={setShowSlowPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('booking.upiTooLong') || 'Payment is taking too long!'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('booking.switchWalletDesc') || 'We noticed a network delay. Do you want to instantly switch and pay using your EventHub Wallet?'}
              <br /><br />
              <strong>{t('wallet.balance') || 'Your Wallet Balance'}:</strong> ₹{walletBalance.toLocaleString('en-IN')}<br />
              <strong>{t('booking.totalRequired') || 'Total Required'}:</strong> ₹{subTotal.toLocaleString('en-IN')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleContinueWaiting}>{t('booking.continueWait') || 'Continue Waiting'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleSwitchToWallet}>
              {walletBalance >= subTotal ? (t('booking.switchWallet') || "Switch to Wallet") : (t('booking.topUpWallet') || "Top Up Wallet")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <VoiceAssistant messageKey={voiceMessage} />
    </div>
  );
}
