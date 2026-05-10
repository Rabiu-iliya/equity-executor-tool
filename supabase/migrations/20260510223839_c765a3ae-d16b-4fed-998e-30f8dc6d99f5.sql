
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Cases
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deceased_name TEXT NOT NULL,
  deceased_date DATE,
  notes TEXT,
  total_estate NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cases_select_own" ON public.cases FOR SELECT USING (auth.uid() = admin_id);
CREATE POLICY "cases_insert_own" ON public.cases FOR INSERT WITH CHECK (auth.uid() = admin_id);
CREATE POLICY "cases_update_own" ON public.cases FOR UPDATE USING (auth.uid() = admin_id);
CREATE POLICY "cases_delete_own" ON public.cases FOR DELETE USING (auth.uid() = admin_id);
CREATE INDEX idx_cases_admin ON public.cases(admin_id);

-- Heirs
CREATE TABLE public.heirs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  share_fraction TEXT DEFAULT '',
  share_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.heirs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "heirs_select_own" ON public.heirs FOR SELECT USING (auth.uid() = admin_id);
CREATE POLICY "heirs_insert_own" ON public.heirs FOR INSERT WITH CHECK (auth.uid() = admin_id);
CREATE POLICY "heirs_update_own" ON public.heirs FOR UPDATE USING (auth.uid() = admin_id);
CREATE POLICY "heirs_delete_own" ON public.heirs FOR DELETE USING (auth.uid() = admin_id);
CREATE INDEX idx_heirs_case ON public.heirs(case_id);

-- Assets
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assets_select_own" ON public.assets FOR SELECT USING (auth.uid() = admin_id);
CREATE POLICY "assets_insert_own" ON public.assets FOR INSERT WITH CHECK (auth.uid() = admin_id);
CREATE POLICY "assets_update_own" ON public.assets FOR UPDATE USING (auth.uid() = admin_id);
CREATE POLICY "assets_delete_own" ON public.assets FOR DELETE USING (auth.uid() = admin_id);
CREATE INDEX idx_assets_case ON public.assets(case_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER cases_touch BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
