import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { Menu, X, Ticket, LogOut, LayoutDashboard, Wallet } from 'lucide-react';
import { useState } from 'react';
import { useCreditBalance } from '@/hooks/useCredits';

export default function Header() {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: balance = 0 } = useCreditBalance();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
          <Ticket className="h-6 w-6 text-primary" />
          EventHub
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4">
          <Link to="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('common.exploreEvents')}
          </Link>
          <Link to="/map" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('common.map')}
          </Link>
          <LanguageSelector />
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/wallet">
                <Button variant="ghost" size="sm" className="text-secondary-foreground font-semibold">
                  <Wallet className="h-4 w-4 mr-1 text-primary" />₹{balance.toLocaleString('en-IN')}
                </Button>
              </Link>
              <Link to="/admin">
                <Button variant="ghost" size="sm"><LayoutDashboard className="h-4 w-4 mr-1" />{t('common.admin')}</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-1" />{t('common.signOut')}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>{t('common.signIn')}</Button>
              <Button size="sm" onClick={() => navigate('/register')}>{t('common.signUp')}</Button>
            </div>
          )}
        </nav>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSelector />
          <button className="p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
          <Link to="/search" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>{t('common.exploreEvents')}</Link>
          <Link to="/map" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>{t('common.map')}</Link>
          {user ? (
            <>
              <Link to="/wallet" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>Wallet (₹{balance.toLocaleString('en-IN')})</Link>
              <Link to="/admin" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>{t('common.admin')}</Link>
              <button className="block text-sm font-medium text-destructive" onClick={() => { signOut(); setMobileOpen(false); }}>{t('common.signOut')}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>{t('common.signIn')}</Link>
              <Link to="/register" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>{t('common.signUp')}</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
