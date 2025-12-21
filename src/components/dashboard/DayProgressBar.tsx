import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface DayProgressBarProps {
  totalScheduled: number;
  completed: number;
  inProgress: number;
  waiting: number;
  isLoading?: boolean;
}

export function DayProgressBar({
  totalScheduled,
  completed,
  inProgress,
  waiting,
  isLoading = false,
}: DayProgressBarProps) {
  const progress = useMemo(() => {
    if (totalScheduled === 0) return 0;
    return Math.round((completed / totalScheduled) * 100);
  }, [totalScheduled, completed]);

  // Calculate time progress of the day (8h to 18h work hours)
  const timeProgress = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    const startHour = 8;
    const endHour = 18;
    const workMinutes = (endHour - startHour) * 60;
    
    const currentMinutes = (hours - startHour) * 60 + minutes;
    
    if (currentMinutes <= 0) return 0;
    if (currentMinutes >= workMinutes) return 100;
    
    return Math.round((currentMinutes / workMinutes) * 100);
  }, []);

  const getProgressColor = () => {
    if (progress >= 80) return "bg-success";
    if (progress >= 50) return "bg-secondary";
    if (progress >= 25) return "bg-warning";
    return "bg-muted-foreground";
  };

  const getProgressStatus = () => {
    const diff = progress - timeProgress;
    if (diff >= 10) return { label: "Adiantado", color: "text-success" };
    if (diff >= -10) return { label: "No ritmo", color: "text-secondary" };
    return { label: "Atrasado", color: "text-warning" };
  };

  const status = getProgressStatus();

  if (isLoading) {
    return (
      <div className="w-full p-4 rounded-xl bg-card border border-border animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-3" />
        <div className="h-3 bg-muted rounded-full w-full" />
      </div>
    );
  }

  return (
    <div className="w-full p-4 lg:p-5 rounded-xl bg-card border border-border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-label font-medium">Progresso do dia</span>
          <span className={cn("text-sm font-medium", status.color)}>
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">{completed}</span>
            <span className="text-helper">/{totalScheduled} atendidos</span>
          </span>
          <span className="font-bold text-secondary">{progress}%</span>
        </div>
      </div>
      
      {/* Main progress bar */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        {/* Time progress indicator (background) */}
        <div 
          className="absolute top-0 left-0 h-full bg-border/50 transition-all duration-500"
          style={{ width: `${timeProgress}%` }}
        />
        
        {/* Actual progress */}
        <div 
          className={cn("absolute top-0 left-0 h-full transition-all duration-500 rounded-full", getProgressColor())}
          style={{ width: `${progress}%` }}
        />
        
        {/* Time marker */}
        <div 
          className="absolute top-0 w-0.5 h-full bg-foreground/30"
          style={{ left: `${timeProgress}%` }}
        />
      </div>
      
      {/* Status indicators */}
      <div className="flex items-center gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-muted-foreground">Atendidos: {completed}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-info" />
          <span className="text-muted-foreground">Em atendimento: {inProgress}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-warning" />
          <span className="text-muted-foreground">Aguardando: {waiting}</span>
        </div>
      </div>
    </div>
  );
}
