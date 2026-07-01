import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { AnimatedNumber } from "./AnimatedNumber";
import { Smile, Activity, UserPlus, Wallet, AlertOctagon, ClipboardList } from "lucide-react";
import { startOfMonth, format } from "date-fns";
import { Link } from "react-router-dom";

function KpiRow({
  icon: Icon,
  label,
  value,
  suffix,
  variant = "default",
  isLoading,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  variant?: "default" | "success" | "warning" | "destructive" | "info";
  isLoading?: boolean;
}) {
  const colorMap: Record<string, string> = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
    info: "text-primary",
  };
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 rounded-lg bg-background/80 border border-border/60">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-xs sm:text-sm text-muted-foreground truncate">{label}</span>
      </div>
      {isLoading ? (
        <Skeleton className="h-5 w-12" />
      ) : (
        <span className={`text-sm sm:text-base font-semibold ${colorMap[variant]}`}>
          {suffix === "R$" ? (
            <>R$ <AnimatedNumber value={value} /></>
          ) : (
            <>
              <AnimatedNumber value={value} />
              {suffix ? <span className="text-xs text-muted-foreground ml-1">{suffix}</span> : null}
            </>
          )}
        </span>
      )}
    </div>
  );
}

export function ModuleInsights() {
  const { tenant } = useTenant();
  const startMonth = format(startOfMonth(new Date()), "yyyy-MM-dd");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-module-insights", tenant?.id, startMonth],
    enabled: !!tenant?.id,
    queryFn: async () => {
      const t = tenant!.id;

      const [
        newPatients,
        planosAtivos,
        planItens,
        filaAtiva,
        notasCriticas,
        encaminhamentosPend,
        odontogramas,
      ] = await Promise.all([
        supabase.from("patients").select("id", { count: "exact", head: true })
          .eq("tenant_id", t).gte("created_at", startMonth),
        supabase.from("planos_tratamento_odonto").select("id", { count: "exact", head: true })
          .eq("tenant_id", t).in("status", ["aprovado", "em_andamento"]),
        supabase.from("itens_plano_tratamento").select("valor_final").eq("tenant_id", t),
        supabase.from("nursing_queue").select("id", { count: "exact", head: true })
          .eq("tenant_id", t).in("status", ["waiting", "in_progress"]),
        supabase.from("nursing_notes").select("id", { count: "exact", head: true })
          .eq("tenant_id", t).eq("is_critical", true).gte("created_at", startMonth),
        supabase.from("encaminhamentos").select("id", { count: "exact", head: true })
          .eq("tenant_id", t).eq("status", "pendente"),
        supabase.from("odontogramas").select("id", { count: "exact", head: true }).eq("tenant_id", t),
      ]);

      const receitaOdonto = Math.round(
        (planItens.data || []).reduce((sum, i) => sum + Number(i.valor_final || 0), 0)
      );

      return {
        newPatients: newPatients.count || 0,
        planosAtivos: planosAtivos.count || 0,
        receitaOdonto,
        filaAtiva: filaAtiva.count || 0,
        notasCriticas: notasCriticas.count || 0,
        encaminhamentosPend: encaminhamentosPend.count || 0,
        odontogramas: odontogramas.count || 0,
      };
    },
    staleTime: 60000,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      {/* Pacientes */}
      <Card className="border border-border shadow-sm rounded-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Pacientes</CardTitle>
                <CardDescription className="text-xs">Este mês</CardDescription>
              </div>
            </div>
            <Link to="/lista-pacientes"><Badge variant="outline" className="text-[10px] cursor-pointer hover:bg-muted">Ver</Badge></Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <KpiRow icon={UserPlus} label="Novos cadastros" value={data?.newPatients || 0} variant="info" isLoading={isLoading} />
          <KpiRow icon={ClipboardList} label="Encaminhamentos pendentes" value={data?.encaminhamentosPend || 0} variant="warning" isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Odontologia */}
      <Card className="border border-border shadow-sm rounded-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Smile className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Odontologia</CardTitle>
                <CardDescription className="text-xs">Planos e produção</CardDescription>
              </div>
            </div>
            <Link to="/plano-tratamento-odonto"><Badge variant="outline" className="text-[10px] cursor-pointer hover:bg-muted">Ver</Badge></Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <KpiRow icon={ClipboardList} label="Planos ativos" value={data?.planosAtivos || 0} variant="info" isLoading={isLoading} />
          <KpiRow icon={Wallet} label="Receita estimada" value={data?.receitaOdonto || 0} suffix="R$" variant="success" isLoading={isLoading} />
          <KpiRow icon={Smile} label="Odontogramas" value={data?.odontogramas || 0} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Enfermagem */}
      <Card className="border border-border shadow-sm rounded-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Activity className="h-5 w-5 text-warning" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Enfermagem</CardTitle>
                <CardDescription className="text-xs">Fila ativa</CardDescription>
              </div>
            </div>
            <Link to="/enfermagem"><Badge variant="outline" className="text-[10px] cursor-pointer hover:bg-muted">Ver</Badge></Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <KpiRow icon={Activity} label="Na fila" value={data?.filaAtiva || 0} variant="warning" isLoading={isLoading} />
          <KpiRow icon={AlertOctagon} label="Notas críticas (mês)" value={data?.notasCriticas || 0} variant="destructive" isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
