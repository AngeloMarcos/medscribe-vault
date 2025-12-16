import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Search, Clock, Check, ChevronDown, Filter } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { especialidades, zonas, turnos, salas } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { useResponsive } from "@/hooks/useResponsive";

const diasSemana = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

const mockResults = [
  { id: '1', data: '05/12/2025', hora: '09:00', especialidade: 'Cardiologia', profissional: 'Dra. Maria Fernanda', sala: '12', vagas: 3 },
  { id: '2', data: '05/12/2025', hora: '10:00', especialidade: 'Cardiologia', profissional: 'Dra. Maria Fernanda', sala: '12', vagas: 2 },
  { id: '3', data: '06/12/2025', hora: '14:00', especialidade: 'Cardiologia', profissional: 'Dr. Carlos Alberto', sala: '15', vagas: 5 },
  { id: '4', data: '08/12/2025', hora: '08:30', especialidade: 'Cardiologia', profissional: 'Dra. Maria Fernanda', sala: '12', vagas: 1 },
  { id: '5', data: '10/12/2025', hora: '11:00', especialidade: 'Cardiologia', profissional: 'Dr. Carlos Alberto', sala: '15', vagas: 4 },
];

export default function MarcarConsulta() {
  const { toast } = useToast();
  const { isMobile } = useResponsive();
  const [especialidade, setEspecialidade] = useState("");
  const [equipe, setEquipe] = useState("");
  const [profissional, setProfissional] = useState("");
  const [dataConsulta, setDataConsulta] = useState<Date>();
  const [hora, setHora] = useState("");
  const [mesInicial, setMesInicial] = useState("");
  const [mesFinal, setMesFinal] = useState("");
  const [diaSemana, setDiaSemana] = useState("");
  const [zona, setZona] = useState("");
  const [sala, setSala] = useState("");
  const [turno, setTurno] = useState("");
  const [pagador, setPagador] = useState("");
  const [autorizacao, setAutorizacao] = useState("");
  const [condicaoAtendimento, setCondicaoAtendimento] = useState("");
  const [apenasDisponiveis, setApenasDisponiveis] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  const handleSearch = () => {
    setSearched(true);
    toast({
      title: "Busca realizada",
      description: "Foram encontrados 5 horários disponíveis.",
    });
  };

  const handleClear = () => {
    setEspecialidade("");
    setEquipe("");
    setProfissional("");
    setDataConsulta(undefined);
    setHora("");
    setMesInicial("");
    setMesFinal("");
    setDiaSemana("");
    setZona("");
    setSala("");
    setTurno("");
    setPagador("");
    setAutorizacao("");
    setCondicaoAtendimento("");
    setApenasDisponiveis(false);
    setSearched(false);
    setSelectedSlot(null);
  };

  const handleSchedule = () => {
    if (!selectedSlot) {
      toast({
        title: "Selecione um horário",
        description: "Por favor, selecione um horário disponível.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Consulta agendada",
      description: "A consulta foi agendada com sucesso!",
    });
    setSelectedSlot(null);
  };

  // Mobile Result Card
  const ResultCard = ({ result }: { result: typeof mockResults[0] }) => (
    <div
      className={cn(
        "p-3 rounded-lg border border-border cursor-pointer transition-all",
        selectedSlot === result.id ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
      )}
      onClick={() => setSelectedSlot(result.id)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
              selectedSlot === result.id ? "border-primary bg-primary" : "border-muted-foreground"
            )}
          >
            {selectedSlot === result.id && (
              <Check className="h-3 w-3 text-primary-foreground" />
            )}
          </div>
          <div>
            <p className="font-medium text-sm">{result.data} às {result.hora}</p>
            <p className="text-xs text-muted-foreground">{result.profissional}</p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={cn(
            "text-xs shrink-0",
            result.vagas <= 2 ? "bg-warning/20 text-warning" : "bg-success/20 text-success"
          )}
        >
          {result.vagas} vaga{result.vagas !== 1 && "s"}
        </Badge>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground ml-7">
        <Badge variant="outline" className="text-xs">{result.especialidade}</Badge>
        <span>Sala {result.sala}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-page-title">Marcar Consulta</h1>
        <p className="text-caption mt-1">
          Pesquisar disponibilidade de horários
        </p>
      </div>

      {/* Filters Card */}
      <Card className="card-neumorphic">
        <CardHeader className="pb-2 lg:pb-4">
          <CardTitle className="text-card-title flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros de Busca
          </CardTitle>
          <CardDescription className="text-xs lg:text-sm">
            Preencha os campos para buscar horários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Essential Filters (always visible) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {/* Especialidade/Agenda */}
            <div className="space-y-2 col-span-2">
              <Label className="text-xs lg:text-sm">Especialidade/Agenda</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar especialidade..."
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  className="pl-8 lg:pl-10 h-9 lg:h-10 text-xs lg:text-sm"
                  list="especialidades"
                />
                <datalist id="especialidades">
                  {especialidades.map((esp) => (
                    <option key={esp} value={esp} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Data da Consulta */}
            <div className="space-y-2">
              <Label className="text-xs lg:text-sm">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-9 lg:h-10 text-xs lg:text-sm",
                      !dataConsulta && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                    {dataConsulta
                      ? format(dataConsulta, "dd/MM/yy", { locale: ptBR })
                      : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataConsulta}
                    onSelect={setDataConsulta}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
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
          </div>

          {/* Advanced Filters (collapsible) */}
          <Collapsible open={advancedFiltersOpen} onOpenChange={setAdvancedFiltersOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="mt-3 lg:mt-4 gap-2 text-xs lg:text-sm">
                <ChevronDown className={cn("h-3 w-3 lg:h-4 lg:w-4 transition-transform", advancedFiltersOpen && "rotate-180")} />
                {advancedFiltersOpen ? "Menos filtros" : "Mais filtros"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-border">
                {/* Equipe */}
                <div className="space-y-2">
                  <Label className="text-xs lg:text-sm">Equipe</Label>
                  <Input
                    placeholder="Buscar..."
                    value={equipe}
                    onChange={(e) => setEquipe(e.target.value)}
                    className="h-9 lg:h-10 text-xs lg:text-sm"
                  />
                </div>

                {/* Profissional */}
                <div className="space-y-2">
                  <Label className="text-xs lg:text-sm">Profissional</Label>
                  <Input
                    placeholder="Buscar..."
                    value={profissional}
                    onChange={(e) => setProfissional(e.target.value)}
                    className="h-9 lg:h-10 text-xs lg:text-sm"
                  />
                </div>

                {/* Hora */}
                <div className="space-y-2">
                  <Label className="text-xs lg:text-sm">Hora</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={hora}
                      onChange={(e) => setHora(e.target.value)}
                      className="pl-8 lg:pl-10 h-9 lg:h-10 text-xs lg:text-sm"
                    />
                  </div>
                </div>

                {/* Dia da Semana */}
                <div className="space-y-2">
                  <Label className="text-xs lg:text-sm">Dia da Semana</Label>
                  <Select value={diaSemana} onValueChange={setDiaSemana}>
                    <SelectTrigger className="h-9 lg:h-10 text-xs lg:text-sm">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {diasSemana.map((dia) => (
                        <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

                {/* Sala */}
                <div className="space-y-2">
                  <Label className="text-xs lg:text-sm">Sala</Label>
                  <Select value={sala} onValueChange={setSala}>
                    <SelectTrigger className="h-9 lg:h-10 text-xs lg:text-sm">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {salas.slice(0, 15).map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pagador */}
                <div className="space-y-2">
                  <Label className="text-xs lg:text-sm">Pagador</Label>
                  <Select value={pagador} onValueChange={setPagador}>
                    <SelectTrigger className="h-9 lg:h-10 text-xs lg:text-sm">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sus">SUS</SelectItem>
                      <SelectItem value="particular">Particular</SelectItem>
                      <SelectItem value="convenio">Convênio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Condição */}
                <div className="space-y-2">
                  <Label className="text-xs lg:text-sm">Condição</Label>
                  <Select value={condicaoAtendimento} onValueChange={setCondicaoAtendimento}>
                    <SelectTrigger className="h-9 lg:h-10 text-xs lg:text-sm">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                      <SelectItem value="retorno">Retorno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Checkbox */}
                <div className="space-y-2 col-span-2 flex items-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="disponiveis"
                      checked={apenasDisponiveis}
                      onCheckedChange={(checked) => setApenasDisponiveis(!!checked)}
                    />
                    <label
                      htmlFor="disponiveis"
                      className="text-xs lg:text-sm font-medium leading-none"
                    >
                      Apenas com disponibilidade
                    </label>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex gap-2 lg:gap-3 mt-4 lg:mt-6">
            <Button onClick={handleSearch} className="gap-2 h-9 lg:h-10 text-xs lg:text-sm">
              <Search className="h-3 w-3 lg:h-4 lg:w-4" />
              Pesquisar
            </Button>
            <Button variant="outline" onClick={handleClear} className="h-9 lg:h-10 text-xs lg:text-sm">
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {searched && (
        <Card className="card-neumorphic overflow-hidden animate-fade-in">
          <CardHeader className="pb-2 lg:pb-4">
            <CardTitle className="text-card-title">Horários Disponíveis</CardTitle>
            <CardDescription className="text-xs lg:text-sm">
              Selecione um horário para agendar
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 lg:p-0">
            {/* Mobile: Card View */}
            {isMobile ? (
              <div className="p-3 space-y-2">
                {mockResults.map((result) => (
                  <ResultCard key={result.id} result={result} />
                ))}
              </div>
            ) : (
              /* Desktop: Table View */
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Especialidade</TableHead>
                      <TableHead>Profissional</TableHead>
                      <TableHead>Sala</TableHead>
                      <TableHead>Vagas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockResults.map((result) => (
                      <TableRow
                        key={result.id}
                        className={cn(
                          "cursor-pointer transition-colors",
                          selectedSlot === result.id && "bg-primary/10"
                        )}
                        onClick={() => setSelectedSlot(result.id)}
                      >
                        <TableCell>
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                              selectedSlot === result.id
                                ? "border-primary bg-primary"
                                : "border-muted-foreground"
                            )}
                          >
                            {selectedSlot === result.id && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{result.data}</TableCell>
                        <TableCell>{result.hora}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{result.especialidade}</Badge>
                        </TableCell>
                        <TableCell>{result.profissional}</TableCell>
                        <TableCell>{result.sala}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              result.vagas <= 2
                                ? "bg-warning/20 text-warning"
                                : "bg-success/20 text-success"
                            )}
                          >
                            {result.vagas} vaga{result.vagas !== 1 && "s"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </CardContent>
          <div className="p-3 lg:p-4 border-t border-border flex justify-end">
            <Button onClick={handleSchedule} disabled={!selectedSlot} className="h-9 lg:h-10 text-xs lg:text-sm">
              Agendar Consulta
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
