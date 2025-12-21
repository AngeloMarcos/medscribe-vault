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
      <div className="w-full p-3 sm:p-4 rounded-lg sm:rounded-xl bg-card border border-border">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="h-3 sm:h-4 bg-muted rounded w-24 sm:w-1/3 animate-pulse" />
          <div className="h-3 sm:h-4 bg-muted rounded w-16 sm:w-20 animate-pulse" />
        </div>
        <div className="h-2.5 sm:h-3 bg-muted rounded-full w-full skeleton-shimmer" />
      </div>
    );
  }

  return (
    <div className="w-full p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl bg-card border border-border shadow-sm opacity-0 animate-slide-up">
      {/* Header - Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2 sm:mb-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-xs sm:text-sm font-medium">Progresso do dia</span>
          <span 
            className={cn(
              "text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full transition-all duration-300",
              status.color,
              "opacity-0 animate-scale-in"
            )}
            style={{ animationDelay: "200ms" }}
          >
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">
              <AnimatedNumber value={completed} />
            </span>
            <span className="text-muted-foreground">/{totalScheduled}</span>
            <span className="hidden sm:inline text-muted-foreground"> atendidos</span>
          </span>
          <span className="font-bold text-secondary">
            <AnimatedNumber value={progress} suffix="%" />
          </span>
        </div>
      </div>
      
      {/* Main progress bar */}
      <div className="relative h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
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
          <div className="absolute -top-0.5 sm:-top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-foreground/70 animate-pulse-soft" />
        </div>
      </div>
      
      {/* Status indicators - Responsivo com flex-wrap */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 sm:mt-3 text-[10px] sm:text-xs">
        {[
          { color: "bg-success", label: "Atendidos", mobileLabel: "Atend.", value: completed, delay: 100 },
          { color: "bg-info", label: "Em atendimento", mobileLabel: "Em atend.", value: inProgress, delay: 200 },
          { color: "bg-warning", label: "Aguardando", mobileLabel: "Aguard.", value: waiting, delay: 300 },
        ].map((item) => (
          <div 
            key={item.label}
            className="flex items-center gap-1 sm:gap-1.5 opacity-0 animate-fade-in"
            style={{ animationDelay: `${item.delay}ms` }}
          >
            <div className={cn("w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full", item.color)} />
            <span className="text-muted-foreground">
              <span className="sm:hidden">{item.mobileLabel}</span>
              <span className="hidden sm:inline">{item.label}</span>
              : {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
