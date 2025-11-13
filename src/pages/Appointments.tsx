import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AddAppointmentDialog from "@/components/AddAppointmentDialog";

const Appointments = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: appointments, refetch } = useQuery({
    queryKey: ["all-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, patients(name)")
        .order("date_time", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

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

  const groupedAppointments = appointments?.reduce((acc, appointment) => {
    const date = new Date(appointment.date_time).toLocaleDateString("pt-BR");
    if (!acc[date]) acc[date] = [];
    acc[date].push(appointment);
    return acc;
  }, {} as Record<string, typeof appointments>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Agenda</h2>
          <p className="text-muted-foreground">Gerencie as consultas e procedimentos</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Consulta
        </Button>
      </div>

      <div className="space-y-6">
        {groupedAppointments &&
          Object.entries(groupedAppointments).map(([date, dayAppointments]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="text-lg">{date}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{appointment.patients?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(appointment.date_time).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" • "}
                        {appointment.type === "consulta" ? "Consulta" : "Procedimento"}
                      </p>
                      {appointment.description && (
                        <p className="text-sm text-muted-foreground">
                          {appointment.description}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

        {(!appointments || appointments.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma consulta agendada</p>
          </div>
        )}
      </div>

      <AddAppointmentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={refetch}
      />
    </div>
  );
};

export default Appointments;
