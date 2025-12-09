import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  mockPrescriptionPatients,
  mockMedications,
  mockDiets,
  mockSolutions,
  mockCareTexts,
  mockPrescriptionTemplates,
  mockPrescriptions,
  mockCommonAllergies,
  prescriptionItemTypes,
} from "@/data/prescriptionMockData";

const MOCK_STORAGE_KEY = "USE_MOCK_DATA";

export function useMockData() {
  const [useMock, setUseMock] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(MOCK_STORAGE_KEY) === "true";
  });

  const enableMock = useCallback(() => {
    localStorage.setItem(MOCK_STORAGE_KEY, "true");
    setUseMock(true);
    toast.info("Modo mock ativado - usando dados de desenvolvimento");
  }, []);

  const disableMock = useCallback(() => {
    localStorage.setItem(MOCK_STORAGE_KEY, "false");
    setUseMock(false);
    toast.info("Modo mock desativado - usando Supabase");
  }, []);

  const toggleMock = useCallback(() => {
    if (useMock) {
      disableMock();
    } else {
      enableMock();
    }
  }, [useMock, enableMock, disableMock]);

  // Data getters - return mock data or null (to fetch from Supabase)
  const getPatients = useCallback(() => {
    return useMock ? mockPrescriptionPatients : null;
  }, [useMock]);

  const getMedications = useCallback(() => {
    return useMock ? mockMedications : null;
  }, [useMock]);

  const getDiets = useCallback(() => {
    return useMock ? mockDiets : null;
  }, [useMock]);

  const getSolutions = useCallback(() => {
    return useMock ? mockSolutions : null;
  }, [useMock]);

  const getCareTexts = useCallback(() => {
    return useMock ? mockCareTexts : null;
  }, [useMock]);

  const getTemplates = useCallback(() => {
    return useMock ? mockPrescriptionTemplates : null;
  }, [useMock]);

  const getPrescriptions = useCallback(() => {
    return useMock ? mockPrescriptions : null;
  }, [useMock]);

  const getAllergies = useCallback(() => {
    return useMock ? mockCommonAllergies : null;
  }, [useMock]);

  const getItemTypes = useCallback(() => {
    return prescriptionItemTypes;
  }, []);

  // Search helpers for autocomplete
  const searchMedications = useCallback((query: string) => {
    if (!useMock) return null;
    const lowerQuery = query.toLowerCase();
    return mockMedications.filter(med => 
      med.name.toLowerCase().includes(lowerQuery)
    );
  }, [useMock]);

  const searchDiets = useCallback((query: string) => {
    if (!useMock) return null;
    const lowerQuery = query.toLowerCase();
    return mockDiets.filter(diet => 
      diet.name.toLowerCase().includes(lowerQuery) ||
      diet.category.toLowerCase().includes(lowerQuery)
    );
  }, [useMock]);

  const searchCareTexts = useCallback((query: string) => {
    if (!useMock) return null;
    const lowerQuery = query.toLowerCase();
    return mockCareTexts.filter(care => 
      care.text.toLowerCase().includes(lowerQuery) ||
      care.category.toLowerCase().includes(lowerQuery)
    );
  }, [useMock]);

  // Get patient by ID
  const getPatientById = useCallback((id: string) => {
    if (!useMock) return null;
    return mockPrescriptionPatients.find(p => p.id === id) || null;
  }, [useMock]);

  // Get prescription by patient ID
  const getPrescriptionByPatientId = useCallback((patientId: string) => {
    if (!useMock) return null;
    return mockPrescriptions.find(p => p.patient_id === patientId) || null;
  }, [useMock]);

  return {
    // State
    useMock,
    
    // Controls
    enableMock,
    disableMock,
    toggleMock,
    
    // Data getters
    getPatients,
    getMedications,
    getDiets,
    getSolutions,
    getCareTexts,
    getTemplates,
    getPrescriptions,
    getAllergies,
    getItemTypes,
    
    // Search helpers
    searchMedications,
    searchDiets,
    searchCareTexts,
    
    // Lookup helpers
    getPatientById,
    getPrescriptionByPatientId,
  };
}
