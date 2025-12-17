import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowRight,
  Building2,
  Hospital,
  Ambulance,
  BedDouble,
  Printer,
  Send,
  X,
} from 'lucide-react';
import { useEncaminhamentos } from '@/hooks/useEncaminhamentos';
import {
  ReferralType,
  ReferralUrgency,
  TransportType,
  REFERRAL_TYPE_LABELS,
  REFERRAL_TYPE_DESCRIPTIONS,
  REFERRAL_URGENCY_LABELS,
  REFERRAL_URGENCY_COLORS,
  TRANSPORT_LABELS,
  COMMON_SPECIALTIES,
} from '@/types/referral';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ReferralDialogProps {
  consultaId: string;
  pacienteId: string;
  pacienteNome: string;
  pacienteCpf: string;
  pacienteIdade?: number;
  profissionalNome: string;
  profissionalRegistro: string;
  profissionalTipoRegistro: string;
  selectedCids?: string[];
  trigger?: React.ReactNode;
}

const TYPE_ICONS: Record<ReferralType, React.ElementType> = {
  especialista: ArrowRight,
  ubs: Building2,
  pronto_atendimento: Hospital,
  internacao: BedDouble,
};

export function ReferralDialog({
  consultaId,
  pacienteId,
  pacienteNome,
  pacienteCpf,
  pacienteIdade,
  profissionalNome,
  profissionalRegistro,
  profissionalTipoRegistro,
  selectedCids = [],
  trigger,
}: ReferralDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const printRef = useRef<HTMLDivElement>(null);

  const { createEncaminhamento } = useEncaminhamentos(pacienteId);

  // Form state
  const [tipo, setTipo] = useState<ReferralType>('especialista');
  const [especialidadeDestino, setEspecialidadeDestino] = useState('');
  const [unidadeDestino, setUnidadeDestino] = useState('');
  const [profissionalDestino, setProfissionalDestino] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [hipoteseDiagnostica, setHipoteseDiagnostica] = useState('');
  const [urgencia, setUrgencia] = useState<ReferralUrgency>('eletivo');
  const [transporte, setTransporte] = useState<TransportType | ''>('');
  const [observacoes, setObservacoes] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = async () => {
    if (!justificativa.trim()) {
      return;
    }

    await createEncaminhamento.mutateAsync({
      consulta_id: consultaId,
      paciente_id: pacienteId,
      tipo,
      especialidade_destino: especialidadeDestino || undefined,
      unidade_destino: unidadeDestino || undefined,
      profissional_destino: profissionalDestino || undefined,
      justificativa,
      hipotese_diagnostica: hipoteseDiagnostica || undefined,
      cid_principal: selectedCids[0] || undefined,
      observacoes: observacoes || undefined,
      urgencia,
      transporte: transporte || undefined,
    });

    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setStep('form');
    setTipo('especialista');
    setEspecialidadeDestino('');
    setUnidadeDestino('');
    setProfissionalDestino('');
    setJustificativa('');
    setHipoteseDiagnostica('');
    setUrgencia('eletivo');
    setTransporte('');
    setObservacoes('');
  };

  const referralTypes: ReferralType[] = ['especialista', 'ubs', 'pronto_atendimento', 'internacao'];

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Send className="h-4 w-4" />
            Encaminhamento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>
            {step === 'form' ? 'Novo Encaminhamento' : 'Visualizar Guia'}
          </DialogTitle>
        </DialogHeader>

        {step === 'form' ? (
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="p-6 pt-4 space-y-6">
              {/* Referral Type Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Tipo de Encaminhamento</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {referralTypes.map((t) => {
                    const Icon = TYPE_ICONS[t];
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTipo(t)}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all text-left',
                          tipo === t
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <Icon className={cn('h-6 w-6 mb-2', tipo === t ? 'text-primary' : 'text-muted-foreground')} />
                        <p className="font-medium text-sm">{REFERRAL_TYPE_LABELS[t]}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Destination fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tipo === 'especialista' && (
                  <div className="space-y-2">
                    <Label>Especialidade</Label>
                    <Select value={especialidadeDestino} onValueChange={setEspecialidadeDestino}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a especialidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_SPECIALTIES.map((spec) => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Unidade de Destino</Label>
                  <Input
                    placeholder="Nome da unidade de saúde"
                    value={unidadeDestino}
                    onChange={(e) => setUnidadeDestino(e.target.value)}
                  />
                </div>

                {tipo === 'especialista' && (
                  <div className="space-y-2">
                    <Label>Profissional de Destino (opcional)</Label>
                    <Input
                      placeholder="Nome do profissional"
                      value={profissionalDestino}
                      onChange={(e) => setProfissionalDestino(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Clinical information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Hipótese Diagnóstica</Label>
                  <Input
                    placeholder="Ex: Hipertensão Arterial Sistêmica"
                    value={hipoteseDiagnostica}
                    onChange={(e) => setHipoteseDiagnostica(e.target.value)}
                  />
                  {selectedCids.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {selectedCids.map((cid) => (
                        <Badge key={cid} variant="secondary" className="text-xs">
                          {cid}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Justificativa / Motivo do Encaminhamento *</Label>
                  <Textarea
                    placeholder="Descreva o motivo do encaminhamento, histórico relevante e expectativa..."
                    value={justificativa}
                    onChange={(e) => setJustificativa(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Observações Adicionais</Label>
                  <Textarea
                    placeholder="Informações complementares..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                </div>
              </div>

              <Separator />

              {/* Urgency and Transport */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Urgência</Label>
                  <RadioGroup value={urgencia} onValueChange={(v) => setUrgencia(v as ReferralUrgency)}>
                    {(['eletivo', 'urgente', 'emergencia'] as ReferralUrgency[]).map((u) => (
                      <div key={u} className="flex items-center space-x-2">
                        <RadioGroupItem value={u} id={u} />
                        <Label htmlFor={u} className="cursor-pointer">
                          <Badge className={cn('font-normal', REFERRAL_URGENCY_COLORS[u])}>
                            {REFERRAL_URGENCY_LABELS[u]}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {(tipo === 'pronto_atendimento' || tipo === 'internacao') && (
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Transporte</Label>
                    <RadioGroup value={transporte} onValueChange={(v) => setTransporte(v as TransportType)}>
                      {(['proprio', 'ambulancia', 'uti_movel'] as TransportType[]).map((t) => (
                        <div key={t} className="flex items-center space-x-2">
                          <RadioGroupItem value={t} id={`transport-${t}`} />
                          <Label htmlFor={`transport-${t}`} className="cursor-pointer">
                            {TRANSPORT_LABELS[t]}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep('preview')}
                  disabled={!justificativa.trim()}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!justificativa.trim() || createEncaminhamento.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Salvar Encaminhamento
                </Button>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="p-6 pt-4">
            {/* Print Preview */}
            <div
              ref={printRef}
              className="bg-white p-8 rounded-lg border shadow-sm print:shadow-none print:border-0"
              style={{ minHeight: '600px' }}
            >
              {/* Header */}
              <div className="text-center mb-6 pb-4 border-b-2 border-primary">
                <h1 className="text-xl font-bold text-primary">GUIA DE ENCAMINHAMENTO</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>

              {/* Type Badge */}
              <div className="flex justify-center mb-6">
                <Badge className={cn('text-base px-4 py-1', REFERRAL_URGENCY_COLORS[urgencia])}>
                  {REFERRAL_TYPE_LABELS[tipo]} - {REFERRAL_URGENCY_LABELS[urgencia]}
                </Badge>
              </div>

              {/* Patient Info */}
              <Card className="mb-4">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">DADOS DO PACIENTE</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nome:</span>{' '}
                      <strong>{pacienteNome}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CPF:</span>{' '}
                      <strong>{pacienteCpf}</strong>
                    </div>
                    {pacienteIdade && (
                      <div>
                        <span className="text-muted-foreground">Idade:</span>{' '}
                        <strong>{pacienteIdade} anos</strong>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Destination Info */}
              <Card className="mb-4">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">ENCAMINHAMENTO PARA</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="space-y-1 text-sm">
                    {especialidadeDestino && (
                      <div>
                        <span className="text-muted-foreground">Especialidade:</span>{' '}
                        <strong>{especialidadeDestino}</strong>
                      </div>
                    )}
                    {unidadeDestino && (
                      <div>
                        <span className="text-muted-foreground">Unidade:</span>{' '}
                        <strong>{unidadeDestino}</strong>
                      </div>
                    )}
                    {profissionalDestino && (
                      <div>
                        <span className="text-muted-foreground">Profissional:</span>{' '}
                        <strong>{profissionalDestino}</strong>
                      </div>
                    )}
                    {transporte && (
                      <div>
                        <span className="text-muted-foreground">Transporte:</span>{' '}
                        <strong>{TRANSPORT_LABELS[transporte]}</strong>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Clinical Info */}
              <Card className="mb-4">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">INFORMAÇÕES CLÍNICAS</CardTitle>
                </CardHeader>
                <CardContent className="py-2 space-y-3">
                  {hipoteseDiagnostica && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Hipótese Diagnóstica:</span>{' '}
                      <strong>{hipoteseDiagnostica}</strong>
                      {selectedCids.length > 0 && (
                        <span className="ml-2">({selectedCids.join(', ')})</span>
                      )}
                    </div>
                  )}
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">Justificativa:</p>
                    <p className="whitespace-pre-wrap">{justificativa}</p>
                  </div>
                  {observacoes && (
                    <div className="text-sm">
                      <p className="text-muted-foreground mb-1">Observações:</p>
                      <p className="whitespace-pre-wrap">{observacoes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Signature */}
              <div className="mt-12 pt-6 border-t text-center">
                <div className="inline-block">
                  <div className="border-t border-foreground w-64 mx-auto mb-2"></div>
                  <p className="font-semibold">{profissionalNome}</p>
                  <p className="text-sm text-muted-foreground">
                    {profissionalTipoRegistro}: {profissionalRegistro}
                  </p>
                </div>
              </div>
            </div>

            {/* Print Actions */}
            <div className="flex justify-end gap-3 mt-4 print:hidden">
              <Button variant="outline" onClick={() => setStep('form')}>
                Voltar
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
