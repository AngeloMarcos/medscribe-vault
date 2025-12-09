import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShieldAlert } from "lucide-react";

export const HIGH_RISK_MEDICATIONS = [
  // Anticoagulantes
  "heparina",
  "enoxaparina",
  "warfarina",
  "rivaroxabana",
  "apixabana",
  "dabigatrana",
  // Insulinas
  "insulina",
  "insulina regular",
  "insulina nph",
  "insulina glargina",
  "insulina lispro",
  "insulina aspart",
  // Opioides
  "morfina",
  "fentanil",
  "fentanila",
  "tramadol",
  "codeína",
  "metadona",
  "oxicodona",
  // Quimioterápicos
  "metotrexato",
  "ciclofosfamida",
  "doxorrubicina",
  "vincristina",
  "cisplatina",
  "carboplatina",
  // Eletrólitos concentrados
  "cloreto de potássio",
  "kcl",
  "sulfato de magnésio",
  "gluconato de cálcio",
  // Sedativos
  "midazolam",
  "propofol",
  "cetamina",
  // Outros
  "digoxina",
  "amiodarona",
  "nitroprussiato",
  "noradrenalina",
  "adrenalina",
  "dopamina",
  "dobutamina",
];

export const isHighRiskMedication = (medicationName: string): boolean => {
  const normalized = medicationName.toLowerCase().trim();
  return HIGH_RISK_MEDICATIONS.some(
    (med) => normalized.includes(med) || med.includes(normalized)
  );
};

interface HighRiskAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicationName: string;
  dose?: string;
  route?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const HighRiskAlert = ({
  open,
  onOpenChange,
  medicationName,
  dose,
  route,
  onCancel,
  onConfirm,
}: HighRiskAlertProps) => {
  const [confirmed, setConfirmed] = useState(false);

  const handleCancel = () => {
    setConfirmed(false);
    onCancel();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    setConfirmed(false);
    onConfirm();
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setConfirmed(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-xs font-bold">
              ALTO RISCO
            </Badge>
          </div>
          <AlertDialogTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
            <ShieldAlert className="h-5 w-5" />
            Medicamento de Alto Risco
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <div className="rounded-md border border-orange-200 bg-white p-3 dark:border-orange-800 dark:bg-orange-950/40">
                <p className="font-medium text-foreground">{medicationName}</p>
                {(dose || route) && (
                  <p className="text-sm text-muted-foreground">
                    {dose && `Dose: ${dose}`}
                    {dose && route && " | "}
                    {route && `Via: ${route}`}
                  </p>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Este medicamento requer atenção especial. Confirme que revisou a
                prescrição antes de continuar.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-center space-x-2 rounded-md border border-orange-200 bg-orange-100/50 p-3 dark:border-orange-800 dark:bg-orange-900/20">
          <Checkbox
            id="confirm-review"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked === true)}
          />
          <Label
            htmlFor="confirm-review"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Confirmo que revisei a dose e via de administração
          </Label>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!confirmed}
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Confirmar Prescrição
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
