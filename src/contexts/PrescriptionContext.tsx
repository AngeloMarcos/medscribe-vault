import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTenant } from "@/hooks/useTenant";

// Types
export interface PrescriptionItem {
  id: string;
  prescription_id?: string;
  item_type: string;
  sequence_order: number;
  description: string;
  status: 'active' | 'suspended' | 'deleted';
  is_high_risk: boolean;
  observation?: string;
  item_details?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  consulta_id?: string;
  prescription_date: string;
  expected_discharge_date?: string;
  is_pediatric: boolean;
  validity_start: string;
  validity_end: string;
  status: 'pending' | 'confirmed' | 'suspended' | 'cancelled';
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

interface PrescriptionContextType {
  // State
  prescription: Prescription | null;
  items: PrescriptionItem[];
  isLoading: boolean;
  isDirty: boolean;

  // Item manipulation
  addItem: (item: Omit<PrescriptionItem, 'id' | 'prescription_id' | 'sequence_order' | 'created_at' | 'updated_at'>) => void;
  updateItem: (id: string, updates: Partial<PrescriptionItem>) => void;
  removeItem: (id: string) => void;
  suspendItem: (id: string) => void;
  reorderItems: (startIndex: number, endIndex: number) => void;
  copyItem: (id: string) => void;

  // Prescription management
  setPrescription: (prescription: Prescription) => void;
  clearPrescription: () => void;
  initializePrescription: (patientId: string, consultaId?: string) => void;
  loadPrescription: (prescriptionId: string) => Promise<void>;
  loadPendingPrescription: (patientId: string) => Promise<boolean>;

  // Persistence
  savePrescription: () => Promise<void>;
  confirmPrescription: () => Promise<void>;

  // Validation
  validatePrescription: () => { isValid: boolean; errors: string[] };
  checkDuplicateItem: (description: string, category: string) => boolean;
  getAllergies: () => PrescriptionItem[];

