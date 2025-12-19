import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useMedicamentos, Medicamento } from "@/hooks/useMedicamentos";
import { Search, Loader2, Pill } from "lucide-react";
import { cn } from "@/lib/utils";

interface MedicamentoSearchProps {
  onSelect: (medicamento: Medicamento) => void;
  placeholder?: string;
  className?: string;
}

export function MedicamentoSearch({
  onSelect,
  placeholder = "Buscar medicamento por nome ou código...",
  className,
}: MedicamentoSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: medicamentos, isLoading } = useMedicamentos(searchTerm);

  // Group medications by category
  const groupedMedicamentos = useMemo(() => {
    if (!medicamentos) return {};
    return medicamentos.reduce((acc, med) => {
      const category = med.categoria || "Outros";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(med);
      return acc;
    }, {} as Record<string, Medicamento[]>);
  }, [medicamentos]);

  const handleSelect = (medicamento: Medicamento) => {
    onSelect(medicamento);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-9"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && searchTerm.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg">
          <ScrollArea className="max-h-[300px]">
            {medicamentos && medicamentos.length > 0 ? (
              <div className="p-2">
                {Object.entries(groupedMedicamentos).map(([category, meds]) => (
                  <div key={category} className="mb-3 last:mb-0">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 py-1">
                      {category}
                    </div>
                    {meds.map((med) => (
                      <button
                        key={med.id}
                        onClick={() => handleSelect(med)}
                        className="w-full text-left p-2 hover:bg-muted rounded-md transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <Pill className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {med.nome_generico}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {med.apresentacao}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {med.codigo}
                              </Badge>
                              {med.via_padrao && (
                                <span className="text-xs text-muted-foreground">
                                  Via: {med.via_padrao}
                                </span>
                              )}
                              {med.controlado && (
                                <Badge variant="destructive" className="text-xs">
                                  Controlado
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ) : searchTerm.length >= 2 && !isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhum medicamento encontrado
              </div>
            ) : null}
          </ScrollArea>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && searchTerm.length >= 2 && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
