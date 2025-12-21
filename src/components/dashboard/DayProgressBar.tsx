import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "./AnimatedNumber";

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
    if (diff >= 10) return { label: "Adiantado", color: "text-success bg-success/10" };
    if (diff >= -10) return { label: "No ritmo", color: "text-secondary bg-secondary/10" };
    return { label: "Atrasado", color: "text-warning bg-warning/10" };
  };

  const status = getProgressStatus();

  if (isLoading) {
    return (
      <div className="w-full p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-muted rounded w-20 animate-pulse" />
        </div>
        <div className="h-3 bg-muted rounded-full w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent animate-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 lg:p-5 rounded-xl bg-card border border-border shadow-sm opacity-0 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-label font-medium">Progresso do dia</span>
          <span 
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full transition-all duration-300",
              status.color,
              "opacity-0 animate-scale-in"
            )}
            style={{ animationDelay: "200ms" }}
          >
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">
              <AnimatedNumber value={completed} />
            </span>
            <span className="text-helper">/{totalScheduled} atendidos</span>
          </span>
          <span className="font-bold text-secondary">
            <AnimatedNumber value={progress} suffix="%" />
          </span>
        </div>
      </div>
      
      {/* Main progress bar */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        {/* Time progress indicator (background) */}
        <div 
          className="absolute top-0 left-0 h-full bg-border/50 transition-all duration-1000 ease-out"
          style={{ width: `${timeProgress}%` }}
        />
        
        {/* Actual progress with animation */}
        <div 
          className={cn(
            "absolute top-0 left-0 h-full rounded-full transition-colors duration-300",
            getProgressColor()
          )}
          style={{ 
            width: `${progress}%`,
            animation: "progress-fill 1s ease-out forwards",
            ["--progress-width" as string]: `${progress}%`
          }}
        />
        
        {/* Time marker with pulse effect */}
        <div 
          className="absolute top-0 w-0.5 h-full bg-foreground/50 transition-all duration-500"
          style={{ left: `${timeProgress}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-foreground/70 animate-pulse-soft" />
        </div>
      </div>
      
      {/* Status indicators with staggered animation */}
      <div className="flex items-center gap-4 mt-3 text-xs">
        {[
          { color: "bg-success", label: "Atendidos", value: completed, delay: 100 },
          { color: "bg-info", label: "Em atendimento", value: inProgress, delay: 200 },
          { color: "bg-warning", label: "Aguardando", value: waiting, delay: 300 },
        ].map((item) => (
          <div 
            key={item.label}
            className="flex items-center gap-1.5 opacity-0 animate-fade-in"
            style={{ animationDelay: `${item.delay}ms` }}
          >
            <div className={cn("w-2 h-2 rounded-full", item.color)} />
            <span className="text-muted-foreground">{item.label}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
