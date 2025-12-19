import { Toaster } from "@/components/ui/toaster";
import CreatePrescription from "./pages/CreatePrescription";
import MaintainPrescription from "./pages/MaintainPrescription";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { ModuleProvider } from "@/contexts/ModuleContext";
import { MainLayout } from "./components/MainLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { UnderConstruction } from "./components/UnderConstruction";
import NewDashboard from "./pages/NewDashboard";
import MyProfile from "./pages/MyProfile";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import ListaPacientes from "./pages/ListaPacientes";
import MarcarConsulta from "./pages/MarcarConsulta";
import EstornarConsulta from "./pages/EstornarConsulta";
import Appointments from "./pages/Appointments";
import AgendarOdonto from "./pages/AgendarOdonto";
import ListaPacientesOdonto from "./pages/ListaPacientesOdonto";
import Odontograma from "./pages/Odontograma";
import PlanoTratamentoOdonto from "./pages/PlanoTratamentoOdonto";
import AdminUserManagement from "./pages/admin/UserManagement";
import UserPermissions from "./pages/admin/UserPermissions";
import AuditLogs from "./pages/admin/AuditLogs";
import Atendimento from "./pages/Atendimento";
import PrescriptionList from "./pages/PrescriptionList";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Enfermagem from "./pages/Enfermagem";
import PainelChamador from "./pages/PainelChamador";
import Relatorios from "./pages/Relatorios";
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <TenantProvider>
              <ModuleProvider>
                <BrowserRouter>
                  <ErrorBoundary>
                <Routes>
                  {/* Public routes */}
                  <Route path="/auth" element={<Auth />} />

                  {/* Protected routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <MainLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<NewDashboard />} />
                    <Route path="patients" element={<Patients />} />
                    <Route path="patients/:id" element={<PatientDetail />} />
                    <Route path="lista-pacientes" element={<ListaPacientes />} />
                    <Route path="marcar-consulta" element={<MarcarConsulta />} />
                    <Route path="appointments" element={<Appointments />} />
                    <Route path="grades" element={<UnderConstruction title="Grades de Agendamento" />} />

                    {/* Odontologia Routes */}
                    <Route path="odonto/agendar" element={<AgendarOdonto />} />
                    <Route path="odonto/pacientes" element={<ListaPacientesOdonto />} />
                    <Route path="odonto/odontograma" element={<Odontograma />} />
                    <Route path="odonto/tratamento" element={<PlanoTratamentoOdonto />} />

                    {/* Prescription Routes - Protected for medical staff */}
                    <Route
                      path="prescription"
                      element={
                        <ProtectedRoute requireMedical>
                          <PrescriptionList />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="prescription/list" element={<Navigate to="/prescription" replace />} />
                    <Route
                      path="prescription/create/:patientId"
                      element={
                        <ProtectedRoute requireMedical>
                          <CreatePrescription />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="prescription/maintain/:patientId"
                      element={
                        <ProtectedRoute requireMedical>
                          <MaintainPrescription />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="prescription/maintain/:patientId/:prescriptionId"
                      element={
                        <ProtectedRoute requireMedical>
                          <MaintainPrescription />
                        </ProtectedRoute>
                      }
                    />
                    {/* Legacy route redirect */}
                    <Route path="prescricao" element={<Navigate to="/prescription" replace />} />

                    <Route path="enfermagem" element={<Enfermagem />} />
                    <Route path="painel-chamador" element={<PainelChamador />} />
                    <Route path="farmacia" element={<UnderConstruction title="Farmácia" />} />
                    <Route path="importar-sisreg" element={<UnderConstruction title="Importar SISREG" />} />
                    <Route path="estornar" element={<EstornarConsulta />} />
                    <Route path="atualizar" element={<UnderConstruction title="Atualizar Consulta" />} />
                    <Route path="atendimento/:id" element={<Atendimento />} />
                    <Route path="cadastros" element={<UnderConstruction title="Cadastros" />} />
                    <Route path="pesquisas" element={<UnderConstruction title="Pesquisas" />} />
                    <Route path="diaria" element={<UnderConstruction title="Diária" />} />
                    <Route path="relatorios" element={<Relatorios />} />

                    {/* Admin routes */}
                    <Route
                      path="usuarios"
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminUserManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="permissoes"
                      element={
                        <ProtectedRoute requireAdmin>
                          <UserPermissions />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="auditoria"
                      element={
                        <ProtectedRoute requireAdmin>
                          <AuditLogs />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="perfil" element={<MyProfile />} />
                  </Route>

                  {/* Catch-all redirect */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                  </ErrorBoundary>
                </BrowserRouter>
              </ModuleProvider>
            </TenantProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
