import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const careSchema = z.object({
  description: z
    .string()
    .min(10, "Descrição deve ter no mínimo 10 caracteres")
    .max(500, "Descrição deve ter no máximo 500 caracteres"),
  frequency: z.string().optional(),
});

type CareFormValues = z.infer<typeof careSchema>;

interface CareFormProps {
  onSave: (data: CareFormValues & { category: string }) => void;
  onCancel: () => void;
}

const standardCareTexts = [
  { id: "1", text: "Controle de sinais vitais 6/6h" },
  { id: "2", text: "Mudança de decúbito de 2/2h" },
  { id: "3", text: "Higiene oral após refeições" },
  { id: "4", text: "Curativo em [local] 1x ao dia" },
  { id: "5", text: "Balanço hídrico rigoroso" },
  { id: "6", text: "Avaliar dor regularmente" },
  { id: "7", text: "Manter cabeceira elevada 30°" },
  { id: "8", text: "Aspirar vias aéreas se necessário" },
  { id: "9", text: "Monitorar padrão respiratório" },
  { id: "10", text: "Glicemia capilar antes das refeições" },
];

export function CareForm({ onSave, onCancel }: CareFormProps) {
  const [standardTextsOpen, setStandardTextsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const form = useForm<CareFormValues>({
    resolver: zodResolver(careSchema),
    defaultValues: {
      description: "",
      frequency: "",
    },
  });

  const filteredTexts = standardCareTexts.filter((item) =>
    item.text.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelectStandardText = (text: string) => {
    form.setValue("description", text, { shouldValidate: true });
    setStandardTextsOpen(false);
    setSearchText("");
  };

  const onSubmit = (data: CareFormValues) => {
    onSave({
      ...data,
      category: "care",
    });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Descrição *</FormLabel>
                <Dialog open={standardTextsOpen} onOpenChange={setStandardTextsOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Usar Texto Padrão
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Textos Padrão de Cuidados</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar texto..."
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <ScrollArea className="h-[280px]">
                        <div className="space-y-1">
                          {filteredTexts.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelectStandardText(item.text)}
                              className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                            >
                              {item.text}
                            </button>
                          ))}
                          {filteredTexts.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Nenhum texto encontrado
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <FormControl>
                <Textarea
                  placeholder="Ex.: Controle de sinais vitais de 6/6h"
                  className="min-h-[100px] resize-none"
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
              <FormLabel>Frequência</FormLabel>
              <FormControl>
                <Input placeholder="Ex.: 6/6h ou 1x ao dia" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Salvar Cuidado</Button>
        </div>
      </form>
    </Form>
  );
}
