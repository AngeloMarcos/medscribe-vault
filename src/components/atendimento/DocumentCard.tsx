import { Card, CardContent } from "@/components/ui/card";
import { TipoDocumento, getDocumentTypeLabel } from "@/types/atendimento";
import { FileText, Pill, ClipboardList, ArrowRightLeft, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentCardProps {
  tipo: TipoDocumento;
  onClick: () => void;
  disabled?: boolean;
}

const iconMap: Record<TipoDocumento, React.ElementType> = {
  atestado: FileText,
  receita_simples: Pill,
  receita_especial: Shield,
  pedido_exame: ClipboardList,
  encaminhamento: ArrowRightLeft,
};

const colorMap: Record<TipoDocumento, string> = {
  atestado: "bg-primary/10 text-primary hover:bg-primary/20",
  receita_simples: "bg-success/10 text-success hover:bg-success/20",
  receita_especial: "bg-warning/10 text-warning hover:bg-warning/20",
  pedido_exame: "bg-secondary/10 text-secondary hover:bg-secondary/20",
  encaminhamento: "bg-accent/10 text-accent hover:bg-accent/20",
};

export function DocumentCard({ tipo, onClick, disabled }: DocumentCardProps) {
  const Icon = iconMap[tipo];
  const label = getDocumentTypeLabel(tipo);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 card-neumorphic border-2 border-transparent",
        "hover:border-secondary hover:shadow-hover",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent className="p-6 flex flex-col items-center gap-4">
        <div className={cn("p-4 rounded-xl", colorMap[tipo])}>
          <Icon className="h-8 w-8" />
        </div>
        <span className="font-medium text-foreground text-center">{label}</span>
      </CardContent>
    </Card>
  );
}
