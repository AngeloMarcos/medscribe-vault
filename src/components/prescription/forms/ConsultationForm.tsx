import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const consultationSchema = z.object({
  description: z
    .string()
    .min(5, "Descrição deve ter no mínimo 5 caracteres")
    .max(300, "Descrição deve ter no máximo 300 caracteres"),
});

type ConsultationFormValues = z.infer<typeof consultationSchema>;

interface ConsultationFormProps {
  onSave: (data: ConsultationFormValues & { category: string }) => void;
  onCancel: () => void;
}

const specialties = [
  "Psicologia",
  "Fisioterapia",
  "Nutrição",
  "Assistência Social",
  "Fonoaudiologia",
  "Terapia Ocupacional",
  "Odontologia",
];

const ConsultationForm = ({ onSave, onCancel }: ConsultationFormProps) => {
  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      description: "",
    },
  });

  const description = form.watch("description");
  const charCount = description?.length || 0;

  const handleSpecialtyClick = (specialty: string) => {
    form.setValue("description", `Avaliação da ${specialty}`, {
      shouldValidate: true,
    });
  };

  const onSubmit = (data: ConsultationFormValues) => {
    onSave({
      ...data,
      category: "consultation",
    });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Especialidades Sugeridas */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Especialidades Sugeridas
          </label>
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty) => (
              <Badge
                key={specialty}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleSpecialtyClick(specialty)}
              >
                {specialty}
              </Badge>
            ))}
          </div>
        </div>

        {/* Descrição */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Descrição *</FormLabel>
                <span
                  className={`text-xs ${
                    charCount > 250
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  ({charCount}/300)
                </span>
              </div>
              <FormControl>
                <Textarea
                  placeholder="Ex.: Avaliação da Psicologia 1x ao dia"
                  className="min-h-[75px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Salvar Consultoria</Button>
        </div>
      </form>
    </Form>
  );
};

export default ConsultationForm;
