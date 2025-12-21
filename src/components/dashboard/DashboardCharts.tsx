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
  ReferenceLine,
} from "recharts";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { TrendingUp, PieChartIcon, Activity, FileText, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/useResponsive";

const COLORS = ['#00A896', '#02C39A', '#05668D', '#028090', '#00F5D4', '#F0A500', '#9B5DE5', '#00BBF9'];

export function WeeklyChart() {
  const { weeklyStats, isLoading } = useDashboardStats();
  const { isMobile } = useResponsive();

  if (isLoading) {
    return (
      <Card className="bg-card border border-border shadow-sm rounded-xl sm:rounded-2xl">
        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
          <Skeleton className="h-5 sm:h-6 w-36 sm:w-48" />
          <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 mt-2" />
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <Skeleton className="h-[180px] sm:h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const avg = weeklyStats && weeklyStats.length > 0
    ? Math.round(weeklyStats.reduce((sum, d) => sum + d.total, 0) / weeklyStats.length)
    : 0;

  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl sm:rounded-2xl">
      <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-secondary/10">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-semibold">Atendimentos da Semana</CardTitle>
              <CardDescription className="text-xs mt-0.5 hidden sm:block">Últimos 7 dias</CardDescription>
            </div>
          </div>
          {avg > 0 && !isMobile && (
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-muted text-xs">
              <Target className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Média:</span>
              <span className="font-semibold text-foreground">{avg}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-4 sm:pb-6">
        <ResponsiveContainer width="100%" height={isMobile ? 180 : 250}>
          <BarChart data={weeklyStats || []} margin={{ top: 10, right: 10, left: isMobile ? -20 : -10, bottom: 0 }}>
            <defs>
              <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1}/>
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
              </linearGradient>
              <linearGradient id="finalizadosGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={1}/>
                <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.6}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: isMobile ? 10 : 12 }}
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: isMobile ? 10 : 12 }}
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={isMobile ? 25 : 35}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            {avg > 0 && !isMobile && (
              <ReferenceLine 
                y={avg} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="5 5" 
                strokeOpacity={0.5}
              />
            )}
            <Bar dataKey="total" name="Total" fill="url(#totalGradient)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="finalizados" name="Finalizados" fill="url(#finalizadosGradient)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-3 sm:mt-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-primary" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Total</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-success" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Finalizados</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EspecialidadeChart() {
  const { especialidadeStats, isLoading } = useDashboardStats();
  const { isMobile } = useResponsive();

  if (isLoading) {
    return (
      <Card className="bg-card border border-border shadow-sm rounded-xl sm:rounded-2xl">
        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
          <Skeleton className="h-5 sm:h-6 w-36 sm:w-48" />
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <Skeleton className="h-[180px] sm:h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const data = especialidadeStats?.slice(0, 6) || [];
  const total = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl sm:rounded-2xl">
      <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-secondary/10">
            <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
          </div>
          <div>
            <CardTitle className="text-sm sm:text-base font-semibold">Por Especialidade</CardTitle>
            <CardDescription className="text-xs mt-0.5 hidden sm:block">Distribuição mensal</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        {data.length > 0 ? (
          <div className="relative">
            <ResponsiveContainer width="100%" height={isMobile ? 160 : 220}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 40 : 60}
                  outerRadius={isMobile ? 65 : 90}
                  paddingAngle={3}
                  dataKey="total"
                  nameKey="nome"
                  stroke="none"
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
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} (${Math.round((value / total) * 100)}%)`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{total}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">consultas</p>
            </div>
          </div>
        ) : (
          <div className="h-[160px] sm:h-[220px] flex items-center justify-center text-muted-foreground text-sm">
            Nenhum dado disponível
          </div>
        )}
        {data.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-2">
            {data.slice(0, 4).map((item, index) => (
              <div key={item.nome} className="flex items-center gap-1.5 sm:gap-2">
                <div 
                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.cor || COLORS[index % COLORS.length] }}
                />
                <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{item.nome}</span>
                <span className="text-[10px] sm:text-xs font-medium text-foreground ml-auto">{item.total}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AttendanceGauge() {
  const { attendanceRate, isLoading } = useDashboardStats();
  const { isMobile } = useResponsive();

  if (isLoading) {
    return (
      <Card className="bg-card border border-border shadow-sm rounded-xl sm:rounded-2xl">
        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
          <Skeleton className="h-5 sm:h-6 w-36 sm:w-48" />
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <Skeleton className="h-32 sm:h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  const rate = attendanceRate?.taxa || 0;
  const goal = 85;
  
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
  
  const isAboveGoal = rate >= goal;

  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl sm:rounded-2xl">
      <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-secondary/10">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-semibold">Taxa de Comparecimento</CardTitle>
              <CardDescription className="text-xs mt-0.5 hidden sm:block">Mês atual</CardDescription>
            </div>
          </div>
          <div className={cn(
            "px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium",
            isAboveGoal ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
          )}>
            Meta: {goal}% {isAboveGoal ? "✓" : ""}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <div className={cn("relative overflow-hidden", isMobile ? "w-32 h-16" : "w-40 h-20")}>
            <div className={cn("absolute bottom-0 left-0 right-0 rounded-full border-[10px] sm:border-[12px] border-muted", isMobile ? "h-32 w-32" : "h-40 w-40")}
                 style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)' }} />
            <div 
              className={cn("absolute bottom-0 left-0 right-0 rounded-full border-[10px] sm:border-[12px] transition-all duration-700", getBgColor(rate), isMobile ? "h-32 w-32" : "h-40 w-40")}
              style={{ 
                clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)',
                transform: `rotate(${(rate / 100) * 180 - 180}deg)`,
                transformOrigin: 'center bottom'
              }} 
            />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
              <span className={cn("text-2xl sm:text-4xl font-bold", getColor(rate))}>{rate}%</span>
            </div>
          </div>
          
          <div className="w-full space-y-2 mt-1 sm:mt-2">
            <div className="relative h-2.5 sm:h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn("absolute top-0 left-0 h-full transition-all duration-700 rounded-full", getBgColor(rate))}
                style={{ width: `${rate}%` }}
              />
              <div className="absolute top-0 w-0.5 h-full bg-foreground/50 z-10" style={{ left: `${goal}%` }} />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full text-center pt-1 sm:pt-2">
            <div className="p-2 sm:p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Total</p>
              <p className="text-sm sm:text-lg font-bold text-foreground">{attendanceRate?.total || 0}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-success/10">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Finalizados</p>
              <p className="text-sm sm:text-lg font-bold text-success">{attendanceRate?.finalizados || 0}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-destructive/10">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Ausentes</p>
              <p className="text-sm sm:text-lg font-bold text-destructive">{attendanceRate?.ausentes || 0}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TopCidsChart() {
  const { cidStats, isLoading } = useDashboardStats();
  const { isMobile } = useResponsive();

  if (isLoading) {
    return (
      <Card className="bg-card border border-border shadow-sm rounded-xl sm:rounded-2xl">
        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
          <Skeleton className="h-5 sm:h-6 w-36 sm:w-48" />
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <Skeleton className="h-[200px] sm:h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const displayCids = isMobile ? cidStats?.slice(0, 5) : cidStats;
  const maxTotal = displayCids && displayCids.length > 0 ? Math.max(...displayCids.map(c => c.total)) : 1;

  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl sm:rounded-2xl">
      <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-secondary/10">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
          </div>
          <div>
            <CardTitle className="text-sm sm:text-base font-semibold">Top {isMobile ? 5 : 10} CIDs</CardTitle>
            <CardDescription className="text-xs mt-0.5 hidden sm:block">Diagnósticos mais frequentes</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        {displayCids && displayCids.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {displayCids.map((cid, index) => (
              <div key={cid.codigo} className="group">
                <div className="flex items-center gap-2 sm:gap-3 mb-1">
                  <div className={cn(
                    "w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0",
                    index < 3 ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs sm:text-sm font-medium text-foreground">{cid.codigo}</p>
                      <span className="text-xs sm:text-sm font-bold text-secondary shrink-0">{cid.total}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{cid.descricao}</p>
                  </div>
                </div>
                <div className="ml-7 sm:ml-9 h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary/60 rounded-full transition-all duration-500 group-hover:bg-secondary"
                    style={{ width: `${(cid.total / maxTotal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[150px] sm:h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            Nenhum CID registrado este mês
          </div>
        )}
      </CardContent>
    </Card>
  );
}
