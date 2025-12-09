import { usePrescription } from "@/contexts/PrescriptionContext";
import { checkAllergyMatch } from "@/components/prescription/alerts/AllergyAlert";
import { isHighRiskMedication } from "@/components/prescription/alerts/HighRiskAlert";

interface ItemData {
  description: string;
  item_type: string;
  item_details?: Record<string, unknown>;
  observation?: string;
  is_high_risk?: boolean;
}

interface ValidationResult {
  allergyMatches: string[];
  isHighRisk: boolean;
  needsAllergyAlert: boolean;
  needsHighRiskAlert: boolean;
}

export function usePrescriptionActions() {
  const context = usePrescription();

  // Get allergies from current prescription items
  const getAllergies = (): Array<{ description: string }> => {
    return context.items
      .filter(item => item.item_type === 'allergy' && item.status === 'active')
      .map(item => ({ description: item.description }));
  };

  // Validate item before adding (check allergies and high-risk)
  const validateBeforeAdd = (item: ItemData): ValidationResult => {
    const allergies = getAllergies();
    const allergyMatches = item.item_type === 'medication' 
      ? checkAllergyMatch(item.description, allergies)
      : [];
    const isHighRisk = item.item_type === 'medication' 
      ? isHighRiskMedication(item.description)
      : false;

    return {
      allergyMatches,
      isHighRisk,
      needsAllergyAlert: allergyMatches.length > 0,
      needsHighRiskAlert: isHighRisk,
    };
  };

  // Add item with automatic validation
  const addItemWithValidation = (item: ItemData): ValidationResult & { canProceed: boolean } => {
    const validation = validateBeforeAdd(item);
    
    return {
      ...validation,
      canProceed: !validation.needsAllergyAlert && !validation.needsHighRiskAlert,
    };
  };

  // Group items by category/type
  const getItemsByCategory = () => {
    const grouped: Record<string, typeof context.items> = {};
    
    context.items
      .filter(item => item.status === 'active')
      .forEach(item => {
        if (!grouped[item.item_type]) {
          grouped[item.item_type] = [];
        }
        grouped[item.item_type].push(item);
      });
    
    return grouped;
  };

  // Count total active items
  const getTotalItemsCount = () => {
    return context.items.filter(item => item.status === 'active').length;
  };

  // Count items by type
  const getItemsCountByType = (type: string) => {
    return context.items.filter(
      item => item.item_type === type && item.status === 'active'
    ).length;
  };

  // Check if prescription has any medications
  const hasMedications = () => {
    return context.items.some(
      item => item.item_type === 'medication' && item.status === 'active'
    );
  };

  // Check if prescription has high-risk items
  const hasHighRiskItems = () => {
    return context.items.some(
      item => item.is_high_risk && item.status === 'active'
    );
  };

  // Get suspended items
  const getSuspendedItems = () => {
    return context.items.filter(item => item.status === 'suspended');
  };

  return {
    // Original context methods and state
    ...context,
    // Additional utilities
    getAllergies,
    validateBeforeAdd,
    addItemWithValidation,
    getItemsByCategory,
    getTotalItemsCount,
    getItemsCountByType,
    hasMedications,
    hasHighRiskItems,
    getSuspendedItems,
  };
}
