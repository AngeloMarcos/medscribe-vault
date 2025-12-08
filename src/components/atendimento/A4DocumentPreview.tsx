import { forwardRef } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TipoDocumento, getDocumentTypeLabel } from "@/types/atendimento";

interface A4DocumentPreviewProps {
  tipo: TipoDocumento;
  conteudo: string;
  paciente: {
    nome: string;
    cpf: string;
  };
  profissional: {
    nome: string;
    registro: string;
    tipo_registro: string;
  };
}

export const A4DocumentPreview = forwardRef<HTMLDivElement, A4DocumentPreviewProps>(
  ({ tipo, conteudo, paciente, profissional }, ref) => {
    const dataAtual = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

    return (
      <div
        ref={ref}
        className="printable-area bg-white shadow-2xl mx-auto"
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "20mm",
          fontFamily: "'Times New Roman', serif",
          fontSize: "12pt",
          lineHeight: "1.6",
          color: "#000",
        }}
      >
        {/* Header */}
        <header className="text-center border-b-2 border-primary pb-6 mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-2xl">M</span>
            </div>
          </div>
          <h1 className="text-xl font-bold text-primary">MedScribe Clínica</h1>
          <p className="text-sm text-muted-foreground">Av. Saúde, 1000 - Centro - CEP: 00000-000</p>
          <p className="text-sm text-muted-foreground">Tel: (00) 0000-0000</p>
        </header>

        {/* Document Title */}
        <div className="text-center mb-8">
          <h2 className="text-lg font-bold uppercase tracking-wide border-b-2 border-foreground inline-block pb-1">
            {getDocumentTypeLabel(tipo)}
          </h2>
        </div>

        {/* Patient Info */}
        <section className="mb-8">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Paciente:</span>{" "}
              <span>{paciente.nome}</span>
            </div>
            <div>
              <span className="font-semibold">CPF:</span>{" "}
              <span>{paciente.cpf}</span>
            </div>
            <div className="col-span-2">
              <span className="font-semibold">Data:</span>{" "}
              <span>{dataAtual}</span>
            </div>
          </div>
        </section>

        {/* Document Content */}
        <section className="mb-16 min-h-[400px]">
          <div 
            className="whitespace-pre-wrap text-justify"
            style={{ textIndent: "2em" }}
          >
            {conteudo || (
              <span className="text-muted-foreground italic">
                O conteúdo do documento aparecerá aqui...
              </span>
            )}
          </div>
        </section>

        {/* Footer - Signature */}
        <footer className="mt-auto pt-8">
          <div className="text-center mt-16">
            <div className="border-t border-foreground w-64 mx-auto pt-2">
              <p className="font-semibold">{profissional.nome}</p>
              <p className="text-sm">
                {profissional.tipo_registro}: {profissional.registro}
              </p>
            </div>
          </div>
          
          <div className="text-center text-xs text-muted-foreground mt-8">
            <p>Documento gerado em {dataAtual}</p>
          </div>
        </footer>
      </div>
    );
  }
);

A4DocumentPreview.displayName = "A4DocumentPreview";
