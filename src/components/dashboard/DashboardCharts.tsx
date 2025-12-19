import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { TrendingUp, PieChartIcon, Activity, FileText } from "lucide-react";

const COLORS = ['#00A896', '#02C39A', '#05668D', '#028090', '#00F5D4', '#F0A500', '#9B5DE5', '#00BBF9'];

export function WeeklyChart() {
  const { weeklyStats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <Card className="bg-card border border-border shadow-sm rounded-2xl">
        <CardHeader className="pb-4 px-6 pt-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border border-border shadow-sm rounded-2xl">
      <CardHeader className="pb-4 px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <TrendingUp className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <CardTitle className="text-card-title">Atendimentos da Semana</CardTitle>
            <CardDescription className="text-caption mt-0.5">Últimos 7 dias</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyStats || []}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Bar 
              dataKey="total" 
              name="Total" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="finalizados" 
              name="Finalizados" 
              fill="hsl(var(--success))" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function EspecialidadeChart() {
  const { especialidadeStats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <Card className="bg-card border border-border shadow-sm rounded-2xl">
        <CardHeader className="pb-4 px-6 pt-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const data = especialidadeStats?.slice(0, 6) || [];

  return (
    <Card className="bg-card border border-border shadow-sm rounded-2xl">
      <CardHeader className="pb-4 px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <PieChartIcon className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <CardTitle className="text-card-title">Por Especialidade</CardTitle>
            <CardDescription className="text-caption mt-0.5">Distribuição mensal</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="total"
                nameKey="nome"
                label={({ nome, percent }) => `${nome} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AttendanceGauge() {
  const { attendanceRate, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <Card className="bg-card border border-border shadow-sm rounded-2xl">
        <CardHeader className="pb-4 px-6 pt-6">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const rate = attendanceRate?.taxa || 0;
  const getColor = (taxa: number) => {
    if (taxa >= 80) return 'text-success';
    if (taxa >= 50) return 'text-warning';
    return 'text-destructive';
  };
  const getBgColor = (taxa: number) => {
    if (taxa >= 80) return 'bg-success';
    if (taxa >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <Card className="bg-card border border-border shadow-sm rounded-2xl">
      <CardHeader className="pb-4 px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Activity className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <CardTitle className="text-card-title">Taxa de Comparecimento</CardTitle>
            <CardDescription className="text-caption mt-0.5">Mês atual</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="flex flex-col items-center gap-4">
          <div className={`text-5xl font-bold ${getColor(rate)}`}>
            {rate}%
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${getBgColor(rate)}`}
              style={{ width: `${rate}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 w-full text-center text-sm">
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="font-semibold">{attendanceRate?.total || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Finalizados</p>
              <p className="font-semibold text-success">{attendanceRate?.finalizados || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ausentes</p>
              <p className="font-semibold text-destructive">{attendanceRate?.ausentes || 0}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TopCidsChart() {
  const { cidStats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <Card className="bg-card border border-border shadow-sm rounded-2xl">
        <CardHeader className="pb-4 px-6 pt-6">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border border-border shadow-sm rounded-2xl">
      <CardHeader className="pb-4 px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <FileText className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <CardTitle className="text-card-title">Top 10 CIDs</CardTitle>
            <CardDescription className="text-caption mt-0.5">Diagnósticos mais frequentes</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {cidStats && cidStats.length > 0 ? (
          <div className="space-y-3">
            {cidStats.map((cid, index) => (
              <div key={cid.codigo} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{cid.codigo}</p>
                  <p className="text-xs text-muted-foreground truncate">{cid.descricao}</p>
                </div>
                <div className="text-sm font-semibold text-primary">
                  {cid.total}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Nenhum CID registrado este mês
          </div>
        )}
      </CardContent>
    </Card>
  );
}
