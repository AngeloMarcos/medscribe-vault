import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 5, className }: TableSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)} role="status" aria-label="Carregando tabela">
      {/* Header */}
      <div className="flex gap-4 p-3 bg-muted/30 rounded-md">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-5 flex-1" />
          ))}
        </div>
      ))}
      <span className="sr-only">Carregando dados...</span>
    </div>
  );
}

interface CardSkeletonProps {
  className?: string;
  hasHeader?: boolean;
  hasFooter?: boolean;
}

export function CardSkeleton({ className, hasHeader = true, hasFooter = false }: CardSkeletonProps) {
  return (
    <div 
      className={cn("rounded-xl border bg-card p-6 space-y-4", className)} 
      role="status" 
      aria-label="Carregando card"
    >
      {hasHeader && (
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      {hasFooter && (
        <div className="flex gap-2 pt-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      )}
      <span className="sr-only">Carregando...</span>
    </div>
  );
}

interface FormSkeletonProps {
  fields?: number;
  className?: string;
}

export function FormSkeleton({ fields = 4, className }: FormSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)} role="status" aria-label="Carregando formulário">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>
      <span className="sr-only">Carregando formulário...</span>
    </div>
  );
}

interface PatientHeaderSkeletonProps {
  className?: string;
}

export function PatientHeaderSkeleton({ className }: PatientHeaderSkeletonProps) {
  return (
    <div 
      className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", className)} 
      role="status" 
      aria-label="Carregando dados do paciente"
    >
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-4 w-32" />
      </div>
      <span className="sr-only">Carregando informações do paciente...</span>
    </div>
  );
}
