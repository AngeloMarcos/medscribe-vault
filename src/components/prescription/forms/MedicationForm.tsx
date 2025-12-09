import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const medicationSchema = z.object({
  medication: z.string().min(1, "Medicamento é obrigatório"),
  dose: z.string().min(1, "Dose é obrigatória").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Dose deve ser um número positivo"
  ),
  unit: z.string().min(1, "Unidade é obrigatória"),
  route: z.string().min(1, "Via é obrigatória"),
  allRoutes: z.boolean().default(false),
  frequency: z.string().min(1, "Frequência é obrigatória"),
  scheduleType: z.string().min(1, "Tipo de aprazamento é obrigatório"),
  diluent: z.string().optional(),
  volume: z.string().optional(),
  runIn: z.string().optional(),
  timeUnit: z.string().optional(),
  infusionRate: z.string().optional(),
  infusionUnit: z.string().optional(),
  infusionPump: z.boolean().default(false),
  startDateTime: z.date().optional(),
  observation: z.string().optional(),
}).refine(
  (data) => {
    if (data.infusionPump && !data.infusionRate) {
      return false;
    }
    return true;
  },
  {
    message: "Velocidade de infusão é obrigatória quando usar bomba",
    path: ["infusionRate"],
  }
);

type MedicationFormValues = z.infer<typeof medicationSchema>;

interface MedicationFormProps {
  onSave: (data: MedicationFormValues) => void;
  onCancel: () => void;
}

// Mock medication list - replace with actual API call
const medicationsList = [
  "Dipirona 500mg",
  "Paracetamol 750mg",
  "Omeprazol 20mg",
  "Amoxicilina 500mg",
  "Ibuprofeno 600mg",
  "Losartana 50mg",
  "Metformina 850mg",
  "Atenolol 50mg",
  "Sinvastatina 20mg",
  "Captopril 25mg",
];

const units = ["mg", "g", "mL", "mcg", "UI", "%"];

const routes = [
  { value: "oral", label: "Oral" },
  { value: "ev", label: "EV (Endovenosa)" },
  { value: "im", label: "IM (Intramuscular)" },
  { value: "sc", label: "SC (Subcutânea)" },
  { value: "topica", label: "Tópica" },
  { value: "retal", label: "Retal" },
  { value: "sng", label: "SNG (Sonda)" },
  { value: "inalatoria", label: "Inalatória" },
];

const scheduleTypes = [
  { value: "horario_fixo", label: "Horário Fixo" },
  { value: "intervalo_regular", label: "Intervalo Regular" },
  { value: "dose_unica", label: "Dose Única" },
  { value: "sos", label: "Se Necessário (SOS)" },
];

const timeUnits = ["minutos", "horas"];

const infusionUnits = ["mL/h", "gotas/min", "mg/h"];

const standardTexts = [
  "Diluir antes de administrar",
  "Infundir lentamente",
  "Verificar acesso venoso antes",
  "Monitorar sinais vitais",
  "Administrar em jejum",
];

