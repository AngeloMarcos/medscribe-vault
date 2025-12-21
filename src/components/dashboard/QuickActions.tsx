import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  UserRound, 
  Clock, 
  FileText, 
  Bell,
  ChevronRight,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Consulta {
  id: string;
  hora_inicio: string;
  hora_chegada?: string | null;
  status: string;
  patients?: { name: string; medical_record_number?: string | null } | null;
  especialidades?: { nome: string } | null;
  salas?: { numero: string } | null;
  profissionais?: { nome: string } | null;
}

interface QuickActionsProps {
  consultas: Consulta[];
  onChamarPaciente?: (consultaId: string) => void;
}

export function QuickActions({ consultas, onChamarPaciente }: QuickActionsProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "aguardando":
        return {
          label: "Aguardando",
          className: "bg-warning/15 text-warning border-warning/30",
          dotColor: "bg-warning",
        };
      case "em_atendimento":
        return {
          label: "Em atendimento",
          className: "bg-info/15 text-info border-info/30",
          dotColor: "bg-info",
        };
      case "finalizado":
        return {
          label: "Concluído",
          className: "bg-success/15 text-success border-success/30",
          dotColor: "bg-success",
        };
      default:
        return {
          label: "Agendado",
          className: "bg-muted text-muted-foreground border-border",
          dotColor: "bg-muted-foreground",
        };
    }
  };

  const getWaitTime = (horaChegada: string | null | undefined) => {
    if (!horaChegada) return null;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const chegadaDate = new Date(`${today}T${horaChegada}`);
      return formatDistanceToNow(chegadaDate, { locale: ptBR, addSuffix: false });
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-2">
      {consultas.map((consulta) => {
        const statusConfig = getStatusConfig(consulta.status);
        const waitTime = consulta.status === "aguardando" 
          ? getWaitTime(consulta.hora_chegada) 
          : null;

        return (
          <div
            key={consulta.id}
            className={cn(
              "group relative flex items-center gap-3 p-4 rounded-xl",
              "bg-muted/30 hover:bg-muted/50 transition-all duration-200",
              "border border-transparent hover:border-border"
            )}
          >
            {/* Status dot */}
            <div className={cn("w-2 h-2 rounded-full shrink-0", statusConfig.dotColor)} />
            
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              <UserRound className="h-5 w-5 text-secondary" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-label font-medium truncate">
                  {consulta.patients?.name || "Paciente"}
                </p>
                <Badge
                  variant="outline"
                  className={cn("text-[10px] px-1.5 py-0 font-medium border shrink-0", statusConfig.className)}
                >
                  {statusConfig.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-caption truncate">
                  {consulta.especialidades?.nome || "Consulta"}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-caption font-medium">
                  {consulta.hora_inicio?.slice(0, 5)}
                </span>
                {waitTime && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-caption text-warning flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {waitTime}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {/* Quick actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {consulta.status === "aguardando" && onChamarPaciente && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 px-3 text-xs"
                  onClick={() => onChamarPaciente(consulta.id)}
                >
                  <Bell className="h-3 w-3 mr-1" />
                  Chamar
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                asChild
              >
                <Link to={`/atendimento/${consulta.id}`}>
                  <FileText className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            {/* Chevron for navigation */}
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        );
      })}
    </div>
  );
}