  // Settings
  setExpectedDischargeDate: (date: string | undefined) => void;
  setIsPediatric: (isPediatric: boolean) => void;
}

const PrescriptionContext = createContext<PrescriptionContextType | undefined>(undefined);

interface PrescriptionProviderProps {
  children: ReactNode;
}

export const PrescriptionProvider: React.FC<PrescriptionProviderProps> = ({ children }) => {
  const { tenant } = useTenant();
  const [prescription, setPrescriptionState] = useState<Prescription | null>(null);
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]);

  // Generate unique ID
  const generateId = () => crypto.randomUUID();

  // Initialize new prescription
  const initializePrescription = useCallback((patientId: string, consultaId?: string) => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    setPrescriptionState({
      id: generateId(),
      patient_id: patientId,
      consulta_id: consultaId,
      prescription_date: now.toISOString().split('T')[0],
      is_pediatric: false,
      validity_start: now.toISOString(),
      validity_end: tomorrow.toISOString(),
      status: 'pending',
    });
    setItems([]);
    setDeletedItemIds([]);
    setIsDirty(false);
  }, []);

  // Load existing prescription
  const loadPrescription = useCallback(async (prescriptionId: string) => {
    setIsLoading(true);
    try {
      const { data: prescriptionData, error: prescriptionError } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('id', prescriptionId)
        .maybeSingle();

      if (prescriptionError) throw prescriptionError;
      if (!prescriptionData) {
        toast.error("Prescrição não encontrada");
        return;
      }

      setPrescriptionState(prescriptionData as Prescription);

      const { data: itemsData, error: itemsError } = await supabase
        .from('prescription_items')
        .select('*')
        .eq('prescription_id', prescriptionId)
        .order('sequence_order', { ascending: true });

      if (itemsError) throw itemsError;

      setItems((itemsData || []) as PrescriptionItem[]);
      setDeletedItemIds([]);
      setIsDirty(false);
    } catch (error) {
      console.error('Error loading prescription:', error);
      toast.error("Erro ao carregar prescrição");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load pending prescription for patient
  const loadPendingPrescription = useCallback(async (patientId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data: prescriptionData, error: prescriptionError } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (prescriptionError) throw prescriptionError;

      if (prescriptionData) {
        setPrescriptionState(prescriptionData as Prescription);

        const { data: itemsData, error: itemsError } = await supabase
          .from('prescription_items')
          .select('*')
          .eq('prescription_id', prescriptionData.id)
          .neq('status', 'deleted')
          .order('sequence_order', { ascending: true });

        if (itemsError) throw itemsError;

        setItems((itemsData || []) as PrescriptionItem[]);
        setDeletedItemIds([]);
        setIsDirty(false);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error loading pending prescription:', error);
      toast.error("Erro ao carregar prescrição pendente");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add item
  const addItem = useCallback((item: Omit<PrescriptionItem, 'id' | 'prescription_id' | 'sequence_order' | 'created_at' | 'updated_at'>) => {
    const newItem: PrescriptionItem = {
      ...item,
      id: generateId(),
      prescription_id: prescription?.id,
      sequence_order: items.length + 1,
    };

    setItems(prev => [...prev, newItem]);
    setIsDirty(true);
  }, [prescription?.id, items.length]);

  // Update item
  const updateItem = useCallback((id: string, updates: Partial<PrescriptionItem>) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
    setIsDirty(true);
  }, []);

  // Remove item (mark as deleted)
  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'deleted' as const } : item
    ));
    setDeletedItemIds(prev => [...prev, id]);
    setIsDirty(true);
  }, []);

  // Suspend item
  const suspendItem = useCallback((id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id
        ? { ...item, status: item.status === 'suspended' ? 'active' as const : 'suspended' as const }
        : item
    ));
    setIsDirty(true);
  }, []);

  // Reorder items
  const reorderItems = useCallback((startIndex: number, endIndex: number) => {
    setItems(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      // Update sequence_order
      return result.map((item, index) => ({
        ...item,
        sequence_order: index + 1,
      }));
    });
    setIsDirty(true);
  }, []);

  // Copy item
  const copyItem = useCallback((id: string) => {
    const itemToCopy = items.find(item => item.id === id);
    if (!itemToCopy) return;

    const newItem: PrescriptionItem = {
      ...itemToCopy,
      id: generateId(),
      sequence_order: items.length + 1,
      status: 'active',
    };

    setItems(prev => [...prev, newItem]);
    setIsDirty(true);
  }, [items]);

  // Set prescription
  const setPrescription = useCallback((newPrescription: Prescription) => {
    setPrescriptionState(newPrescription);
    setIsDirty(true);
  }, []);

  // Clear prescription
  const clearPrescription = useCallback(() => {
    setPrescriptionState(null);
    setItems([]);
    setDeletedItemIds([]);
    setIsDirty(false);
  }, []);

  // Set expected discharge date
  const setExpectedDischargeDate = useCallback((date: string | undefined) => {
    if (!prescription) return;
    setPrescriptionState(prev => prev ? { ...prev, expected_discharge_date: date } : null);
    setIsDirty(true);
  }, [prescription]);

  // Set pediatric flag
  const setIsPediatric = useCallback((isPediatric: boolean) => {
    if (!prescription) return;
    setPrescriptionState(prev => prev ? { ...prev, is_pediatric: isPediatric } : null);
    setIsDirty(true);
  }, [prescription]);

  // Validate prescription
  const validatePrescription = useCallback((): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!prescription) {
      errors.push("Prescrição não inicializada.");
      return { isValid: false, errors };
    }

    const activeItems = items.filter(item => item.status !== 'deleted');
    if (activeItems.length === 0) {
      errors.push("A prescrição deve conter pelo menos um item.");
    }

    if (!prescription.validity_start || !prescription.validity_end) {
      errors.push("As datas de vigência são obrigatórias.");
    }

    // Check for items without description
    const emptyItems = activeItems.filter(item => !item.description?.trim());
    if (emptyItems.length > 0) {
      errors.push(`${emptyItems.length} item(s) sem descrição.`);
    }

    return { isValid: errors.length === 0, errors };
  }, [prescription, items]);

  // Check duplicate item
  const checkDuplicateItem = useCallback((description: string, category: string): boolean => {
    return items.some(
      item =>
        item.description.toLowerCase().trim() === description.toLowerCase().trim() &&
        item.item_type === category &&
        item.status !== 'deleted'
    );
  }, [items]);

  // Get allergies
  const getAllergies = useCallback((): PrescriptionItem[] => {
    return items.filter(item => item.item_type === 'allergy' && item.status !== 'deleted');
  }, [items]);

  // Save prescription
  const savePrescription = useCallback(async () => {
    if (!prescription) {
      toast.error("Prescrição não inicializada");
      return;
    }

    setIsLoading(true);
    try {
      // Check if prescription exists
      const { data: existingPrescription } = await supabase
        .from('prescriptions')
        .select('id')
        .eq('id', prescription.id)
        .maybeSingle();

      if (existingPrescription) {
        // Update existing prescription
        const { error: updateError } = await supabase
          .from('prescriptions')
          .update({
            expected_discharge_date: prescription.expected_discharge_date,
            is_pediatric: prescription.is_pediatric,
            validity_start: prescription.validity_start,
            validity_end: prescription.validity_end,
            status: 'pending',
            updated_at: new Date().toISOString(),
          })
          .eq('id', prescription.id);

        if (updateError) throw updateError;
      } else {
        // Insert new prescription
        const { error: insertError } = await supabase
          .from('prescriptions')
          .insert({
            id: prescription.id,
            patient_id: prescription.patient_id,
            consulta_id: prescription.consulta_id,
            prescription_date: prescription.prescription_date,
            expected_discharge_date: prescription.expected_discharge_date,
            is_pediatric: prescription.is_pediatric,
            validity_start: prescription.validity_start,
            validity_end: prescription.validity_end,
            status: 'pending',
          });

        if (insertError) throw insertError;
      }

      // Delete removed items
      if (deletedItemIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('prescription_items')
          .delete()
          .in('id', deletedItemIds);

        if (deleteError) throw deleteError;
      }

      // Upsert items
      const activeItems = items.filter(item => item.status !== 'deleted');
      for (const item of activeItems) {
        const { data: existingItem } = await supabase
          .from('prescription_items')
          .select('id')
          .eq('id', item.id)
          .maybeSingle();

        if (existingItem) {
          const { error: updateItemError } = await supabase
            .from('prescription_items')
            .update({
              item_type: item.item_type,
              sequence_order: item.sequence_order,
              description: item.description,
              status: item.status,
              is_high_risk: item.is_high_risk,
              observation: item.observation,
              item_details: item.item_details as unknown as Record<string, never>,
              updated_at: new Date().toISOString(),
            })
            .eq('id', item.id);

          if (updateItemError) throw updateItemError;
        } else {
          const { error: insertItemError } = await supabase
            .from('prescription_items')
            .insert([{
              id: item.id,
              prescription_id: prescription.id,
              item_type: item.item_type,
              sequence_order: item.sequence_order,
              description: item.description,
              status: item.status,
              is_high_risk: item.is_high_risk,
              observation: item.observation,
              item_details: item.item_details as unknown as Record<string, never>,
            }]);

          if (insertItemError) throw insertItemError;
        }
      }

      setDeletedItemIds([]);
      setIsDirty(false);
      toast.success("Prescrição salva como pendente");
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast.error("Erro ao salvar prescrição");
    } finally {
      setIsLoading(false);
    }
  }, [prescription, items, deletedItemIds]);

  // Confirm prescription
  const confirmPrescription = useCallback(async () => {
    const validation = validatePrescription();
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    if (!prescription) return;

    setIsLoading(true);
    try {
      // First save
      await savePrescription();

      // Then update status to confirmed
      const { error } = await supabase
        .from('prescriptions')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', prescription.id);

      if (error) throw error;

      setPrescriptionState(prev => prev ? { ...prev, status: 'confirmed' } : null);
      toast.success("Prescrição confirmada e disponível para enfermagem");
    } catch (error) {
      console.error('Error confirming prescription:', error);
      toast.error("Erro ao confirmar prescrição");
    } finally {
      setIsLoading(false);
    }
  }, [prescription, validatePrescription, savePrescription]);

  const value: PrescriptionContextType = {
    prescription,
    items: items.filter(item => item.status !== 'deleted'),
    isLoading,
    isDirty,
    addItem,
    updateItem,
    removeItem,
    suspendItem,
    reorderItems,
    copyItem,
    setPrescription,
    clearPrescription,
    initializePrescription,
    loadPrescription,
    loadPendingPrescription,
    savePrescription,
    confirmPrescription,
    validatePrescription,
    checkDuplicateItem,
    getAllergies,
    setExpectedDischargeDate,
    setIsPediatric,
  };

  return (
    <PrescriptionContext.Provider value={value}>
      {children}
    </PrescriptionContext.Provider>
  );
};

export const usePrescription = (): PrescriptionContextType => {
  const context = useContext(PrescriptionContext);
  if (!context) {
    throw new Error('usePrescription must be used within a PrescriptionProvider');
  }
  return context;
};

export default PrescriptionContext;
