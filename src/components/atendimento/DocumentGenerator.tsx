import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentCard } from "./DocumentCard";
import { DocumentEditor } from "./DocumentEditor";
import { TipoDocumento } from "@/types/atendimento";
import { FileText } from "lucide-react";

interface DocumentGeneratorProps {
  paciente: {
    id: string;
    nome: string;
    cpf: string;
  };
  profissional: {
    nome: string;
    registro: string;
    tipo_registro: string;
  };
  onDocumentSaved?: (tipo: TipoDocumento, conteudo: string) => void;
}

const documentTypes: TipoDocumento[] = [
  "atestado",
  "receita_simples",
  "receita_especial",
  "pedido_exame",
  "encaminhamento",
];

export function DocumentGenerator({ paciente, profissional, onDocumentSaved }: DocumentGeneratorProps) {
  const [selectedType, setSelectedType] = useState<TipoDocumento | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const handleCardClick = (tipo: TipoDocumento) => {
    setSelectedType(tipo);
    setEditorOpen(true);
  };

  const handleSave = (conteudo: string) => {
    if (selectedType) {
      onDocumentSaved?.(selectedType, conteudo);
    }
    setEditorOpen(false);
    setSelectedType(null);
  };

  return (
    <>
      <Card className="card-neumorphic">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Gerar Documentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {documentTypes.map((tipo) => (
              <DocumentCard
                key={tipo}
                tipo={tipo}
                onClick={() => handleCardClick(tipo)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedType && (
        <DocumentEditor
          open={editorOpen}
          onOpenChange={setEditorOpen}
          tipo={selectedType}
          paciente={paciente}
          profissional={profissional}
          onSave={handleSave}
        />
      )}
    </>
  );
}
