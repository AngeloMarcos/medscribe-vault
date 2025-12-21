import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "./AnimatedNumber";

interface StatCardWithTrendProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  description?: string;
  isLoading?: boolean;
  colorVariant?: "default" | "success" | "warning" | "destructive" | "info";
  index?: number;
  suffix?: string;
}

const colorVariants = {
  default: {
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
    trendUp: "text-success",
    trendDown: "text-destructive",
    glow: "group-hover:shadow-secondary/20",
  },
  success: {
    iconBg: "bg-success/10",
    iconColor: "text-success",
    trendUp: "text-success",
    trendDown: "text-destructive",
    glow: "group-hover:shadow-success/20",
  },
  warning: {
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    trendUp: "text-destructive",
    trendDown: "text-success",
    glow: "group-hover:shadow-warning/20",
  },
  destructive: {
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
    trendUp: "text-destructive",
    trendDown: "text-success",
    glow: "group-hover:shadow-destructive/20",
  },
  info: {
    iconBg: "bg-info/10",
    iconColor: "text-info",
    trendUp: "text-success",
    trendDown: "text-destructive",
    glow: "group-hover:shadow-info/20",
  },
};

export function StatCardWithTrend({
  title,
  value,
  icon: Icon,
  trend,
  description,
  isLoading = false,
  colorVariant = "default",
  index = 0,
  suffix = "",
}: StatCardWithTrendProps) {
  const colors = colorVariants[colorVariant];
  const animationDelay = index * 80;

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.direction === "up") return TrendingUp;
    if (trend.direction === "down") return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.direction === "up") return colors.trendUp;
    if (trend.direction === "down") return colors.trendDown;
    return "text-muted-foreground";
  };

  const TrendIcon = getTrendIcon();

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden bg-card border border-border rounded-xl sm:rounded-2xl">
        <CardContent className="p-3 sm:p-4 lg:p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Skeleton className="h-3 sm:h-4 w-16 sm:w-24 mb-2 sm:mb-3" />
              <Skeleton className="h-7 sm:h-10 w-12 sm:w-20" />
              <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-32 mt-1.5 sm:mt-2 hidden sm:block" />
            </div>
            <Skeleton className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "relative overflow-hidden bg-card border border-border rounded-xl sm:rounded-2xl group",
        "hover:border-secondary/40 hover:shadow-lg transition-all duration-300",
        "opacity-0 animate-bounce-in touch-active",
        colors.glow
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <CardContent className="p-3 sm:p-4 lg:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{title}</p>
            
            <div className="flex items-end gap-1 sm:gap-2 mt-1 sm:mt-2">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                <AnimatedNumber value={value} suffix={suffix} />
              </span>
              
              {trend && TrendIcon && (
                <div 
                  className={cn(
                    "hidden sm:flex items-center gap-0.5 pb-1 opacity-0 animate-fade-in",
                    getTrendColor()
                  )}
                  style={{ animationDelay: `${animationDelay + 300}ms` }}
                >
                  <TrendIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm font-medium">
                    {trend.value > 0 ? "+" : ""}{trend.value}%
                  </span>
                </div>
              )}
            </div>
            
            {description && (
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-1.5 truncate hidden sm:block">{description}</p>
            )}
          </div>
          
          <div 
            className={cn(
              "p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 shrink-0",
              colors.iconBg,
              "group-hover:scale-110"
            )}
          >
            <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", colors.iconColor)} />
          </div>
        </div>
      </CardContent>
      
      {/* Decorative gradient line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-secondary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}
