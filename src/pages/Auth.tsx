import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scale, Loader2, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';

const emailSchema = z.string().trim().email('Invalid email').max(255);
const pwdSchema = z.string().min(8, 'Password must be at least 8 characters').max(128);
const nameSchema = z.string().trim().min(1, 'Name is required').max(100);

export default function Auth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [signin, setSignin] = useState({ email: '', password: '' });
  const [signup, setSignup] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(signin.email);
      pwdSchema.parse(signin.password);
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || 'Invalid input');
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(signin);
    setBusy(false);
    if (error) toast.error(error.message);
    else navigate('/');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      nameSchema.parse(signup.name);
      emailSchema.parse(signup.email);
      pwdSchema.parse(signup.password);
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || 'Invalid input');
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: signup.email,
      password: signup.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: signup.name },
      },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success('Account created! You can now sign in.');
      navigate('/');
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error(result.error.message || `${provider} sign-in failed`);
      return;
    }
    if (result.redirected) return;
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/30 to-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Scale className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t('app.name')}</h1>
          <p className="text-sm text-muted-foreground">{t('app.tagline')}</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">{t('auth.welcome')}</CardTitle>
            <CardDescription>{t('auth.welcomeDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin">{t('auth.signIn')}</TabsTrigger>
                <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="si-email">{t('auth.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="si-email" type="email" autoComplete="email" required className="pl-9"
                        value={signin.email} onChange={e => setSignin({ ...signin, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="si-pwd">{t('auth.password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="si-pwd" type="password" autoComplete="current-password" required className="pl-9"
                        value={signin.password} onChange={e => setSignin({ ...signin, password: e.target.value })} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t('auth.signIn')}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="su-name">{t('auth.fullName')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="su-name" required className="pl-9" maxLength={100}
                        value={signup.name} onChange={e => setSignup({ ...signup, name: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-email">{t('auth.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="su-email" type="email" autoComplete="email" required className="pl-9"
                        value={signup.email} onChange={e => setSignup({ ...signup, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-pwd">{t('auth.password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="su-pwd" type="password" autoComplete="new-password" required minLength={8} className="pl-9"
                        value={signup.password} onChange={e => setSignup({ ...signup, password: e.target.value })} />
                    </div>
                    <p className="text-xs text-muted-foreground">{t('auth.passwordHint')}</p>
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t('auth.signUp')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t('auth.orContinue')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" disabled={busy} onClick={() => handleOAuth('google')}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </Button>
              <Button type="button" variant="outline" disabled={busy} onClick={() => handleOAuth('apple')}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 12.04c-.03-2.74 2.24-4.05 2.34-4.12-1.27-1.86-3.26-2.12-3.96-2.15-1.69-.17-3.29.99-4.15.99-.86 0-2.18-.97-3.59-.94-1.85.03-3.55 1.07-4.5 2.72-1.92 3.34-.49 8.27 1.38 10.97.92 1.32 2.01 2.81 3.43 2.76 1.38-.05 1.9-.89 3.56-.89s2.13.89 3.59.86c1.48-.02 2.42-1.34 3.33-2.67 1.05-1.53 1.49-3.01 1.51-3.09-.03-.01-2.9-1.11-2.94-4.4zM14.36 4.04c.76-.92 1.27-2.2 1.13-3.47-1.09.04-2.41.73-3.19 1.65-.7.81-1.31 2.11-1.15 3.36 1.21.09 2.45-.62 3.21-1.54z"/></svg>
                Apple
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
