import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const solutionSchema = z.object({
  solution: z.string().min(1, "Solução é obrigatória"),
  volume: z.string().min(1, "Volume é obrigatório").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Volume deve ser um número positivo"
  ),
  frequency: z.string().min(1, "Frequência é obrigatória"),
  storageType: z.string().min(1, "Tipo de armazenamento é obrigatório"),
  runIn: z.string().optional(),
  timeUnit: z.string().optional(),
  observation: z.string().optional(),
}).refine(
  (data) => {
    if (data.runIn && data.runIn.trim() !== "" && !data.timeUnit) {
      return false;
    }
    return true;
  },
  {
    message: "Unidade de tempo é obrigatória quando 'Correr em' está preenchido",
    path: ["timeUnit"],
  }
);

type SolutionFormValues = z.infer<typeof solutionSchema>;

const solutionOptions = [
  { value: "Cloreto de Sódio 0,9%", label: "Cloreto de Sódio 0,9%" },
  { value: "Soro Glicosado 5%", label: "Soro Glicosado 5%" },
  { value: "Ringer Lactato", label: "Ringer Lactato" },
  { value: "Glicose 50%", label: "Glicose 50%" },
  { value: "Manitol 20%", label: "Manitol 20%" },
  { value: "Água Destilada", label: "Água Destilada" },
];

const storageTypes = [
  { value: "frasco", label: "Frasco" },
  { value: "bolsa", label: "Bolsa" },
  { value: "ampola", label: "Ampola" },
];

const timeUnits = [
  { value: "minutos", label: "minutos" },
  { value: "horas", label: "horas" },
];

interface SolutionFormProps {
  onSave: (data: SolutionFormValues & { category: string }) => void;
  onCancel: () => void;
}

export function SolutionForm({ onSave, onCancel }: SolutionFormProps) {
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [solutionSearch, setSolutionSearch] = useState("");

  const form = useForm<SolutionFormValues>({
    resolver: zodResolver(solutionSchema),
    defaultValues: {
      solution: "",
      volume: "",
      frequency: "",
      storageType: "",
      runIn: "",
      timeUnit: "",
      observation: "",
    },
  });

  const onSubmit = (data: SolutionFormValues) => {
    onSave({ ...data, category: "solution" });
    form.reset();
  };

  const filteredSolutionOptions = solutionOptions.filter((option) =>
    option.label.toLowerCase().includes(solutionSearch.toLowerCase())
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Solução */}
        <FormField
          control={form.control}
          name="solution"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                Solução <span className="text-destructive">*</span>
              </FormLabel>
              <Popover open={solutionOpen} onOpenChange={setSolutionOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={solutionOpen}
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value || "Selecione ou digite a solução..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Buscar solução..."
                      value={solutionSearch}
                      onValueChange={setSolutionSearch}
                    />
                    <CommandList>
                      <CommandEmpty>
                        <div className="p-2">
                          <Button
                            type="button"
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              field.onChange(solutionSearch);
                              setSolutionOpen(false);
                            }}
                          >
                            Usar: "{solutionSearch}"
                          </Button>
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredSolutionOptions.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            onSelect={() => {
                              field.onChange(option.value);
                              setSolutionOpen(false);
                              setSolutionSearch("");
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === option.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {option.label}
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

        {/* Volume e Frequência */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="volume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Volume (mL) <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ex.: 500"
                    min="1"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Frequência <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ex.: 8/8h" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tipo de Armazenamento */}
        <FormField
          control={form.control}
          name="storageType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Tipo de Armazenamento <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {storageTypes.map((type) => (
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

        {/* Correr em e Unidade de Tempo */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="runIn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correr em</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ex.: 30"
                    min="1"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timeUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidade de Tempo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeUnits.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Observação */}
        <FormField
          control={form.control}
          name="observation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observação</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações sobre administração"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botões */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Salvar Solução</Button>
        </div>
      </form>
    </Form>
  );
}
