import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  UserRound, 
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
          shortLabel: "Aguard.",
          className: "bg-warning/15 text-warning border-warning/30",
          dotColor: "bg-warning",
          pulse: true,
        };
      case "em_atendimento":
        return {
          label: "Em atendimento",
          shortLabel: "Atend.",
          className: "bg-info/15 text-info border-info/30",
          dotColor: "bg-info",
          pulse: false,
        };
      case "atendido":
        return {
          label: "Concluído",
          shortLabel: "OK",
          className: "bg-success/15 text-success border-success/30",
          dotColor: "bg-success",
          pulse: false,
        };
      default:
        return {
          label: "Agendado",
          shortLabel: "Agend.",
          className: "bg-muted text-muted-foreground border-border",
          dotColor: "bg-muted-foreground",
          pulse: false,
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
    <div className="space-y-1.5 sm:space-y-2">
      {consultas.map((consulta, index) => {
        const statusConfig = getStatusConfig(consulta.status);
        const waitTime = consulta.status === "aguardando" 
          ? getWaitTime(consulta.hora_chegada) 
          : null;
        const animationDelay = index * 60;

        return (
          <div
            key={consulta.id}
            className={cn(
              "group relative flex items-center gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-lg sm:rounded-xl",
              "bg-muted/30 hover:bg-muted/50 transition-all duration-200",
              "border border-transparent hover:border-border",
              "hover:shadow-md sm:hover:translate-x-1",
              "opacity-0 animate-slide-up touch-active",
              "min-h-[52px] sm:min-h-[56px]" // Touch target mínimo
            )}
            style={{ animationDelay: `${animationDelay}ms` }}
          >
            {/* Status dot with optional pulse */}
            <div className="relative shrink-0">
              <div className={cn("w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full", statusConfig.dotColor)} />
              {statusConfig.pulse && (
                <div className={cn(
                  "absolute inset-0 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-ping",
                  statusConfig.dotColor,
                  "opacity-75"
                )} />
              )}
            </div>
            
            {/* Avatar - menor em mobile */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
              <UserRound className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <p className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">
                  {consulta.patients?.name || "Paciente"}
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 font-medium border shrink-0 transition-all duration-200",
                    statusConfig.className
                  )}
                >
                  <span className="sm:hidden">{statusConfig.shortLabel}</span>
                  <span className="hidden sm:inline">{statusConfig.label}</span>
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                <span className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[80px] sm:max-w-none">
                  {consulta.especialidades?.nome || "Consulta"}
                </span>
                <span className="text-muted-foreground hidden sm:inline">•</span>
                <span className="text-[10px] sm:text-xs font-medium">
                  {consulta.hora_inicio?.slice(0, 5)}
                </span>
                {waitTime && (
                  <>
                    <span className="text-muted-foreground hidden sm:inline">•</span>
                    <span className="text-[10px] sm:text-xs text-warning hidden sm:flex items-center gap-1">
                      <Timer className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {waitTime}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {/* Quick actions - Sempre visíveis em mobile, reveal em desktop */}
            <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 sm:translate-x-2 sm:group-hover:translate-x-0">
              {consulta.status === "aguardando" && onChamarPaciente && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs shadow-sm"
                  onClick={() => onChamarPaciente(consulta.id)}
                >
                  <Bell className="h-3 w-3 sm:mr-1" />
                  <span className="hidden sm:inline">Chamar</span>
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                asChild
              >
                <Link to={`/atendimento/${consulta.id}`}>
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
              </Button>
            </div>
            
            {/* Chevron - hidden em mobile */}
            <ChevronRight className="h-4 w-4 text-muted-foreground hidden sm:block opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-2 group-hover:translate-x-0" />
          </div>
        );
      })}
    </div>
  );
}
