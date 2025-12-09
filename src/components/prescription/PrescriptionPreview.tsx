import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePDF } from 'react-to-pdf';
import { Printer, Download, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const CATEGORY_LABELS: Record<string, string> = {
  medication: 'Medicamentos',
  solution: 'Soluções',
  diet: 'Dieta',
  care: 'Cuidados',
  consultation: 'Consultas',
  allergy: 'Alergias',
};

const CATEGORY_ORDER = ['diet', 'medication', 'solution', 'care', 'consultation'];

interface ItemDetails {
  medication?: string;
  dose?: string;
  route?: string;
  frequency?: string;
  interval?: string;
  schedules?: string[];
  duration?: string;
  instructions?: string;
  solution?: string;
  volume?: string;
  infusionTime?: string;
  diet?: string;
  care?: string;
  careType?: string;
  specialty?: string;
  reason?: string;
}

interface PrescriptionItem {
  id: string;
  item_type: string;
  description: string;
  item_details?: ItemDetails | null;
  status?: string | null;
  is_high_risk?: boolean | null;
  sequence_order: number;
}

interface Patient {
  nome: string;
  prontuario?: string;
  leito?: string;
  quarto?: string;
  data_nascimento?: string;
  cpf?: string;
}

interface Professional {
  nome: string;
  registro: string;
  tipo_registro: string;
}

interface Prescription {
  id: string;
  prescription_date: string;
  validity_start: string;
  validity_end: string;
  expected_discharge_date?: string | null;
  is_pediatric?: boolean | null;
}

interface PrescriptionPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: Prescription;
  items: PrescriptionItem[];
  patient: Patient;
  professional?: Professional;
}

const calculateAge = (birthDate: string): string => {
  const birth = new Date(birthDate);
  const years = differenceInYears(new Date(), birth);
  return `${years} anos`;
};

const formatDescription = (item: PrescriptionItem): string => {
  const details = item.item_details;
  if (!details) return item.description;

  switch (item.item_type) {
    case 'medication': {
      const medParts = [
        details.medication || item.description,
        details.dose,
        details.route,
        details.frequency,
        details.interval ? `a cada ${details.interval}` : null,
        details.schedules?.length ? `(${details.schedules.join(', ')})` : null,
        details.duration,
        details.instructions ? `- ${details.instructions}` : null,
      ].filter(Boolean);
      return medParts.join(' ');
    }
    case 'solution': {
      const solParts = [
        details.solution || item.description,
        details.volume,
        details.route,
        details.infusionTime ? `em ${details.infusionTime}` : null,
        details.frequency,
        details.instructions ? `- ${details.instructions}` : null,
      ].filter(Boolean);
      return solParts.join(' ');
    }
    case 'diet':
      return details.diet || item.description;

    case 'care': {
      const careParts = [
        details.careType ? `[${details.careType}]` : null,
        details.care || item.description,
        details.frequency,
        details.instructions ? `- ${details.instructions}` : null,
      ].filter(Boolean);
      return careParts.join(' ');
    }
    case 'consultation': {
      const consultParts = [
        details.specialty,
        details.reason ? `Motivo: ${details.reason}` : null,
      ].filter(Boolean);
      return consultParts.join(' - ');
    }
    default:
      return item.description;
  }
};

