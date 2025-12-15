import { Card, CardContent } from '@/components/ui/card';
import { Users, Clock, Activity, AlertTriangle } from 'lucide-react';

interface NursingStatsProps {
  stats: {
    total: number;
    waiting: number;
    inProgress: number;
    emergency: number;
  };
}

export function NursingStats({ stats }: NursingStatsProps) {
  const statCards = [
    {
      label: 'Total na Fila',
      value: stats.total,
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Aguardando',
      value: stats.waiting,
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: 'Em Atendimento',
      value: stats.inProgress,
      icon: Activity,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Emergência',
      value: stats.emergency,
      icon: AlertTriangle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.label} className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`h-10 w-10 rounded-full ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
