import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { NursingSector, QueuePriority, SECTOR_LABELS, PRIORITY_LABELS } from '@/types/nursing';
import { Search, Loader2 } from 'lucide-react';

interface AddToQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: {
    patient_id: string;
    sector: NursingSector;
    priority: QueuePriority;
    referred_from?: string;
    notes?: string;
  }) => void;
  isLoading?: boolean;
}

export function AddToQueueDialog({
  open,
  onOpenChange,
  onAdd,
  isLoading,
}: AddToQueueDialogProps) {
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null);
  const [sector, setSector] = useState<NursingSector>('medication_room');
  const [priority, setPriority] = useState<QueuePriority>('normal');
  const [referredFrom, setReferredFrom] = useState('');
  const [notes, setNotes] = useState('');

  // Search patients
  const { data: patients = [], isLoading: searchLoading } = useQuery({
    queryKey: ['patients-search', search],
    queryFn: async () => {
      if (search.length < 2) return [];
      
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, medical_record_number, cpf')
        .or(`name.ilike.%${search}%,cpf.ilike.%${search}%,medical_record_number.ilike.%${search}%`)
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: search.length >= 2,
  });

  const handleSubmit = () => {
    if (!selectedPatient) return;

    onAdd({
      patient_id: selectedPatient.id,
      sector,
      priority,
      referred_from: referredFrom || undefined,
      notes: notes || undefined,
    });

    // Reset form
    setSearch('');
    setSelectedPatient(null);
    setSector('medication_room');
    setPriority('normal');
    setReferredFrom('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar à Fila</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Patient Search */}
          <div className="space-y-2">
            <Label>Paciente *</Label>
            {selectedPatient ? (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">{selectedPatient.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPatient(null)}
                >
                  Alterar
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, CPF ou prontuário..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {searchLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Buscando...
                  </div>
                )}
                {patients.length > 0 && (
                  <div className="border rounded-lg max-h-40 overflow-y-auto">
                    {patients.map((patient) => (
                      <button
                        key={patient.id}
                        className="w-full text-left px-3 py-2 hover:bg-muted transition-colors border-b last:border-b-0"
                        onClick={() => {
                          setSelectedPatient({ id: patient.id, name: patient.name });
                          setSearch('');
                        }}
                      >
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {patient.medical_record_number && `Pront: ${patient.medical_record_number}`}
                          {patient.cpf && ` • CPF: ${patient.cpf}`}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sector */}
          <div className="space-y-2">
            <Label>Setor *</Label>
            <Select value={sector} onValueChange={(v) => setSector(v as NursingSector)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SECTOR_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Prioridade *</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as QueuePriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Referred From */}
          <div className="space-y-2">
            <Label>Encaminhado de</Label>
            <Input
              placeholder="Ex: Consultório 3, Dr. Silva"
              value={referredFrom}
              onChange={(e) => setReferredFrom(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Observações adicionais..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedPatient || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Adicionando...
              </>
            ) : (
              'Adicionar à Fila'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
