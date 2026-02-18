import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { languages } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutDashboard, Plus, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('gadopro_theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const saved = localStorage.getItem('gadopro_theme');
    if (saved === 'dark') setDark(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            G
          </div>
          <span className="text-xl font-bold tracking-tight">{t('app.name')}</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Button variant={location.pathname === '/' ? 'default' : 'ghost'} size="sm" asChild>
            <Link to="/"><LayoutDashboard className="mr-1 h-4 w-4" />{t('nav.dashboard')}</Link>
          </Button>
          <Button variant={location.pathname === '/case/new' ? 'default' : 'ghost'} size="sm" asChild>
            <Link to="/case/new"><Plus className="mr-1 h-4 w-4" />{t('nav.newCase')}</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <Select value={i18n.language} onValueChange={(v) => i18n.changeLanguage(v)}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setDark(!dark)}>
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
