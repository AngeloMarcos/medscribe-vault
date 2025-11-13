import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Activity, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: appointments } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("appointments").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: recentAppointments } = useQuery({
    queryKey: ["recent-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, patients(name)")
        .order("date_time", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const stats = [
    {
      title: "Total de Pacientes",
      value: patients?.length || 0,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Consultas Agendadas",
      value: appointments?.filter((a) => a.status === "agendado").length || 0,
      icon: Calendar,
      color: "text-accent",
    },
    {
      title: "Consultas Realizadas",
      value: appointments?.filter((a) => a.status === "realizado").length || 0,
      icon: Activity,
      color: "text-success",
    },
    {
      title: "Total de Consultas",
      value: appointments?.length || 0,
      icon: FileText,
      color: "text-muted-foreground",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      agendado: "default",
      realizado: "secondary",
      cancelado: "destructive",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral do sistema</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consultas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAppointments && recentAppointments.length > 0 ? (
              recentAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      {appointment.patients?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(appointment.date_time).toLocaleString("pt-BR")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.type === "consulta" ? "Consulta" : "Procedimento"}
                    </p>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">
                Nenhuma consulta encontrada
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
