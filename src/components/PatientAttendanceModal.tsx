import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Printer, Save, FileText, Calendar, User, Hash } from "lucide-react";
import { MockAppointment, mockEvolutions, cids } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

interface PatientAttendanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: MockAppointment | null;
}

export function PatientAttendanceModal({
  open,
  onOpenChange,
  appointment,
}: PatientAttendanceModalProps) {
  const { toast } = useToast();
  const [anamnese, setAnamnese] = useState("");
  const [evolucao, setEvolucao] = useState("");
  const [cidInput, setCidInput] = useState("");
  const [selectedCids, setSelectedCids] = useState<typeof cids>([]);
  const [receita, setReceita] = useState("");
  const [atestado, setAtestado] = useState("");
  const [relatorio, setRelatorio] = useState("");
  const [diasAfastamento, setDiasAfastamento] = useState("");

  const filteredCids = cids.filter(
    (cid) =>
      cid.code.toLowerCase().includes(cidInput.toLowerCase()) ||
      cid.description.toLowerCase().includes(cidInput.toLowerCase())
  );

  const addCid = (cid: (typeof cids)[0]) => {
    if (!selectedCids.find((c) => c.code === cid.code)) {
      setSelectedCids([...selectedCids, cid]);
    }
    setCidInput("");
  };

  const removeCid = (code: string) => {
    setSelectedCids(selectedCids.filter((c) => c.code !== code));
  };

  const handleFinalize = () => {
    if (!evolucao && !anamnese) {
      toast({
        title: "Atenção",
        description: "Preencha pelo menos a anamnese ou evolução antes de finalizar.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Atendimento Finalizado",
      description: "O atendimento foi salvo com sucesso.",
    });
    onOpenChange(false);
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 glass-modal">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl font-semibold">
            Atendimento do Paciente
          </DialogTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Paciente</p>
                <p className="font-medium text-sm">{appointment.patientName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Idade</p>
                <p className="font-medium text-sm">{appointment.age}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Prontuário</p>
                <p className="font-medium text-sm font-clinical">{appointment.prontuario}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Consulta</p>
                <p className="font-medium text-sm font-clinical">{appointment.consultaId}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">{appointment.especialidade}</Badge>
            <Badge variant="outline">Sala {appointment.sala}</Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="consultas" className="flex-1">
          <TabsList className="w-full justify-start px-6 py-0 h-12 bg-muted/50 rounded-none border-b">
            <TabsTrigger value="consultas" className="data-[state=active]:bg-card">
              Consultas Anteriores
            </TabsTrigger>
            <TabsTrigger value="anamnese" className="data-[state=active]:bg-card">
              Anamnese
            </TabsTrigger>
            <TabsTrigger value="evolucao" className="data-[state=active]:bg-card">
              Evolução
            </TabsTrigger>
            <TabsTrigger value="cid" className="data-[state=active]:bg-card">
              CID/Procedimentos
            </TabsTrigger>
            <TabsTrigger value="receita" className="data-[state=active]:bg-card">
              Receita
            </TabsTrigger>
            <TabsTrigger value="atestado" className="data-[state=active]:bg-card">
              Atestado
            </TabsTrigger>
            <TabsTrigger value="relatorio" className="data-[state=active]:bg-card">
              Relatório
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px]">
            <div className="p-6">
              {/* Consultas Anteriores */}
              <TabsContent value="consultas" className="mt-0 space-y-4">
                {mockEvolutions.map((evo) => (
                  <Card key={evo.id} className="card-neumorphic">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-medium">Data/Hora: {evo.date}</p>
                          <p className="text-sm text-muted-foreground">Consulta: {evo.consulta}</p>
                        </div>
                        <Badge variant="secondary">{evo.especialidade}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Equipe: {evo.equipe}</p>
                      <div className="bg-muted/50 rounded-lg p-3 mt-2">
                        <p className="text-sm font-medium mb-1">Evolução:</p>
                        <pre className="text-sm whitespace-pre-wrap font-clinical">{evo.text}</pre>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Anamnese */}
              <TabsContent value="anamnese" className="mt-0">
                <Label htmlFor="anamnese">Anamnese</Label>
                <Textarea
                  id="anamnese"
                  placeholder="Digite a anamnese do paciente..."
                  value={anamnese}
                  onChange={(e) => setAnamnese(e.target.value)}
                  className="min-h-[300px] mt-2 font-clinical"
                />
              </TabsContent>

              {/* Evolução */}
              <TabsContent value="evolucao" className="mt-0">
                <Label htmlFor="evolucao">Evolução</Label>
                <Textarea
                  id="evolucao"
                  placeholder="Digite a evolução do atendimento..."
                  value={evolucao}
                  onChange={(e) => setEvolucao(e.target.value)}
                  className="min-h-[300px] mt-2 font-clinical"
                />
              </TabsContent>

              {/* CID/Procedimentos */}
              <TabsContent value="cid" className="mt-0 space-y-4">
                <div>
                  <Label htmlFor="cid-search">Buscar CID</Label>
                  <div className="relative mt-2">
                    <Input
                      id="cid-search"
                      placeholder="Digite o código ou descrição (ex: H52.1)"
                      value={cidInput}
                      onChange={(e) => setCidInput(e.target.value)}
                    />
                    {cidInput && (
                      <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-48 overflow-auto">
                        {filteredCids.map((cid) => (
                          <button
                            key={cid.code}
                            onClick={() => addCid(cid)}
                            className="w-full px-4 py-2 text-left hover:bg-muted text-sm"
                          >
                            <span className="font-medium">{cid.code}</span> - {cid.description}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label>CIDs Selecionados</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCids.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhum CID selecionado</p>
                    ) : (
                      selectedCids.map((cid) => (
                        <Badge key={cid.code} variant="secondary" className="gap-1 pr-1">
                          {cid.code} - {cid.description}
                          <button
                            onClick={() => removeCid(cid.code)}
                            className="ml-1 hover:bg-muted rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Receita */}
              <TabsContent value="receita" className="mt-0 space-y-4">
                <div className="bg-muted/30 rounded-lg p-4 border">
                  <h4 className="font-semibold text-center mb-4">Receituário Médico</h4>
                  <p className="text-sm"><strong>Paciente:</strong> {appointment.patientName}</p>
                  <p className="text-sm mb-4"><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
                <Textarea
                  placeholder="Digite a prescrição médica..."
                  value={receita}
                  onChange={(e) => setReceita(e.target.value)}
                  className="min-h-[200px] font-clinical"
                />
                <Button variant="outline" className="gap-2">
                  <Printer className="h-4 w-4" />
                  Imprimir Receita
                </Button>
              </TabsContent>

              {/* Atestado */}
              <TabsContent value="atestado" className="mt-0 space-y-4">
                <div className="bg-muted/30 rounded-lg p-4 border">
                  <p className="text-sm">
                    Atesto para os devidos fins que o(a) paciente <strong>{appointment.patientName}</strong>, 
                    foi atendido(a) nesta data, necessitando de
                  </p>
                  <div className="flex items-center gap-2 my-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={diasAfastamento}
                      onChange={(e) => setDiasAfastamento(e.target.value)}
                      className="w-20"
                    />
                    <span className="text-sm">dias de afastamento de suas atividades.</span>
                  </div>
                  <p className="text-sm"><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <Label htmlFor="atestado-obs">Observações</Label>
                  <Textarea
                    id="atestado-obs"
                    placeholder="Observações adicionais..."
                    value={atestado}
                    onChange={(e) => setAtestado(e.target.value)}
                    className="min-h-[100px] mt-2"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Printer className="h-4 w-4" />
                  Imprimir Atestado
                </Button>
              </TabsContent>

              {/* Relatório */}
              <TabsContent value="relatorio" className="mt-0">
                <Label htmlFor="relatorio">Relatório Médico</Label>
                <Textarea
                  id="relatorio"
                  placeholder="Digite o relatório médico completo..."
                  value={relatorio}
                  onChange={(e) => setRelatorio(e.target.value)}
                  className="min-h-[300px] mt-2 font-clinical"
                />
                <Button variant="outline" className="gap-2 mt-4">
                  <Printer className="h-4 w-4" />
                  Imprimir Relatório
                </Button>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        <div className="p-6 border-t border-border flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleFinalize} className="gap-2">
            <Save className="h-4 w-4" />
            Finalizar Atendimento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
