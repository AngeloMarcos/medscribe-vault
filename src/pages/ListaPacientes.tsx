import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  Search,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  UserX,
  UserMinus,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { mockAppointments, especialidades, zonas, turnos, salas, MockAppointment } from "@/data/mockData";
import { PatientAttendanceModal } from "@/components/PatientAttendanceModal";

type StatusTab = 'agendado' | 'aguardando' | 'em_atendimento' | 'atendido' | 'pendente' | 'ausente';

const statusTabs: { value: StatusTab; label: string }[] = [
  { value: 'agendado', label: 'Agendados' },
  { value: 'aguardando', label: 'Aguardando Atendimento' },
  { value: 'em_atendimento', label: 'Em Atendimento' },
  { value: 'atendido', label: 'Atendidos' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'ausente', label: 'Ausentes' },
];

const getStatusColor = (status: MockAppointment['status']) => {
  switch (status) {
    case 'atendido':
      return 'bg-success/10';
    case 'em_atendimento':
      return 'bg-warning/10';
    case 'aguardando':
      return 'bg-info/10';
    case 'ausente':
      return 'bg-destructive/10';
    case 'pendente':
      return 'bg-muted';
    default:
      return '';
  }
};

export default function ListaPacientes() {
  const [date, setDate] = useState<Date>(new Date());
  const [zona, setZona] = useState<string>("");
  const [turno, setTurno] = useState<string>("");
  const [sala, setSala] = useState<string>("");
  const [especialidade, setEspecialidade] = useState<string>("");
  const [activeTab, setActiveTab] = useState<StatusTab>('agendado');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<MockAppointment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredAppointments = mockAppointments.filter(
    (apt) => apt.status === activeTab
  );

  const counts = {
    agendado: mockAppointments.filter((a) => a.status === 'agendado').length,
    aguardando: mockAppointments.filter((a) => a.status === 'aguardando').length,
    em_atendimento: mockAppointments.filter((a) => a.status === 'em_atendimento').length,
    atendido: mockAppointments.filter((a) => a.status === 'atendido').length,
    pendente: mockAppointments.filter((a) => a.status === 'pendente').length,
    ausente: mockAppointments.filter((a) => a.status === 'ausente').length,
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredAppointments.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredAppointments.map((a) => a.id));
    }
  };

  const toggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleViewPatient = (appointment: MockAppointment) => {
    setSelectedAppointment(appointment);
    setModalOpen(true);
  };

  const clearFilters = () => {
    setZona("");
    setTurno("");
    setSala("");
    setEspecialidade("");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Lista de Pacientes do Ambulatório</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie os pacientes agendados para hoje
        </p>
      </div>

      {/* Filters Card */}
      <Card className="card-neumorphic">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date */}
            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Zona */}
            <div className="space-y-2">
              <Label>Zona</Label>
              <Select value={zona} onValueChange={setZona}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {zonas.map((z) => (
                    <SelectItem key={z} value={z}>{z}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Turno */}
            <div className="space-y-2">
              <Label>Turno</Label>
              <Select value={turno} onValueChange={setTurno}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {turnos.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sala */}
            <div className="space-y-2">
              <Label>Sala</Label>
              <Select value={sala} onValueChange={setSala}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {salas.slice(0, 10).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Especialidade */}
            <div className="space-y-2 md:col-span-2">
              <Label>Especialidade/Agenda</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar especialidade..."
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button className="gap-2">
              <Search className="h-4 w-4" />
              Pesquisar
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StatusTab)}>
        <TabsList className="w-full justify-start h-auto flex-wrap gap-1 bg-transparent p-0">
          {statusTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground px-4 py-2 rounded-lg"
            >
              {tab.label} ({counts[tab.value]})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Table */}
      <Card className="card-neumorphic overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.length === filteredAppointments.length && filteredAppointments.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Idade</TableHead>
              <TableHead>Prontuário</TableHead>
              <TableHead>Consulta</TableHead>
              <TableHead>Chegada</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Sala</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  Nenhum paciente encontrado neste status
                </TableCell>
              </TableRow>
            ) : (
              filteredAppointments.map((apt) => (
                <TableRow
                  key={apt.id}
                  className={cn(
                    "transition-colors hover:bg-muted/50",
                    getStatusColor(apt.status)
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(apt.id)}
                      onCheckedChange={() => toggleRow(apt.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{apt.hora}</TableCell>
                  <TableCell>
                    <span className="font-medium">{apt.patientName}</span>
                  </TableCell>
                  <TableCell>{apt.age}</TableCell>
                  <TableCell className="font-clinical">{apt.prontuario}</TableCell>
                  <TableCell className="font-clinical">{apt.consultaId}</TableCell>
                  <TableCell>
                    {apt.chegada ? (
                      <Badge variant="secondary" className="bg-success/20 text-success">
                        {apt.chegada}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{apt.especialidade}</Badge>
                  </TableCell>
                  <TableCell>{apt.sala}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewPatient(apt)}
                        title="Ver atendimento"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Editar">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Remover" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Table Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Exibindo {filteredAppointments.length} de {mockAppointments.length} registros
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled>
              Próximo
            </Button>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" className="gap-2">
          <UserX className="h-4 w-4" />
          Marcar Falta do Paciente
        </Button>
        <Button variant="outline" className="gap-2">
          <UserMinus className="h-4 w-4" />
          Marcar Falta do Profissional
        </Button>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Attendance Modal */}
      <PatientAttendanceModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        appointment={selectedAppointment}
      />
    </div>
  );
}
