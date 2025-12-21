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
}: StatCardWithTrendProps) {
  const colors = colorVariants[colorVariant];
  const animationDelay = index * 100;

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
      <Card className="relative overflow-hidden bg-card border border-border rounded-2xl">
        <CardContent className="p-5 lg:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-3 w-32 mt-2" />
            </div>
            <Skeleton className="h-11 w-11 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "relative overflow-hidden bg-card border border-border rounded-2xl group",
        "hover:border-secondary/40 hover:shadow-lg transition-all duration-300",
        "opacity-0 animate-bounce-in",
        colors.glow
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <CardContent className="p-5 lg:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-caption text-muted-foreground truncate">{title}</p>
            
            <div className="flex items-end gap-2 mt-2">
              <span className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                <AnimatedNumber value={value} />
              </span>
              
              {trend && TrendIcon && (
                <div 
                  className={cn(
                    "flex items-center gap-0.5 pb-1 opacity-0 animate-fade-in",
                    getTrendColor()
                  )}
                  style={{ animationDelay: `${animationDelay + 300}ms` }}
                >
                  <TrendIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {trend.value > 0 ? "+" : ""}{trend.value}%
                  </span>
                </div>
              )}
            </div>
            
            {description && (
              <p className="text-helper mt-1.5 truncate">{description}</p>
            )}
          </div>
          
          <div 
            className={cn(
              "p-3 rounded-xl transition-all duration-300",
              colors.iconBg,
              "group-hover:scale-110 group-hover:animate-float"
            )}
          >
            <Icon className={cn("h-5 w-5", colors.iconColor)} />
          </div>
        </div>
      </CardContent>
      
      {/* Decorative gradient line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}
