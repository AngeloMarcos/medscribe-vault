import { useAdminAccess } from '@/hooks/useAdminAccess';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Stethoscope, DoorOpen, UsersRound, MapPin, Loader2, ShieldAlert } from 'lucide-react';
import { ProfissionaisTab } from '@/components/cadastros/ProfissionaisTab';
import { EspecialidadesTab } from '@/components/cadastros/EspecialidadesTab';
import { SalasTab } from '@/components/cadastros/SalasTab';
import { EquipesTab } from '@/components/cadastros/EquipesTab';
import { ZonasTab } from '@/components/cadastros/ZonasTab';

export default function Cadastros() {
  const { isAdmin, isLoading } = useAdminAccess();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Acesso Restrito</h2>
              <p className="text-muted-foreground">
                Você não tem permissão para acessar esta página.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
          Cadastros do Estabelecimento
        </h1>
        <p className="text-muted-foreground">
          Gerencie profissionais, especialidades, salas, equipes e zonas
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profissionais" className="space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
          <TabsList className="w-max min-w-full lg:w-auto">
            <TabsTrigger value="profissionais" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Profissionais</span>
              <span className="sm:hidden">Prof.</span>
            </TabsTrigger>
            <TabsTrigger value="especialidades" className="gap-2">
              <Stethoscope className="h-4 w-4" />
              <span className="hidden sm:inline">Especialidades</span>
              <span className="sm:hidden">Espec.</span>
            </TabsTrigger>
            <TabsTrigger value="salas" className="gap-2">
              <DoorOpen className="h-4 w-4" />
              Salas
            </TabsTrigger>
            <TabsTrigger value="equipes" className="gap-2">
              <UsersRound className="h-4 w-4" />
              Equipes
            </TabsTrigger>
            <TabsTrigger value="zonas" className="gap-2">
              <MapPin className="h-4 w-4" />
              Zonas
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profissionais">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Profissionais de Saúde</CardTitle>
              <CardDescription>
                Cadastre médicos, dentistas, enfermeiros e outros profissionais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfissionaisTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="especialidades">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Especialidades Médicas</CardTitle>
              <CardDescription>
                Gerencie as especialidades disponíveis no estabelecimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EspecialidadesTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salas">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Salas e Consultórios</CardTitle>
              <CardDescription>Cadastre salas de atendimento, exames e procedimentos</CardDescription>
            </CardHeader>
            <CardContent>
              <SalasTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipes">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Equipes de Atendimento</CardTitle>
              <CardDescription>Organize os profissionais em equipes de trabalho</CardDescription>
            </CardHeader>
            <CardContent>
              <EquipesTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zonas">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Zonas de Atendimento</CardTitle>
              <CardDescription>Defina áreas geográficas ou setores de atendimento</CardDescription>
            </CardHeader>
            <CardContent>
              <ZonasTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
