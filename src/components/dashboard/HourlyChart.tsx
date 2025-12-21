import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface HourlyData {
  hora: string;
  agendados: number;
  atendidos: number;
}

interface HourlyChartProps {
  data: HourlyData[];
  isLoading?: boolean;
}

export function HourlyChart({ data, isLoading = false }: HourlyChartProps) {
  // Get current hour for reference line
  const currentHour = new Date().getHours();
  const currentHourStr = `${currentHour.toString().padStart(2, "0")}:00`;

  if (isLoading) {
    return (
      <Card className="bg-card border border-border shadow-sm rounded-2xl">
        <CardHeader className="pb-4 px-6 pt-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Calculate peak hour
  const peakHour = data.reduce((max, item) => 
    item.agendados > max.agendados ? item : max
  , data[0] || { hora: "", agendados: 0 });

  return (
    <Card className="bg-card border border-border shadow-sm rounded-2xl">
      <CardHeader className="pb-4 px-6 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Clock className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-card-title">Fluxo por Horário</CardTitle>
              <CardDescription className="text-caption mt-0.5">
                Distribuição de atendimentos hoje
              </CardDescription>
            </div>
          </div>
          {peakHour && peakHour.hora && (
            <div className="text-right">
              <p className="text-helper text-muted-foreground">Pico</p>
              <p className="text-label font-semibold text-secondary">{peakHour.hora}</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAgendados" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAtendidos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis 
                dataKey="hora" 
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <ReferenceLine 
                x={currentHourStr} 
                stroke="hsl(var(--foreground))" 
                strokeDasharray="3 3" 
                strokeOpacity={0.5}
              />
              <Area
                type="monotone"
                dataKey="agendados"
                name="Agendados"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAgendados)"
              />
              <Area
                type="monotone"
                dataKey="atendidos"
                name="Atendidos"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAtendidos)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível
          </div>
        )}
      </CardContent>
    </Card>
  );
}