export function PrescriptionPreview({
  open,
  onOpenChange,
  prescription,
  items,
  patient,
  professional,
}: PrescriptionPreviewProps) {
  const { toPDF, targetRef } = usePDF({
    filename: `prescricao-${patient.prontuario || 'paciente'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
  });

  const activeItems = items.filter(item => item.status !== 'deleted' && item.item_type !== 'allergy');
  
  const groupedItems = activeItems.reduce((acc, item) => {
    const type = item.item_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {} as Record<string, PrescriptionItem[]>);

  let globalIndex = 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[95vh] flex flex-col p-0 gap-0">
        <div className="flex items-center justify-between p-4 border-b no-print">
          <h2 className="text-lg font-semibold">Visualização da Prescrição</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" size="sm" onClick={() => toPDF()}>
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div 
            ref={targetRef} 
            className="prescription-preview bg-white mx-auto shadow-lg printable-area"
            style={{ 
              width: '210mm', 
              minHeight: '297mm', 
              padding: '20mm',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            <header className="text-center mb-8 border-b-2 border-foreground pb-4">
              <h1 className="text-xl font-bold tracking-wide mb-1">HOSPITAL / CLÍNICA</h1>
              <p className="text-sm text-muted-foreground mb-4">
                Endereço da Instituição - Cidade/UF - Tel: (00) 0000-0000
              </p>
              <h2 className="text-2xl font-bold tracking-widest mt-4">PRESCRIÇÃO MÉDICA</h2>
              <p className="text-sm mt-2">
                {format(new Date(prescription.prescription_date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </header>

            <section className="mb-6 p-4 border border-foreground/30 rounded">
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div className="col-span-2">
                  <span className="font-semibold">Paciente: </span>
                  <span className="uppercase">{patient.nome}</span>
                  {prescription.is_pediatric && (
                    <Badge variant="outline" className="ml-2 text-xs">PEDIÁTRICO</Badge>
                  )}
                </div>
                <div>
                  <span className="font-semibold">Prontuário: </span>
                  <span>{patient.prontuario || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold">Idade: </span>
                  <span>{patient.data_nascimento ? calculateAge(patient.data_nascimento) : '-'}</span>
                </div>
                <div>
                  <span className="font-semibold">Leito/Quarto: </span>
                  <span>{patient.leito || patient.quarto || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold">CPF: </span>
                  <span>{patient.cpf || '-'}</span>
                </div>
                {prescription.expected_discharge_date && (
                  <div className="col-span-2">
                    <span className="font-semibold">Previsão de Alta: </span>
                    <span>
                      {format(new Date(prescription.expected_discharge_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                )}
              </div>
            </section>

            <Separator className="my-4 bg-foreground/30" />

            <section className="mb-8">
              {CATEGORY_ORDER.map(category => {
                const categoryItems = groupedItems[category];
                if (!categoryItems?.length) return null;

                return (
                  <div key={category} className="mb-6 prescription-section">
                    <h3 className="font-bold text-sm uppercase tracking-wide mb-3 pb-1 border-b border-foreground/20">
                      {CATEGORY_LABELS[category] || category}
                    </h3>
                    <ol className="space-y-2">
                      {categoryItems
                        .sort((a, b) => a.sequence_order - b.sequence_order)
                        .map(item => {
                          globalIndex++;
                          const isSuspended = item.status === 'suspended';
                          
                          return (
                            <li 
                              key={item.id} 
                              className={`flex gap-3 text-sm ${isSuspended ? 'line-through text-muted-foreground' : ''}`}
                            >
                              <span className="font-bold min-w-[24px]">{globalIndex}.</span>
                              <span className="flex-1">
                                {formatDescription(item)}
                                {item.is_high_risk && (
                                  <span className="ml-2 text-xs font-bold">[ALTO RISCO]</span>
                                )}
                                {isSuspended && (
                                  <span className="ml-2 text-xs">[SUSPENSO]</span>
                                )}
                              </span>
                            </li>
                          );
                        })}
                    </ol>
                  </div>
                );
              })}
            </section>

            {items.filter(i => i.item_type === 'allergy' && i.status !== 'deleted').length > 0 && (
              <section className="mb-6 p-3 border-2 border-destructive/50 rounded bg-destructive/5">
                <h3 className="font-bold text-sm uppercase tracking-wide mb-2 text-destructive">
                  ⚠ Alergias
                </h3>
                <ul className="text-sm space-y-1">
                  {items
                    .filter(i => i.item_type === 'allergy' && i.status !== 'deleted')
                    .map(allergy => (
                      <li key={allergy.id}>• {allergy.description}</li>
                    ))}
                </ul>
              </section>
            )}

            <footer className="mt-auto pt-8 border-t border-foreground/30">
              <div className="flex justify-between items-end text-sm">
                <div>
                  <p className="font-semibold mb-1">Vigência da Prescrição:</p>
                  <p>
                    {format(new Date(prescription.validity_start), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    {' até '}
                    {format(new Date(prescription.validity_end), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="border-t border-foreground w-64 pt-2 mt-8">
                    <p className="font-semibold">
                      {professional?.nome || 'Médico Responsável'}
                    </p>
                    <p className="text-muted-foreground">
                      {professional?.tipo_registro || 'CRM'}: {professional?.registro || '______'}
                    </p>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default PrescriptionPreview;
