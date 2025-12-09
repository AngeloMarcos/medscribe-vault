import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CalendarIcon,
  Utensils,
  Droplets,
  Pill,
  Heart,
  Users,
  Droplet,
  Stethoscope,
  Activity,
  AlertTriangle,
  FileText,
  Edit,
  Copy,
  Pause,
  Trash2,
  Printer,
  Clock,
  Eye,
  X,
} from "lucide-react";
import { differenceInYears, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PrescriptionBreadcrumb } from "@/components/prescription/PrescriptionBreadcrumb";

interface PrescriptionItem {
  id: string;
  category: string;
  description: string;
  highRisk: boolean;
  suspended: boolean;
}

const categories = [
  { id: "dieta", label: "Dieta", icon: Utensils },
  { id: "solucoes", label: "Soluções", icon: Droplets },
  { id: "medicamentos", label: "Medicamentos", icon: Pill },
  { id: "cuidados", label: "Cuidados", icon: Heart },
  { id: "consultoria", label: "Consultoria", icon: Users },
  { id: "hemoterapia", label: "Hemoterapia", icon: Droplet },
  { id: "procedimentos", label: "Procedimentos", icon: Stethoscope },
  { id: "diagnostico", label: "Diagnóstico", icon: Activity },
  { id: "alergias", label: "Alergias", icon: AlertTriangle },
  { id: "modelo_basico", label: "Modelo Básico", icon: FileText },
];

export default function MaintainPrescription() {
  const { patientId, prescriptionId } = useParams<{ patientId: string; prescriptionId?: string }>();
  const navigate = useNavigate();

  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemHighRisk, setNewItemHighRisk] = useState(false);
  const [dischargeDate, setDischargeDate] = useState<Date | undefined>();
  const [isPediatric, setIsPediatric] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch patient data
  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ["maintain-prescription-patient", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });

  // Fetch active consultation
  const { data: consultation, isLoading: isLoadingConsultation } = useQuery({
    queryKey: ["maintain-prescription-consultation", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultas")
        .select(`
          *,
          salas:sala_id (numero, nome)
        `)
        .eq("paciente_id", patientId)
        .in("status", ["em_atendimento", "aguardando"])
        .order("data_consulta", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });

  const calculateAge = (birthDate: string | null): string => {
    if (!birthDate) return "N/I";
    return `${differenceInYears(new Date(), new Date(birthDate))} anos`;
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setNewItemDescription("");
    setNewItemHighRisk(false);
    setDialogOpen(true);
  };

  const handleAddItem = () => {
    if (!selectedCategory || !newItemDescription.trim()) return;

    const newItem: PrescriptionItem = {
      id: crypto.randomUUID(),
      category: selectedCategory,
      description: newItemDescription.trim(),
      highRisk: newItemHighRisk,
      suspended: false,
    };

    setItems([...items, newItem]);
    setDialogOpen(false);
    setNewItemDescription("");
    setNewItemHighRisk(false);
  };

  const handleCopyItem = (item: PrescriptionItem) => {
    const copiedItem: PrescriptionItem = {
      ...item,
      id: crypto.randomUUID(),
    };
    setItems([...items, copiedItem]);
  };

  const handleSuspendItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, suspended: !item.suspended } : item
    ));
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    setDeleteConfirmId(null);
  };

  const getCategoryLabel = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.label || categoryId;
  };

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PrescriptionItem[]>);

  const isLoading = isLoadingPatient || isLoadingConsultation;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Categories */}
      <aside className="w-[20%] min-w-[200px] bg-muted/50 border-r p-4 space-y-2">
        <h2 className="font-semibold text-lg mb-4 text-foreground">Seções</h2>
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant="ghost"
              className="w-full justify-start gap-3 hover:bg-background"
              onClick={() => handleCategoryClick(category.id)}
            >
              <Icon className="h-4 w-4" />
              {category.label}
            </Button>
          );
        })}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6">
        {/* Breadcrumb */}
        <PrescriptionBreadcrumb 
          items={[
            { label: patient?.name || "Paciente", href: `/prescription/create/${patientId}` },
            { label: prescriptionId ? "Editar Prescrição" : "Manter Prescrição" }
          ]} 
        />

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/prescription/create/${patientId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {prescriptionId ? "Editar Prescrição Médica" : "Manter Prescrição Médica"}
          </h1>
        </div>

        {/* Patient Header Card */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : patient ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Patient Info */}
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-foreground">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Prontuário: {patient.medical_record_number || "N/I"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Local: L:{consultation?.salas?.numero || "N/I"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Idade: {calculateAge(patient.birth_date)}
                  </p>
                </div>

                {/* Discharge Date */}
                <div className="space-y-2">
                  <Label>Previsão Alta</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dischargeDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dischargeDate ? format(dischargeDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dischargeDate}
                        onSelect={setDischargeDate}
                        initialFocus
                        className="pointer-events-auto"
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Pediatric Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pediatric"
                    checked={isPediatric}
                    onCheckedChange={(checked) => setIsPediatric(checked === true)}
                  />
                  <Label htmlFor="pediatric" className="cursor-pointer">
                    Paciente Pediátrico
                  </Label>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Paciente não encontrado</p>
            )}
          </CardContent>
        </Card>

        {/* Prescription Items */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Itens da Prescrição</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum item adicionado.</p>
                <p className="text-sm">Selecione uma categoria ao lado para adicionar itens.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedItems).map(([category, categoryItems]) => (
                  <div key={category}>
                    <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-3">
                      {getCategoryLabel(category)}
                    </h3>
                    <div className="space-y-2">
                      {categoryItems.map((item, index) => (
                        <div
                          key={item.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border",
                            item.suspended && "bg-muted/50 opacity-60"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground w-6">
                              {index + 1}.
                            </span>
                            <span className={cn(item.suspended && "line-through")}>
                              {item.description}
                            </span>
                            {item.highRisk && (
                              <Badge variant="destructive" className="ml-2">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Alto Risco
                              </Badge>
                            )}
                            {item.suspended && (
                              <Badge variant="secondary" className="ml-2">
                                Suspenso
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleCopyItem(item)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleSuspendItem(item.id)}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteConfirmId(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex flex-wrap gap-3">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Printer className="h-4 w-4" />
            Confirmar e Imprimir
          </Button>
          <Button variant="outline" className="gap-2">
            <Clock className="h-4 w-4" />
            Deixar Pendente
          </Button>
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Visualizar
          </Button>
          <Button variant="outline" className="gap-2 text-destructive border-destructive hover:bg-destructive/10">
            <X className="h-4 w-4" />
            Cancelar
          </Button>
        </div>
      </main>

      {/* Add Item Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Adicionar {selectedCategory ? getCategoryLabel(selectedCategory) : "Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Digite a descrição do item..."
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="highRisk"
                checked={newItemHighRisk}
                onCheckedChange={(checked) => setNewItemHighRisk(checked === true)}
              />
              <Label htmlFor="highRisk" className="cursor-pointer">
                Marcar como Alto Risco
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddItem} disabled={!newItemDescription.trim()}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Tem certeza que deseja excluir este item da prescrição?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDeleteItem(deleteConfirmId)}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
