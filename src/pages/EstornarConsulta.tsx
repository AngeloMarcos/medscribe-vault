import { useState } from "react";
import { Search, RotateCcw, AlertTriangle, Calendar, User, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mockAppointments, mockPatients } from "@/data/mockData";
import { toast } from "sonner";

const statusLabels: Record<string, { label: string; color: string }> = {
  agendado: { label: "Agendado", color: "bg-info/20 text-info" },
  aguardando: { label: "Aguardando", color: "bg-warning/20 text-warning" },
  em_atendimento: { label: "Em Atendimento", color: "bg-primary/20 text-primary" },
  atendido: { label: "Atendido", color: "bg-success/20 text-success" },
  pendente: { label: "Pendente", color: "bg-muted text-muted-foreground" },
  ausente: { label: "Ausente", color: "bg-destructive/20 text-destructive" },
};

export default function EstornarConsulta() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"consulta" | "prontuario" | "paciente">("consulta");
  const [searchResults, setSearchResults] = useState<typeof mockAppointments>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<typeof mockAppointments[0] | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [motivo, setMotivo] = useState("");

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast.error("Digite um termo para buscar");
      return;
    }

    setHasSearched(true);
    const term = searchTerm.toLowerCase();

    let results = mockAppointments.filter((apt) => {
      switch (searchType) {
        case "consulta":
          return apt.consultaId.includes(term);
        case "prontuario":
          return apt.prontuario.includes(term);
        case "paciente":
          return apt.patientName.toLowerCase().includes(term);
        default:
          return false;
      }
    });

    setSearchResults(results);

    if (results.length === 0) {
      toast.info("Nenhuma consulta encontrada");
    }
  };

  const handleEstornar = () => {
    if (!motivo.trim()) {
      toast.error("Informe o motivo do estorno");
      return;
    }

    // Simulate the reversal
    toast.success(`Consulta ${selectedAppointment?.consultaId} estornada com sucesso`);
    setConfirmDialogOpen(false);
    setSelectedAppointment(null);
    setMotivo("");
    
    // Remove from results
    setSearchResults(searchResults.filter(apt => apt.id !== selectedAppointment?.id));
  };

  const openConfirmDialog = (appointment: typeof mockAppointments[0]) => {
    setSelectedAppointment(appointment);
    setConfirmDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Estornar Consulta</h1>
        <p className="text-muted-foreground">
          Busque e estorne consultas realizadas ou agendadas
        </p>
      </div>

      {/* Search Card */}
      <Card className="card-neumorphic">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Buscar Consulta
          </CardTitle>
          <CardDescription>
            Localize a consulta pelo número, prontuário ou nome do paciente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Busca</Label>
              <Select value={searchType} onValueChange={(v) => setSearchType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consulta">Nº da Consulta</SelectItem>
                  <SelectItem value="prontuario">Nº do Prontuário</SelectItem>
                  <SelectItem value="paciente">Nome do Paciente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Termo de Busca</Label>
              <Input
                placeholder={
                  searchType === "consulta"
                    ? "Ex: 2514433"
                    : searchType === "prontuario"
                    ? "Ex: 3898888"
                    : "Ex: Maria Silva"
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full gap-2">
                <Search className="h-4 w-4" />
                Pesquisar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <Card className="card-neumorphic">
          <CardHeader>
            <CardTitle className="text-lg">
              Resultados ({searchResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {searchResults.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma consulta encontrada com os critérios informados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{apt.patientName}</p>
                        <p className="text-sm text-muted-foreground">
                          Prontuário: {apt.prontuario} • Consulta: {apt.consultaId}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Hora:</span>{" "}
                        <span className="font-medium">{apt.hora}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Esp:</span>{" "}
                        <span className="font-medium">{apt.especialidade}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Sala:</span>{" "}
                        <span className="font-medium">{apt.sala}</span>
                      </div>
                      <Badge className={statusLabels[apt.status]?.color || "bg-muted"}>
                        {statusLabels[apt.status]?.label || apt.status}
                      </Badge>
                    </div>

                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={() => openConfirmDialog(apt)}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Estornar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Estorno
            </DialogTitle>
            <DialogDescription>
              Esta ação irá reverter a consulta e não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paciente:</span>
                  <span className="font-medium">{selectedAppointment.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consulta:</span>
                  <span className="font-medium">{selectedAppointment.consultaId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Especialidade:</span>
                  <span className="font-medium">{selectedAppointment.especialidade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={statusLabels[selectedAppointment.status]?.color || "bg-muted"}>
                    {statusLabels[selectedAppointment.status]?.label}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo do Estorno *</Label>
                <Textarea
                  id="motivo"
                  placeholder="Informe o motivo do estorno..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleEstornar}>
              Confirmar Estorno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
