import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCreditBalance, useUnifiedLedger } from '@/hooks/useCredits';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { IndianRupee, ArrowUpRight, ArrowDownLeft, Clock, Info, Plus, Ticket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useTopUpWallet } from '@/hooks/useBookings';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function WalletPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { data: balance = 0, isLoading: balanceLoading, refetch: refetchBalance } = useCreditBalance();
  const { data: ledger = [], isLoading: ledgerLoading, refetch: refetchLedger } = useUnifiedLedger();
  const topUpWallet = useTopUpWallet();
  const [isToppingUp, setIsToppingUp] = useState(false);

  if (!user) {
    return (
      <div className="container py-16 text-center text-muted-foreground">
        {t('common.pleaseSignIn') || "Please sign in to view your Wallet."}
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-12 space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-display font-bold">{t('wallet.title') || "Platform Wallet"}</h1>
        <p className="text-muted-foreground">{t('wallet.desc') || "Manage your booking credits and payment recoveries."}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-0 animate-[fade-in_0.5s_ease-out_0.2s_forwards]">
        {/* Balance Card */}
        <Card className="md:col-span-1 bg-primary/5 border-primary/20 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2 text-primary">
              <IndianRupee className="h-5 w-5" /> {t('wallet.availableBalance') || "Available Balance"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <div className="h-10 w-24 bg-muted animate-pulse rounded-md" />
            ) : (
              <div className="text-5xl font-bold tracking-tight">₹{balance.toLocaleString('en-IN')}</div>
            )}
            <div className="flex flex-col gap-4 mt-6">
              <p className="text-xs text-muted-foreground flex items-start gap-1">
                <Info className="h-4 w-4 shrink-0" />
                {t('wallet.balanceInfo') || "Use this balance at checkout for fast and secure transactions without waiting for bank gateways."}
              </p>
              
              <div className="border-t border-border pt-4">
                <p className="font-semibold text-sm mb-3">{t('wallet.addFunds') || "Add Funds (Mock Netbanking)"}</p>
                <div className="flex flex-wrap gap-2">
                  {[500, 1000, 2000].map(amount => (
                    <Button 
                      key={amount} 
                      variant="outline" 
                      size="sm"
                      disabled={isToppingUp}
                      onClick={async () => {
                        if (!user) return;
                        setIsToppingUp(true);
                        try {
                          await topUpWallet.mutateAsync({ userId: user.id, amount });
                          toast({ title: t('wallet.topUpSuccess') || 'Top Up Successful', description: `₹${amount} added directly to your EventHub Wallet.` });
                          refetchBalance();
                          refetchLedger();
                        } catch (err: any) {
                          toast({ title: 'Top Up Failed', description: err.message, variant: 'destructive' });
                        } finally {
                          setIsToppingUp(false);
                        }
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" /> ₹{amount}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ledger Transactions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t('wallet.transactionHistory') || "Account Transactions"}</CardTitle>
            <CardDescription>{t('wallet.transactionDesc') || "Recent bookings, credit issuances and usage"}</CardDescription>
          </CardHeader>
          <CardContent>
            {ledgerLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />)}
              </div>
            ) : ledger.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                <Clock className="h-12 w-12 mb-3 opacity-20" />
                <p>{t('wallet.noTransactions') || "No transactions yet."}</p>
                <p className="text-sm">{t('wallet.noTxDesc') || "Credits from recovered/failed payments will appear here."}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ledger.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full flex items-center justify-center ${tx.type === 'issue' ? 'bg-emerald-500/10 text-emerald-500' : tx.type === 'booking' ? 'bg-primary/10 text-primary' : 'bg-rose-500/10 text-rose-500'}`}>
                        {tx.type === 'issue' ? <ArrowDownLeft className="h-5 w-5" /> : tx.type === 'booking' ? <Ticket className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {tx.type === 'issue' ? (t('wallet.creditReceived') || 'Credit Received') : tx.type === 'use' ? (t('wallet.paymentUsingWallet') || 'Payment Using Wallet') : tx.label}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {format(new Date(tx.timestamp), 'MMM dd, yyyy • hh:mm a')}
                        </p>
                        {tx.isCredit && tx.linked_attempt_id && (
                          <Badge variant="outline" className="mt-1 text-[10px] px-1 py-0 h-4">Recovery Attempt</Badge>
                        )}
                      </div>
                    </div>
                    <div className={`text-lg font-semibold ${tx.type === 'issue' ? 'text-emerald-500' : 'text-foreground'}`}>
                      {tx.type === 'issue' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
