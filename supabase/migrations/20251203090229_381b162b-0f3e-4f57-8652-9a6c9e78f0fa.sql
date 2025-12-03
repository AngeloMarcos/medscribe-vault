
-- =====================================================
-- SISTEMA DE CONTROLE DE ACESSO BASEADO EM ROLES (RBAC)
-- =====================================================

-- 1. Criar enum de roles do sistema
CREATE TYPE public.app_role AS ENUM ('admin', 'medico', 'enfermeiro', 'recepcao');

-- 2. Criar tabela de roles de usuários
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- 3. Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Política: usuários só podem ver suas próprias roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 5. Política: apenas admins podem gerenciar roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- 6. Função SECURITY DEFINER para verificar roles (evita recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- 7. Função para verificar se usuário tem qualquer role médica (médico ou enfermeiro)
CREATE OR REPLACE FUNCTION public.has_medical_role(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role IN ('admin', 'medico', 'enfermeiro')
    )
$$;

-- 8. Função para verificar se usuário tem acesso administrativo
CREATE OR REPLACE FUNCTION public.has_admin_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role IN ('admin')
    )
$$;

-- =====================================================
-- ATUALIZAR RLS DAS TABELAS SENSÍVEIS
-- =====================================================

-- PATIENTS: Remover política antiga e criar novas baseadas em role
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.patients;

CREATE POLICY "Medical staff can view patients"
ON public.patients
FOR SELECT
TO authenticated
USING (public.has_medical_role(auth.uid()) OR public.has_role(auth.uid(), 'recepcao'));

CREATE POLICY "Medical staff can insert patients"
ON public.patients
FOR INSERT
TO authenticated
WITH CHECK (public.has_medical_role(auth.uid()) OR public.has_role(auth.uid(), 'recepcao'));

CREATE POLICY "Medical staff can update patients"
ON public.patients
FOR UPDATE
TO authenticated
USING (public.has_medical_role(auth.uid()) OR public.has_role(auth.uid(), 'recepcao'));

-- VITALS: Apenas equipe médica
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.vitals;

CREATE POLICY "Medical staff can manage vitals"
ON public.vitals
FOR ALL
TO authenticated
USING (public.has_medical_role(auth.uid()));

-- ANAMNESES: Apenas equipe médica
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.anamneses;

CREATE POLICY "Medical staff can manage anamneses"
ON public.anamneses
FOR ALL
TO authenticated
USING (public.has_medical_role(auth.uid()));

-- EVOLUTIONS: Apenas equipe médica
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.evolutions;

CREATE POLICY "Medical staff can manage evolutions"
ON public.evolutions
FOR ALL
TO authenticated
USING (public.has_medical_role(auth.uid()));

-- PROCEDURES: Apenas equipe médica
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.procedures;

CREATE POLICY "Medical staff can manage procedures"
ON public.procedures
FOR ALL
TO authenticated
USING (public.has_medical_role(auth.uid()));

-- REPORTS: Apenas equipe médica
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.reports;

CREATE POLICY "Medical staff can manage reports"
ON public.reports
FOR ALL
TO authenticated
USING (public.has_medical_role(auth.uid()));

-- EXAM_REQUESTS: Apenas equipe médica
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.exam_requests;

CREATE POLICY "Medical staff can manage exam_requests"
ON public.exam_requests
FOR ALL
TO authenticated
USING (public.has_medical_role(auth.uid()));

-- APPOINTMENTS: Equipe médica e recepção
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.appointments;

CREATE POLICY "Staff can view appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (public.has_medical_role(auth.uid()) OR public.has_role(auth.uid(), 'recepcao'));

CREATE POLICY "Staff can insert appointments"
ON public.appointments
FOR INSERT
TO authenticated
WITH CHECK (public.has_medical_role(auth.uid()) OR public.has_role(auth.uid(), 'recepcao'));

CREATE POLICY "Staff can update appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (public.has_medical_role(auth.uid()) OR public.has_role(auth.uid(), 'recepcao'));

CREATE POLICY "Staff can delete appointments"
ON public.appointments
FOR DELETE
TO authenticated
USING (public.has_medical_role(auth.uid()) OR public.has_role(auth.uid(), 'recepcao'));

-- CONSULTAS: Equipe médica e recepção
DROP POLICY IF EXISTS "Authenticated users can read consultas" ON public.consultas;
DROP POLICY IF EXISTS "Authenticated users can insert consultas" ON public.consultas;
DROP POLICY IF EXISTS "Authenticated users can update consultas" ON public.consultas;

