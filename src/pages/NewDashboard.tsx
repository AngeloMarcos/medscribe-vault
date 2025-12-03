import {
  Users,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  Activity,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockAppointments, mockPatients } from "@/data/mockData";
import { Link } from "react-router-dom";

const stats = [
  {
    title: "Pacientes Hoje",
    value: mockAppointments.length,
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Aguardando",
    value: mockAppointments.filter((a) => a.status === "aguardando").length,
    icon: Clock,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    title: "Em Atendimento",
    value: mockAppointments.filter((a) => a.status === "em_atendimento").length,
    icon: Activity,
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    title: "Atendidos",
    value: mockAppointments.filter((a) => a.status === "atendido").length,
    icon: UserCheck,
    color: "text-success",
    bgColor: "bg-success/10",
  },
];

const upcomingAppointments = mockAppointments
  .filter((a) => a.status === "agendado" || a.status === "aguardando")
  .slice(0, 5);

export default function NewDashboard() {
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel Geral</h1>
          <p className="text-muted-foreground capitalize">{today}</p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/marcar-consulta">Nova Consulta</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/lista-pacientes">Ver Lista de Pacientes</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="card-neumorphic">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <Card className="card-neumorphic lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Próximos Atendimentos</CardTitle>
              <CardDescription>Pacientes agendados para hoje</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/lista-pacientes">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{apt.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {apt.especialidade} • Sala {apt.sala}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{apt.hora}</p>
                    <Badge
                      variant="secondary"
                      className={
                        apt.status === "aguardando"
                          ? "bg-warning/20 text-warning"
                          : "bg-muted"
                      }
                    >
                      {apt.status === "aguardando" ? "Aguardando" : "Agendado"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="card-neumorphic">
            <CardHeader>
              <CardTitle className="text-lg">Resumo do Dia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Cadastrados</span>
                <span className="font-semibold">{mockPatients.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ausentes</span>
                <span className="font-semibold text-destructive">
                  {mockAppointments.filter((a) => a.status === "ausente").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pendentes</span>
                <span className="font-semibold text-warning">
                  {mockAppointments.filter((a) => a.status === "pendente").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Taxa Comparecimento</span>
                <span className="font-semibold text-success">85%</span>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="card-neumorphic border-warning/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                <CardTitle className="text-lg">Alertas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-warning/10 text-sm">
                <p className="font-medium text-warning">Exame Pendente</p>
                <p className="text-muted-foreground">
                  Ana Paula - Resultado de hemograma
                </p>
              </div>
              <div className="p-3 rounded-lg bg-info/10 text-sm">
                <p className="font-medium text-info">Retorno Agendado</p>
                <p className="text-muted-foreground">
                  João Silva - Cardiologia às 15:00
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
