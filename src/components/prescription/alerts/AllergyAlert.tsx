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
import { AlertTriangle } from "lucide-react";

interface AllergyAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicationName: string;
  matchedAllergies: string[];
  onCancel: () => void;
  onConfirm: () => void;
}

export const checkAllergyMatch = (
  medicationName: string,
  allergies: Array<{ description: string }>
): string[] => {
  const normalizedMed = medicationName.toLowerCase().trim();
  const matches: string[] = [];

  for (const allergy of allergies) {
    const allergyName = allergy.description.toLowerCase().trim();
    if (
      normalizedMed.includes(allergyName) ||
      allergyName.includes(normalizedMed)
    ) {
      matches.push(allergy.description);
    }
  }

  return matches;
};

export const AllergyAlert = ({
  open,
  onOpenChange,
  medicationName,
  matchedAllergies,
  onCancel,
  onConfirm,
}: AllergyAlertProps) => {
  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-destructive bg-destructive/5">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            ALERTA DE ALERGIA
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p className="text-sm text-foreground">
                Paciente possui alergia a:{" "}
                <strong className="text-destructive">
                  {matchedAllergies.join(", ")}
                </strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Deseja continuar com a prescrição de{" "}
                <strong className="text-foreground">{medicationName}</strong>?
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Adicionar Mesmo Assim
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