CREATE POLICY "Staff can view consultas"
ON public.consultas
FOR SELECT
TO authenticated
USING (public.has_medical_role(auth.uid()) OR public.has_role(auth.uid(), 'recepcao'));

CREATE POLICY "Staff can insert consultas"
ON public.consultas
FOR INSERT
TO authenticated
WITH CHECK (public.has_medical_role(auth.uid()) OR public.has_role(auth.uid(), 'recepcao'));

CREATE POLICY "Staff can update consultas"
ON public.consultas
FOR UPDATE
TO authenticated
USING (public.has_medical_role(auth.uid()) OR public.has_role(auth.uid(), 'recepcao'));

-- ATENDIMENTOS: Apenas equipe médica
DROP POLICY IF EXISTS "Authenticated users can read atendimentos" ON public.atendimentos;
DROP POLICY IF EXISTS "Authenticated users can insert atendimentos" ON public.atendimentos;
DROP POLICY IF EXISTS "Authenticated users can update atendimentos" ON public.atendimentos;

CREATE POLICY "Medical staff can manage atendimentos"
ON public.atendimentos
FOR ALL
TO authenticated
USING (public.has_medical_role(auth.uid()));

-- PROFISSIONAIS: Todos podem ver, apenas admin pode editar
DROP POLICY IF EXISTS "Authenticated users can read profissionais" ON public.profissionais;
DROP POLICY IF EXISTS "Authenticated users can insert profissionais" ON public.profissionais;
DROP POLICY IF EXISTS "Authenticated users can update profissionais" ON public.profissionais;

CREATE POLICY "All staff can view profissionais"
ON public.profissionais
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert profissionais"
ON public.profissionais
FOR INSERT
TO authenticated
WITH CHECK (public.has_admin_access(auth.uid()));

CREATE POLICY "Admins can update profissionais"
ON public.profissionais
FOR UPDATE
TO authenticated
USING (public.has_admin_access(auth.uid()));

-- ESTORNOS_CONSULTAS: Equipe médica e recepção podem ver, inserir
DROP POLICY IF EXISTS "Authenticated users can read estornos" ON public.estornos_consultas;
DROP POLICY IF EXISTS "Authenticated users can insert estornos" ON public.estornos_consultas;

CREATE POLICY "Staff can view estornos"
ON public.estornos_consultas
FOR SELECT
TO authenticated
USING (public.has_medical_role(auth.uid()) OR public.has_role(auth.uid(), 'recepcao'));

CREATE POLICY "Staff can insert estornos"
ON public.estornos_consultas
FOR INSERT
TO authenticated
WITH CHECK (public.has_medical_role(auth.uid()) OR public.has_role(auth.uid(), 'recepcao'));

-- GRADES_HORARIOS: Todos podem ver, apenas admin pode gerenciar
DROP POLICY IF EXISTS "Authenticated users can read grades_horarios" ON public.grades_horarios;
DROP POLICY IF EXISTS "Authenticated users can insert grades" ON public.grades_horarios;
DROP POLICY IF EXISTS "Authenticated users can update grades" ON public.grades_horarios;

CREATE POLICY "All staff can view grades"
ON public.grades_horarios
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert grades"
ON public.grades_horarios
FOR INSERT
TO authenticated
WITH CHECK (public.has_admin_access(auth.uid()));

CREATE POLICY "Admins can update grades"
ON public.grades_horarios
FOR UPDATE
TO authenticated
USING (public.has_admin_access(auth.uid()));

-- EQUIPES: Todos podem ver, apenas admin pode gerenciar
DROP POLICY IF EXISTS "Authenticated users can read equipes" ON public.equipes;
DROP POLICY IF EXISTS "Authenticated users can insert equipes" ON public.equipes;
DROP POLICY IF EXISTS "Authenticated users can update equipes" ON public.equipes;

CREATE POLICY "All staff can view equipes"
ON public.equipes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert equipes"
ON public.equipes
FOR INSERT
TO authenticated
WITH CHECK (public.has_admin_access(auth.uid()));

CREATE POLICY "Admins can update equipes"
ON public.equipes
FOR UPDATE
TO authenticated
USING (public.has_admin_access(auth.uid()));

-- Índice para performance nas consultas de roles
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
