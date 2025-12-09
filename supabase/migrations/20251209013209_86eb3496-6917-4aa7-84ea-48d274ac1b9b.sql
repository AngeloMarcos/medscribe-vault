-- PARTE 1: Expandir enum app_role com novos roles
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'farmaceutico';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'tecnico_enfermagem';

-- PARTE 2: Criar tabela profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  professional_id TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para busca por email
CREATE INDEX idx_profiles_email ON profiles(email);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert profiles" ON profiles
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete profiles" ON profiles
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- PARTE 3: Trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger no auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PARTE 4: Criar tabela user_activity_log
CREATE TABLE public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON user_activity_log(created_at DESC);
CREATE INDEX idx_activity_log_action ON user_activity_log(action);

-- Habilitar RLS
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Políticas para activity_log
CREATE POLICY "Users can view own logs" ON user_activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all logs" ON user_activity_log
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can insert logs" ON user_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- PARTE 5: Função has_permission
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  SELECT role INTO user_role
  FROM user_roles
  WHERE user_id = _user_id
  LIMIT 1;
  
  -- Admin tem todas as permissões
  IF user_role = 'admin' THEN 
    RETURN true; 
  END IF;
  
  -- Mapeamento de permissões por role
  RETURN CASE _permission
    WHEN 'prescribe' THEN user_role = 'medico'
    WHEN 'view_patients' THEN user_role IN ('medico', 'enfermeiro', 'recepcao', 'tecnico_enfermagem')
    WHEN 'clinical_docs' THEN user_role IN ('medico', 'enfermeiro')
    WHEN 'request_exams' THEN user_role = 'medico'
    WHEN 'administer_meds' THEN user_role IN ('enfermeiro', 'tecnico_enfermagem')
    WHEN 'view_prescriptions' THEN user_role IN ('medico', 'enfermeiro', 'farmaceutico', 'tecnico_enfermagem')
    WHEN 'vital_signs' THEN user_role IN ('enfermeiro', 'tecnico_enfermagem')
    WHEN 'nursing_notes' THEN user_role IN ('enfermeiro', 'tecnico_enfermagem')
    WHEN 'dispense' THEN user_role = 'farmaceutico'
    WHEN 'stock_control' THEN user_role = 'farmaceutico'
    WHEN 'patient_registration' THEN user_role = 'recepcao'
    WHEN 'scheduling' THEN user_role IN ('recepcao', 'enfermeiro')
    ELSE false
  END;
END;
$$;