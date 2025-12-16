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
  Filter,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { mockAppointments, especialidades, zonas, turnos, salas, MockAppointment } from "@/data/mockData";
import { PatientAttendanceModal } from "@/components/PatientAttendanceModal";
import { useResponsive } from "@/hooks/useResponsive";

type StatusTab = 'agendado' | 'aguardando' | 'em_atendimento' | 'atendido' | 'pendente' | 'ausente';

const statusTabs: { value: StatusTab; label: string; shortLabel: string }[] = [
  { value: 'agendado', label: 'Agendados', shortLabel: 'Agend.' },
  { value: 'aguardando', label: 'Aguardando', shortLabel: 'Aguard.' },
  { value: 'em_atendimento', label: 'Em Atendimento', shortLabel: 'Em Atend.' },
  { value: 'atendido', label: 'Atendidos', shortLabel: 'Atend.' },
  { value: 'pendente', label: 'Pendentes', shortLabel: 'Pend.' },
  { value: 'ausente', label: 'Ausentes', shortLabel: 'Aus.' },
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
  const { isMobile } = useResponsive();
  const [date, setDate] = useState<Date>(new Date());
  const [zona, setZona] = useState<string>("");
  const [turno, setTurno] = useState<string>("");
  const [sala, setSala] = useState<string>("");
  const [especialidade, setEspecialidade] = useState<string>("");
  const [activeTab, setActiveTab] = useState<StatusTab>('agendado');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<MockAppointment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(!isMobile);

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

  // Mobile Patient Card
  const PatientCard = ({ apt }: { apt: MockAppointment }) => (
    <div
      className={cn(
        "p-3 rounded-lg border border-border transition-colors",
        getStatusColor(apt.status)
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{apt.patientName}</p>
          <p className="text-xs text-muted-foreground">
            {apt.age} anos • Pront: {apt.prontuario}
          </p>
        </div>
        <Badge variant="outline" className="text-xs shrink-0">
          {apt.hora}
        </Badge>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-xs">
            {apt.especialidade}
          </Badge>
          <span>Sala {apt.sala}</span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleViewPatient(apt)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 lg:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-page-title">Lista de Pacientes</h1>
        <p className="text-caption mt-1">
          Gerencie os pacientes com consulta agendada
        </p>
      </div>

      {/* Filters Card */}
      <Card className="card-neumorphic">
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CardHeader className="pb-2 lg:pb-4">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer">
                <CardTitle className="text-card-title flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                </CardTitle>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <ChevronDown className={cn("h-4 w-4 transition-transform", filtersOpen && "rotate-180")} />
                </Button>
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {/* Date */}
                <div className="space-y-2">
                  <Label className="text-xs lg:text-sm">Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal text-xs lg:text-sm h-9 lg:h-10",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                        {date ? format(date, "dd/MM/yy", { locale: ptBR }) : "Selecione"}
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
                  <Label className="text-xs lg:text-sm">Zona</Label>
                  <Select value={zona} onValueChange={setZona}>
                    <SelectTrigger className="h-9 lg:h-10 text-xs lg:text-sm">
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
                  <Label className="text-xs lg:text-sm">Turno</Label>
                  <Select value={turno} onValueChange={setTurno}>
                    <SelectTrigger className="h-9 lg:h-10 text-xs lg:text-sm">
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
                  <Label className="text-xs lg:text-sm">Sala</Label>
                  <Select value={sala} onValueChange={setSala}>
                    <SelectTrigger className="h-9 lg:h-10 text-xs lg:text-sm">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {salas.slice(0, 10).map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Especialidade - full width on mobile */}
                <div className="space-y-2 col-span-2">
                  <Label className="text-xs lg:text-sm">Especialidade</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={especialidade}
                      onChange={(e) => setEspecialidade(e.target.value)}
                      className="pl-8 lg:pl-10 h-9 lg:h-10 text-xs lg:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 lg:gap-3 mt-4 lg:mt-6">
                <Button className="gap-2 h-9 lg:h-10 text-xs lg:text-sm">
                  <Search className="h-3 w-3 lg:h-4 lg:w-4" />
                  Pesquisar
                </Button>
                <Button variant="outline" onClick={clearFilters} className="h-9 lg:h-10 text-xs lg:text-sm">
                  Limpar
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StatusTab)}>
        <ScrollArea className="w-full">
          <TabsList className="w-max min-w-full lg:w-auto h-auto flex-nowrap gap-1 bg-transparent p-0">
            {statusTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground px-2 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm whitespace-nowrap"
              >
                <span className="lg:hidden">{tab.shortLabel}</span>
                <span className="hidden lg:inline">{tab.label}</span>
                <span className="ml-1">({counts[tab.value]})</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </Tabs>

      {/* Mobile: Card View */}
      {isMobile ? (
        <div className="space-y-3">
          {filteredAppointments.length === 0 ? (
            <Card className="card-neumorphic">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                Nenhum paciente encontrado
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.map((apt) => (
              <PatientCard key={apt.id} apt={apt} />
            ))
          )}
        </div>
      ) : (
        /* Desktop: Table View */
        <Card className="card-neumorphic overflow-hidden">
          <ScrollArea className="w-full">
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
                  <TableHead className="hidden xl:table-cell">Idade</TableHead>
                  <TableHead>Prontuário</TableHead>
                  <TableHead className="hidden xl:table-cell">Consulta</TableHead>
                  <TableHead className="hidden lg:table-cell">Chegada</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead className="hidden lg:table-cell">Sala</TableHead>
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
                      <TableCell className="hidden xl:table-cell">{apt.age}</TableCell>
                      <TableCell className="font-clinical">{apt.prontuario}</TableCell>
                      <TableCell className="font-clinical hidden xl:table-cell">{apt.consultaId}</TableCell>
                      <TableCell className="hidden lg:table-cell">
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
                      <TableCell className="hidden lg:table-cell">{apt.sala}</TableCell>
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
                          <Button variant="ghost" size="icon" title="Remover" className="text-destructive hidden lg:flex">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Table Footer */}
          <div className="p-3 lg:p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs lg:text-sm text-muted-foreground">
              {filteredAppointments.length} de {mockAppointments.length} registros
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled className="h-8 text-xs">
                Anterior
              </Button>
              <Button variant="outline" size="sm" disabled className="h-8 text-xs">
                Próximo
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 lg:gap-3">
        <Button variant="outline" className="gap-2 h-9 lg:h-10 text-xs lg:text-sm">
          <UserX className="h-3 w-3 lg:h-4 lg:w-4" />
          <span className="hidden sm:inline">Marcar</span> Falta Paciente
        </Button>
        <Button variant="outline" className="gap-2 h-9 lg:h-10 text-xs lg:text-sm hidden sm:flex">
          <UserMinus className="h-4 w-4" />
          Falta Profissional
        </Button>
        <Button variant="outline" className="gap-2 h-9 lg:h-10 text-xs lg:text-sm">
          <RefreshCw className="h-3 w-3 lg:h-4 lg:w-4" />
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
