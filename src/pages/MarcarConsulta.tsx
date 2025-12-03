import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Search, Clock, Check } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { especialidades, zonas, turnos, salas } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

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
        description: "Por favor, selecione um horário disponível para agendar.",
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Marcar Consulta</h1>
        <p className="text-muted-foreground mt-1">
          Pesquisar disponibilidade de horários por grade/consulta
        </p>
      </div>

      {/* Filters Card */}
      <Card className="card-neumorphic">
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Busca</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para buscar horários disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Especialidade/Agenda */}
            <div className="space-y-2 lg:col-span-2">
              <Label>Especialidade/Agenda</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar especialidade..."
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  className="pl-10"
                  list="especialidades"
                />
                <datalist id="especialidades">
                  {especialidades.map((esp) => (
                    <option key={esp} value={esp} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Equipe */}
            <div className="space-y-2">
              <Label>Equipe</Label>
              <Input
                placeholder="Buscar equipe..."
                value={equipe}
                onChange={(e) => setEquipe(e.target.value)}
              />
            </div>

            {/* Profissional */}
            <div className="space-y-2">
              <Label>Profissional</Label>
              <Input
                placeholder="Buscar profissional..."
                value={profissional}
                onChange={(e) => setProfissional(e.target.value)}
              />
            </div>

            {/* Data da Consulta */}
            <div className="space-y-2">
              <Label>Data da Consulta</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataConsulta && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataConsulta
                      ? format(dataConsulta, "dd/MM/yyyy", { locale: ptBR })
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

            {/* Hora */}
            <div className="space-y-2">
              <Label>Hora</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Mês Inicial */}
            <div className="space-y-2">
              <Label>Mês Inicial</Label>
              <Input
                type="month"
                value={mesInicial}
                onChange={(e) => setMesInicial(e.target.value)}
              />
            </div>

            {/* Mês Final */}
            <div className="space-y-2">
              <Label>Mês Final</Label>
              <Input
                type="month"
                value={mesFinal}
                onChange={(e) => setMesFinal(e.target.value)}
              />
            </div>

            {/* Dia da Semana */}
            <div className="space-y-2">
              <Label>Dia da Semana</Label>
              <Select value={diaSemana} onValueChange={setDiaSemana}>
                <SelectTrigger>
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

            {/* Sala */}
            <div className="space-y-2">
              <Label>Sala</Label>
              <Select value={sala} onValueChange={setSala}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {salas.slice(0, 15).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
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

            {/* Pagador */}
            <div className="space-y-2">
              <Label>Pagador</Label>
              <Select value={pagador} onValueChange={setPagador}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sus">SUS</SelectItem>
                  <SelectItem value="particular">Particular</SelectItem>
                  <SelectItem value="convenio">Convênio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Autorização */}
            <div className="space-y-2">
              <Label>Autorização</Label>
              <Input
                placeholder="Número da autorização"
                value={autorizacao}
                onChange={(e) => setAutorizacao(e.target.value)}
              />
            </div>

            {/* Condição Atendimento */}
            <div className="space-y-2">
              <Label>Condição Atendimento</Label>
              <Select value={condicaoAtendimento} onValueChange={setCondicaoAtendimento}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="retorno">Retorno</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Apenas grades com disponibilidade */}
            <div className="space-y-2 flex items-end">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="disponiveis"
                  checked={apenasDisponiveis}
                  onCheckedChange={(checked) => setApenasDisponiveis(!!checked)}
                />
                <label
                  htmlFor="disponiveis"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Apenas grades com disponibilidade
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" />
              Pesquisar
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {searched && (
        <Card className="card-neumorphic overflow-hidden animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Horários Disponíveis</CardTitle>
            <CardDescription>
              Selecione um horário para agendar a consulta
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
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
          </CardContent>
          <div className="p-4 border-t border-border flex justify-end">
            <Button onClick={handleSchedule} disabled={!selectedSlot}>
              Agendar Consulta
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
