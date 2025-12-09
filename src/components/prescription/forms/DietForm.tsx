import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Check, ChevronsUpDown, AlertCircle } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

const dietSchema = z.object({
  item: z.string().min(1, "Item da dieta é obrigatório"),
  quantity: z.string().optional(),
  unit: z.string().min(1, "Unidade é obrigatória"),
  frequency: z.string().min(1, "Frequência é obrigatória"),
  scheduleType: z.string().min(1, "Tipo de aprazamento é obrigatório"),
  numberOfTimes: z.string().optional(),
  infusionPump: z.boolean().default(false),
  observation: z.string().optional(),
});

type DietFormValues = z.infer<typeof dietSchema>;

const dietOptions = [
  { value: "Dieta Zero (jejum)", label: "Dieta Zero (jejum)" },
  { value: "Dieta Líquida", label: "Dieta Líquida" },
  { value: "Dieta Pastosa", label: "Dieta Pastosa" },
  { value: "Dieta Branda", label: "Dieta Branda" },
  { value: "Dieta Geral", label: "Dieta Geral" },
  { value: "Dieta Enteral Padrão", label: "Dieta Enteral Padrão" },
  { value: "Dieta Hipossódica", label: "Dieta Hipossódica" },
  { value: "Dieta Hipocalórica", label: "Dieta Hipocalórica" },
  { value: "Dieta para Diabético", label: "Dieta para Diabético" },
];

const dietUnits = [
  { value: "mL", label: "mL" },
  { value: "g", label: "g" },
  { value: "porção", label: "porção" },
  { value: "frasco", label: "frasco" },
];

const dietScheduleTypes = [
  { value: "horario_fixo", label: "Horário Fixo" },
  { value: "intervalo_regular", label: "Intervalo Regular" },
];

interface DietFormProps {
  onSave: (data: DietFormValues & { category: string }) => void;
  onCancel: () => void;
}

export function DietForm({ onSave, onCancel }: DietFormProps) {
  const [itemOpen, setItemOpen] = useState(false);
  const [itemSearch, setItemSearch] = useState("");

  const form = useForm<DietFormValues>({
    resolver: zodResolver(dietSchema),
    defaultValues: {
      item: "",
      quantity: "",
      unit: "",
      frequency: "",
      scheduleType: "",
      numberOfTimes: "",
      infusionPump: false,
      observation: "",
    },
  });

  const watchInfusionPump = form.watch("infusionPump");
  const watchItem = form.watch("item");

  const isEnteralDiet = watchItem?.toLowerCase().includes("enteral");

  const onSubmit = (data: DietFormValues) => {
    onSave({ ...data, category: "diet" });
    form.reset();
  };

  const filteredDietOptions = dietOptions.filter((option) =>
    option.label.toLowerCase().includes(itemSearch.toLowerCase())
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Item */}
        <FormField
          control={form.control}
          name="item"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                Item <span className="text-destructive">*</span>
              </FormLabel>
              <Popover open={itemOpen} onOpenChange={setItemOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={itemOpen}
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value || "Selecione ou digite a dieta..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Buscar dieta..."
                      value={itemSearch}
                      onValueChange={setItemSearch}
                    />
                    <CommandList>
                      <CommandEmpty>
                        <div className="p-2">
                          <Button
                            type="button"
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              field.onChange(itemSearch);
                              setItemOpen(false);
                            }}
                          >
                            Usar: "{itemSearch}"
                          </Button>
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredDietOptions.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            onSelect={() => {
                              field.onChange(option.value);
                              setItemOpen(false);
                              setItemSearch("");
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

        {/* Quantidade e Unidade */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ex.: 500"
                    min="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Unidade <span className="text-destructive">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dietUnits.map((unit) => (
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

        {/* Frequência e Tipo de Aprazamento */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Frequência <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ex.: 6/6h ou 4x ao dia" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tipo de Aprazamento <span className="text-destructive">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dietScheduleTypes.map((type) => (
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
        </div>

        {/* Número de Vezes */}
        <FormField
          control={form.control}
          name="numberOfTimes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Vezes</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ex.: 4"
                  min="1"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bomba de Infusão */}
        <FormField
          control={form.control}
          name="infusionPump"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Bomba de Infusão</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {watchInfusionPump && !isEnteralDiet && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Bomba de infusão é geralmente utilizada apenas para dietas enterais.
            </AlertDescription>
          </Alert>
        )}

        {/* Observação */}
        <FormField
          control={form.control}
          name="observation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observação</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ex.: Via sonda, temperatura ambiente"
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
          <Button type="submit">Salvar Dieta</Button>
        </div>
      </form>
    </Form>
  );
}
