import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { MainLayout } from "./components/MainLayout";
import NewDashboard from "./pages/NewDashboard";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import ListaPacientes from "./pages/ListaPacientes";
import MarcarConsulta from "./pages/MarcarConsulta";
import EstornarConsulta from "./pages/EstornarConsulta";
import Appointments from "./pages/Appointments";
import UserManagement from "./pages/UserManagement";
import Atendimento from "./pages/Atendimento";
import PrescriptionList from "./pages/PrescriptionList";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {!session ? (
            <Auth />
          ) : (
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<NewDashboard />} />
                <Route path="patients" element={<Patients />} />
                <Route path="patients/:id" element={<PatientDetail />} />
                <Route path="lista-pacientes" element={<ListaPacientes />} />
                <Route path="marcar-consulta" element={<MarcarConsulta />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="grades" element={<div className="p-8 text-center text-muted-foreground">Grades de Agendamento - Em desenvolvimento</div>} />
                <Route path="prescricao" element={<PrescriptionList />} />
                <Route path="prescription/create/:patientId" element={<div className="p-8 text-center text-muted-foreground">Criar Prescrição - Em desenvolvimento</div>} />
                <Route path="enfermagem" element={<div className="p-8 text-center text-muted-foreground">Enfermagem - Em desenvolvimento</div>} />
                <Route path="importar-sisreg" element={<div className="p-8 text-center text-muted-foreground">Importar SISREG - Em desenvolvimento</div>} />
                <Route path="estornar" element={<EstornarConsulta />} />
                <Route path="atualizar" element={<div className="p-8 text-center text-muted-foreground">Atualizar Consulta - Em desenvolvimento</div>} />
                <Route path="atendimento/:id" element={<Atendimento />} />
                <Route path="cadastros" element={<div className="p-8 text-center text-muted-foreground">Cadastros - Em desenvolvimento</div>} />
                <Route path="pesquisas" element={<div className="p-8 text-center text-muted-foreground">Pesquisas - Em desenvolvimento</div>} />
                <Route path="diaria" element={<div className="p-8 text-center text-muted-foreground">Diária - Em desenvolvimento</div>} />
                <Route path="relatorios" element={<div className="p-8 text-center text-muted-foreground">Relatórios - Em desenvolvimento</div>} />
                <Route path="usuarios" element={<UserManagement />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