export function MedicationForm({ onSave, onCancel }: MedicationFormProps) {
  const [medicationOpen, setMedicationOpen] = useState(false);
  const [customMedication, setCustomMedication] = useState("");
  const [standardTextOpen, setStandardTextOpen] = useState(false);

  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      medication: "",
      dose: "",
      unit: "",
      route: "",
      allRoutes: false,
      frequency: "",
      scheduleType: "",
      diluent: "",
      volume: "",
      runIn: "",
      timeUnit: "",
      infusionRate: "",
      infusionUnit: "",
      infusionPump: false,
      startDateTime: new Date(),
      observation: "",
    },
  });

  const watchInfusionPump = form.watch("infusionPump");

  const handleSubmit = (data: MedicationFormValues) => {
    onSave(data);
    form.reset();
  };

  const handleStandardTextSelect = (text: string) => {
    const currentObs = form.getValues("observation") || "";
    form.setValue("observation", currentObs ? `${currentObs}\n${text}` : text);
    setStandardTextOpen(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Medication Combobox */}
          <FormField
            control={form.control}
            name="medication"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>
                  Medicamento <span className="text-destructive">*</span>
                </FormLabel>
                <Popover open={medicationOpen} onOpenChange={setMedicationOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value || "Buscar medicamento..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Buscar medicamento..."
                        value={customMedication}
                        onValueChange={setCustomMedication}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              field.onChange(customMedication);
                              setMedicationOpen(false);
                            }}
                          >
                            Usar: "{customMedication}"
                          </Button>
                        </CommandEmpty>
                        <CommandGroup>
                          {medicationsList
                            .filter((med) =>
                              med.toLowerCase().includes(customMedication.toLowerCase())
                            )
                            .map((medication) => (
                              <CommandItem
                                key={medication}
                                value={medication}
                                onSelect={() => {
                                  field.onChange(medication);
                                  setMedicationOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === medication ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {medication}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dose */}
          <FormField
            control={form.control}
            name="dose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Dose <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="number" step="any" min="0" placeholder="Ex.: 500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Unit */}
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Unidade <span className="text-destructive">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Route */}
          <FormField
            control={form.control}
            name="route"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Via <span className="text-destructive">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {routes.map((route) => (
                      <SelectItem key={route.value} value={route.value}>
                        {route.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* All Routes Checkbox */}
          <FormField
            control={form.control}
            name="allRoutes"
            render={({ field }) => (
              <FormItem className="flex items-end space-x-2 pb-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer !mt-0">Todas as vias</FormLabel>
              </FormItem>
            )}
          />

          {/* Frequency */}
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Frequência <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="ex.: 8/8h" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Schedule Type */}
          <FormField
            control={form.control}
            name="scheduleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tipo de Aprazamento <span className="text-destructive">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {scheduleTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Diluent */}
          <FormField
            control={form.control}
            name="diluent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diluente</FormLabel>
                <FormControl>
                  <Input placeholder="Ex.: 0,9% NaCl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Volume */}
          <FormField
            control={form.control}
            name="volume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volume (mL)</FormLabel>
                <FormControl>
                  <Input type="number" step="any" min="0" placeholder="Ex.: 100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Run In */}
          <FormField
            control={form.control}
            name="runIn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correr em</FormLabel>
                <FormControl>
                  <Input type="number" step="any" min="0" placeholder="Ex.: 30" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Time Unit */}
          <FormField
            control={form.control}
            name="timeUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidade de Tempo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Infusion Rate */}
          <FormField
            control={form.control}
            name="infusionRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Velocidade de Infusão
                  {watchInfusionPump && <span className="text-destructive"> *</span>}
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ex.: 50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Infusion Unit */}
          <FormField
            control={form.control}
            name="infusionUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidade de Infusão</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {infusionUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Infusion Pump Checkbox */}
          <FormField
            control={form.control}
            name="infusionPump"
            render={({ field }) => (
              <FormItem className="flex items-end space-x-2 pb-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer !mt-0">Bomba de Infusão</FormLabel>
              </FormItem>
            )}
          />

          {/* Start Date/Time */}
          <FormField
            control={form.control}
            name="startDateTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Início Adm.</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? format(field.value, "dd/MM/yyyy HH:mm", { locale: ptBR })
                          : "Selecionar"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="pointer-events-auto"
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Observation */}
          <FormField
            control={form.control}
            name="observation"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <FormLabel>Observação</FormLabel>
                  <Popover open={standardTextOpen} onOpenChange={setStandardTextOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="link" size="sm" className="h-auto p-0">
                        Textos Padrão
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2" align="end">
                      <div className="space-y-1">
                        {standardTexts.map((text) => (
                          <Button
                            key={text}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left h-auto py-2"
                            onClick={() => handleStandardTextSelect(text)}
                          >
                            {text}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Observações adicionais"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            Salvar Medicamento
          </Button>
        </div>
      </form>
    </Form>
  );
}
