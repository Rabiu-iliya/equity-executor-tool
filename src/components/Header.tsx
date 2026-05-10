import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { languages } from '@/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LayoutDashboard, Plus, Moon, Sun, Scale, Menu, LogOut, UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('gadopro_theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const saved = localStorage.getItem('gadopro_theme');
    if (saved === 'dark') setDark(true);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      <Button variant={location.pathname === '/' ? 'default' : 'ghost'} size="sm" asChild onClick={onClick}>
        <Link to="/"><LayoutDashboard className="me-1 h-4 w-4" />{t('nav.dashboard')}</Link>
      </Button>
      <Button variant={location.pathname === '/case/new' ? 'default' : 'ghost'} size="sm" asChild onClick={onClick}>
        <Link to="/case/new"><Plus className="me-1 h-4 w-4" />{t('nav.newCase')}</Link>
      </Button>
    </>
  );

  const initials = (user?.user_metadata?.full_name || user?.email || 'U')
    .toString().split(/[\s@]+/).map((p: string) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-14 sm:h-16 items-center justify-between gap-2 px-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shrink-0">
            <Scale className="h-5 w-5" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight truncate">{t('app.name')}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Language selector — compact on mobile */}
          <Select value={i18n.language} onValueChange={(v) => i18n.changeLanguage(v)}>
            <SelectTrigger className="w-[64px] sm:w-[130px] h-9">
              <SelectValue>{languages.find(l => l.code === i18n.language)?.code.toUpperCase() || 'EN'}</SelectValue>
            </SelectTrigger>
            <SelectContent align="end" className="max-h-80">
              {languages.map((l) => (
                <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" className="h-9 w-9 hidden sm:inline-flex" onClick={() => setDark(!dark)}>
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 hidden sm:inline-flex">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                    {initials}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium truncate">{user.user_metadata?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="me-2 h-4 w-4" /> {t('auth.signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile menu */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" /> {t('app.name')}
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-6">
                <NavLinks onClick={() => setMenuOpen(false)} />
                <Button variant="ghost" size="sm" className="justify-start" onClick={() => { setDark(!dark); }}>
                  {dark ? <Sun className="me-2 h-4 w-4" /> : <Moon className="me-2 h-4 w-4" />}
                  {t('nav.darkMode')}
                </Button>
                {user && (
                  <>
                    <div className="border-t pt-3 mt-2">
                      <div className="flex items-center gap-2 px-2 py-1">
                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="justify-start text-destructive" onClick={() => { setMenuOpen(false); handleSignOut(); }}>
                      <LogOut className="me-2 h-4 w-4" /> {t('auth.signOut')}
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
