// Mock data for prescription module development

// ============================================
// PACIENTES MOCKADOS (5 exemplos)
// ============================================
export const mockPrescriptionPatients = [
  {
    id: "patient-001",
    name: "Maria Aparecida Santos",
    cpf: "123.456.789-00",
    birth_date: "1985-05-15",
    medical_record_number: "2025000001",
    phone: "(11) 98765-4321",
    insurance: "SUS",
    leito: "204-A",
    quarto: "204",
    unidade_funcional: "Clínica Médica",
    allergies: ["Dipirona", "Penicilina"],
    is_pediatric: false,
  },
  {
    id: "patient-002",
    name: "João Carlos Pereira",
    cpf: "987.654.321-00",
    birth_date: "1958-11-22",
    medical_record_number: "2025000002",
    phone: "(11) 91234-5678",
    insurance: "Unimed",
    leito: "105-B",
    quarto: "105",
    unidade_funcional: "Cardiologia",
    allergies: ["AAS"],
    is_pediatric: false,
  },
  {
    id: "patient-003",
    name: "Ana Luísa Fernandes",
    cpf: "456.789.123-00",
    birth_date: "2020-03-10",
    medical_record_number: "2025000003",
    phone: "(11) 99876-5432",
    insurance: "SUS",
    leito: "PED-12",
    quarto: "PED-12",
    unidade_funcional: "Pediatria",
    allergies: [],
    is_pediatric: true,
  },
  {
    id: "patient-004",
    name: "Roberto Silva Neto",
    cpf: "321.654.987-00",
    birth_date: "1972-08-03",
    medical_record_number: "2025000004",
    phone: "(11) 98888-7777",
    insurance: "Bradesco Saúde",
    leito: "UTI-05",
    quarto: "UTI",
    unidade_funcional: "UTI Adulto",
    allergies: ["Morfina", "Tramadol"],
    is_pediatric: false,
  },
  {
    id: "patient-005",
    name: "Beatriz Oliveira Costa",
    cpf: "654.321.987-00",
    birth_date: "2023-07-18",
    medical_record_number: "2025000005",
    phone: "(11) 97777-8888",
    insurance: "Amil",
    leito: "NEO-03",
    quarto: "Neonatologia",
    unidade_funcional: "UTI Neonatal",
    allergies: [],
    is_pediatric: true,
  },
];

// ============================================
// MEDICAMENTOS COMUNS (25 itens)
// ============================================
export const mockMedications = [
  // Analgésicos/Antitérmicos
  { id: "med-001", name: "Dipirona 500mg", dose: "500", unit: "mg", route: "VO", frequency: "6/6h", category: "analgesico" },
  { id: "med-002", name: "Paracetamol 750mg", dose: "750", unit: "mg", route: "VO", frequency: "6/6h", category: "analgesico" },
  { id: "med-003", name: "Paracetamol Gotas 200mg/ml", dose: "15", unit: "gotas", route: "VO", frequency: "6/6h", category: "analgesico" },
  { id: "med-004", name: "Tramadol 50mg", dose: "50", unit: "mg", route: "VO", frequency: "8/8h", category: "analgesico" },
  
  // Antibióticos
  { id: "med-005", name: "Amoxicilina 500mg", dose: "500", unit: "mg", route: "VO", frequency: "8/8h", category: "antibiotico" },
  { id: "med-006", name: "Amoxicilina + Clavulanato 875/125mg", dose: "875", unit: "mg", route: "VO", frequency: "12/12h", category: "antibiotico" },
  { id: "med-007", name: "Ceftriaxona 1g", dose: "1", unit: "g", route: "EV", frequency: "12/12h", diluent: "SF 0,9% 100ml", category: "antibiotico" },
  { id: "med-008", name: "Azitromicina 500mg", dose: "500", unit: "mg", route: "VO", frequency: "1x/dia", category: "antibiotico" },
  { id: "med-009", name: "Ciprofloxacino 500mg", dose: "500", unit: "mg", route: "VO", frequency: "12/12h", category: "antibiotico" },
  
  // Cardiovasculares
  { id: "med-010", name: "Captopril 25mg", dose: "25", unit: "mg", route: "VO", frequency: "8/8h", category: "cardiovascular" },
  { id: "med-011", name: "Losartana 50mg", dose: "50", unit: "mg", route: "VO", frequency: "1x/dia", category: "cardiovascular" },
  { id: "med-012", name: "AAS 100mg", dose: "100", unit: "mg", route: "VO", frequency: "1x/dia", category: "cardiovascular" },
  { id: "med-013", name: "Furosemida 40mg", dose: "40", unit: "mg", route: "VO", frequency: "1x/dia", category: "cardiovascular" },
  { id: "med-014", name: "Atenolol 50mg", dose: "50", unit: "mg", route: "VO", frequency: "1x/dia", category: "cardiovascular" },
  
  // Gastro
  { id: "med-015", name: "Omeprazol 20mg", dose: "20", unit: "mg", route: "VO", frequency: "1x/dia", scheduling_type: "jejum", category: "gastro" },
  { id: "med-016", name: "Ranitidina 150mg", dose: "150", unit: "mg", route: "VO", frequency: "12/12h", category: "gastro" },
  { id: "med-017", name: "Metoclopramida 10mg", dose: "10", unit: "mg", route: "VO", frequency: "8/8h", category: "gastro" },
  { id: "med-018", name: "Ondansetrona 8mg", dose: "8", unit: "mg", route: "EV", frequency: "8/8h", category: "gastro" },
  
  // Anti-inflamatórios
  { id: "med-019", name: "Ibuprofeno 600mg", dose: "600", unit: "mg", route: "VO", frequency: "8/8h", category: "antiinflamatorio" },
  { id: "med-020", name: "Dexametasona 4mg", dose: "4", unit: "mg", route: "EV", frequency: "1x/dia", category: "antiinflamatorio" },
  
  // Alto Risco
  { id: "med-021", name: "Insulina Regular 100UI/ml", dose: "10", unit: "UI", route: "SC", frequency: "ACM", is_high_risk: true, category: "alto_risco" },
  { id: "med-022", name: "Insulina NPH 100UI/ml", dose: "20", unit: "UI", route: "SC", frequency: "12/12h", is_high_risk: true, category: "alto_risco" },
  { id: "med-023", name: "Heparina 5000UI", dose: "5000", unit: "UI", route: "SC", frequency: "12/12h", is_high_risk: true, category: "alto_risco" },
  { id: "med-024", name: "Enoxaparina 40mg", dose: "40", unit: "mg", route: "SC", frequency: "1x/dia", is_high_risk: true, category: "alto_risco" },
  { id: "med-025", name: "Morfina 10mg/ml", dose: "5", unit: "mg", route: "EV", frequency: "SOS", is_high_risk: true, category: "alto_risco" },
];

// ============================================
// DIETAS PADRÃO (10 itens)
// ============================================
export const mockDiets = [
  { id: "diet-001", name: "Dieta Livre", category: "geral", description: "Sem restrições alimentares" },
  { id: "diet-002", name: "Dieta Branda", category: "geral", description: "Alimentos de fácil digestão" },
  { id: "diet-003", name: "Dieta Leve", category: "consistencia", description: "Baixo teor de gordura e fibras" },
  { id: "diet-004", name: "Dieta Pastosa", category: "consistencia", description: "Alimentos amassados ou em purê" },
  { id: "diet-005", name: "Dieta Líquida", category: "consistencia", description: "Caldos, sucos, gelatinas" },
  { id: "diet-006", name: "Dieta Zero (Jejum)", category: "especial", description: "Nenhum alimento por via oral" },
  { id: "diet-007", name: "Dieta para Diabético", category: "terapeutica", description: "Controle de carboidratos" },
  { id: "diet-008", name: "Dieta Hipossódica", category: "terapeutica", description: "Restrição de sódio" },
  { id: "diet-009", name: "Dieta Hipoprotéica", category: "terapeutica", description: "Restrição de proteínas" },
  { id: "diet-010", name: "Dieta Enteral Padrão 1.2 kcal/ml", category: "enteral", description: "Via sonda enteral" },
];

// ============================================
// SOLUÇÕES COMUNS (10 itens)
// ============================================
export const mockSolutions = [
  { id: "sol-001", name: "Soro Fisiológico 0,9%", volumes: [100, 250, 500, 1000], unit: "ml" },
  { id: "sol-002", name: "Soro Glicosado 5%", volumes: [250, 500, 1000], unit: "ml" },
  { id: "sol-003", name: "Soro Glicofisiológico", volumes: [500, 1000], unit: "ml" },
  { id: "sol-004", name: "Ringer Lactato", volumes: [500, 1000], unit: "ml" },
  { id: "sol-005", name: "Glicose 50%", volumes: [10, 20], unit: "ml" },
  { id: "sol-006", name: "NaCl 20%", volumes: [10, 20], unit: "ml" },
  { id: "sol-007", name: "KCl 19,1%", volumes: [10], unit: "ml" },
  { id: "sol-008", name: "Bicarbonato de Sódio 8,4%", volumes: [10, 250], unit: "ml" },
  { id: "sol-009", name: "Manitol 20%", volumes: [250], unit: "ml" },
  { id: "sol-010", name: "Albumina Humana 20%", volumes: [50, 100], unit: "ml" },
];

// ============================================
// TEXTOS PADRÃO PARA CUIDADOS (18 itens)
// ============================================
export const mockCareTexts = [
  // Monitorização
  { id: "care-001", text: "Sinais vitais de 6/6 horas", category: "monitorizacao" },
  { id: "care-002", text: "Sinais vitais de 4/4 horas", category: "monitorizacao" },
  { id: "care-003", text: "Sinais vitais de 2/2 horas", category: "monitorizacao" },
  { id: "care-004", text: "Balanço hídrico rigoroso", category: "monitorizacao" },
  { id: "care-005", text: "Glicemia capilar antes das refeições e às 22h", category: "monitorizacao" },
  { id: "care-006", text: "Monitorização cardíaca contínua", category: "monitorizacao" },
  
  // Posicionamento
  { id: "care-007", text: "Manter cabeceira elevada a 30°", category: "posicionamento" },
  { id: "care-008", text: "Manter cabeceira elevada a 45°", category: "posicionamento" },
  { id: "care-009", text: "Mudança de decúbito de 2/2 horas", category: "posicionamento" },
  
  // Dispositivos
  { id: "care-010", text: "Manter cateter vesical de demora com sistema fechado", category: "dispositivos" },
  { id: "care-011", text: "Curativo de acesso venoso central diário", category: "dispositivos" },
  { id: "care-012", text: "Trocar acesso venoso periférico a cada 72h", category: "dispositivos" },
  
  // Higiene
  { id: "care-013", text: "Higiene oral 3x ao dia", category: "higiene" },
  { id: "care-014", text: "Banho no leito", category: "higiene" },
  
  // Atividade
  { id: "care-015", text: "Repouso absoluto no leito", category: "atividade" },
  { id: "care-016", text: "Deambulação assistida", category: "atividade" },
  
  // Oxigenoterapia
  { id: "care-017", text: "Oxigenoterapia sob cateter nasal 2L/min", category: "oxigenoterapia" },
  { id: "care-018", text: "Oxigenoterapia sob máscara de Venturi 50%", category: "oxigenoterapia" },
];

// ============================================
// MODELOS DE PRESCRIÇÃO (3 templates)
// ============================================
export const mockPrescriptionTemplates = [
  {
    id: "template-001",
    template_name: "Admissão Clínica Médica Básica",
    template_type: "institutional",
    specialty: null,
    items: [
      { item_type: "diet", description: "Dieta Livre", sequence_order: 1 },
      { item_type: "care", description: "Sinais vitais de 6/6 horas", sequence_order: 2 },
      { item_type: "care", description: "Balanço hídrico", sequence_order: 3 },
      { item_type: "medication", description: "Dipirona 500mg", item_details: { dose: "500mg", route: "VO", frequency: "6/6h SOS se febre ou dor" }, sequence_order: 4 },
      { item_type: "solution", description: "SF 0,9% 500ml EV 8/8h", item_details: { volume: 500, rate: "62ml/h" }, sequence_order: 5 },
    ],
  },
  {
    id: "template-002",
    template_name: "Pós-operatório Geral",
    template_type: "specialty",
    specialty: "Cirurgia Geral",
    items: [
      { item_type: "diet", description: "Dieta Zero por 6 horas, após Dieta Líquida", sequence_order: 1 },
      { item_type: "care", description: "Sinais vitais de 4/4 horas", sequence_order: 2 },
      { item_type: "care", description: "Manter cabeceira elevada a 30°", sequence_order: 3 },
      { item_type: "care", description: "Curativo cirúrgico diário", sequence_order: 4 },
      { item_type: "medication", description: "Dipirona 1g", item_details: { dose: "1g", route: "EV", frequency: "6/6h" }, sequence_order: 5 },
      { item_type: "medication", description: "Tramadol 100mg", item_details: { dose: "100mg", route: "EV", frequency: "8/8h SOS dor intensa" }, sequence_order: 6 },
      { item_type: "medication", description: "Ondansetrona 8mg", item_details: { dose: "8mg", route: "EV", frequency: "8/8h SOS náuseas" }, sequence_order: 7 },
      { item_type: "medication", description: "Enoxaparina 40mg", item_details: { dose: "40mg", route: "SC", frequency: "1x/dia" }, is_high_risk: true, sequence_order: 8 },
      { item_type: "solution", description: "SF 0,9% 1000ml EV 8/8h", item_details: { volume: 1000, rate: "125ml/h" }, sequence_order: 9 },
    ],
  },
  {
    id: "template-003",
    template_name: "Pneumonia Comunitária",
    template_type: "specialty",
    specialty: "Clínica Médica",
    items: [
      { item_type: "diet", description: "Dieta Branda", sequence_order: 1 },
      { item_type: "care", description: "Sinais vitais de 6/6 horas", sequence_order: 2 },
      { item_type: "care", description: "Oxigenoterapia sob cateter nasal 2L/min se SatO2 < 92%", sequence_order: 3 },
      { item_type: "medication", description: "Ceftriaxona 1g", item_details: { dose: "1g", route: "EV", frequency: "12/12h", diluent: "SF 0,9% 100ml" }, sequence_order: 4 },
      { item_type: "medication", description: "Azitromicina 500mg", item_details: { dose: "500mg", route: "VO", frequency: "1x/dia" }, sequence_order: 5 },
      { item_type: "medication", description: "Dipirona 1g", item_details: { dose: "1g", route: "EV", frequency: "6/6h SOS se febre" }, sequence_order: 6 },
      { item_type: "solution", description: "SF 0,9% 500ml EV 8/8h", item_details: { volume: 500, rate: "62ml/h" }, sequence_order: 7 },
    ],
  },
];

// ============================================
// PRESCRIÇÕES EXEMPLO COMPLETAS (2)
// ============================================
export const mockPrescriptions = [
  {
    id: "rx-001",
    patient_id: "patient-001",
    consulta_id: null,
    prescription_date: new Date().toISOString().split('T')[0],
    expected_discharge_date: null,
    is_pediatric: false,
    status: "confirmed",
    validity_start: new Date().toISOString(),
    validity_end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: "item-001", item_type: "diet", description: "Dieta Branda", sequence_order: 1, status: "active" },
      { id: "item-002", item_type: "care", description: "Sinais vitais de 6/6 horas", sequence_order: 2, status: "active" },
      { id: "item-003", item_type: "care", description: "Balanço hídrico rigoroso", sequence_order: 3, status: "active" },
      { id: "item-004", item_type: "medication", description: "Paracetamol 750mg VO 6/6h SOS febre ou dor", item_details: { dose: "750mg", route: "VO", frequency: "6/6h" }, sequence_order: 4, status: "active" },
      { id: "item-005", item_type: "medication", description: "Omeprazol 20mg VO 1x/dia em jejum", item_details: { dose: "20mg", route: "VO", frequency: "1x/dia" }, sequence_order: 5, status: "active" },
      { id: "item-006", item_type: "solution", description: "SF 0,9% 500ml EV 8/8h", item_details: { volume: 500, rate: "62ml/h" }, sequence_order: 6, status: "active" },
    ],
  },
  {
    id: "rx-002",
    patient_id: "patient-002",
    consulta_id: null,
    prescription_date: new Date().toISOString().split('T')[0],
    expected_discharge_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_pediatric: false,
    status: "pending",
    validity_start: new Date().toISOString(),
    validity_end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: "item-010", item_type: "diet", description: "Dieta para Diabético Hipossódica", sequence_order: 1, status: "active" },
      { id: "item-011", item_type: "care", description: "Sinais vitais de 4/4 horas", sequence_order: 2, status: "active" },
      { id: "item-012", item_type: "care", description: "Glicemia capilar antes das refeições e às 22h", sequence_order: 3, status: "active" },
      { id: "item-013", item_type: "care", description: "Monitorização cardíaca contínua", sequence_order: 4, status: "active" },
      { id: "item-014", item_type: "medication", description: "Insulina NPH 20UI SC 12/12h", item_details: { dose: "20UI", route: "SC", frequency: "12/12h" }, is_high_risk: true, sequence_order: 5, status: "active" },
      { id: "item-015", item_type: "medication", description: "Insulina Regular conforme protocolo", item_details: { dose: "ACM", route: "SC", frequency: "conforme glicemia" }, is_high_risk: true, sequence_order: 6, status: "active" },
      { id: "item-016", item_type: "medication", description: "Losartana 50mg VO 1x/dia", item_details: { dose: "50mg", route: "VO", frequency: "1x/dia" }, sequence_order: 7, status: "active" },
      { id: "item-017", item_type: "medication", description: "Furosemida 40mg VO 1x/dia", item_details: { dose: "40mg", route: "VO", frequency: "1x/dia" }, sequence_order: 8, status: "active" },
      { id: "item-018", item_type: "solution", description: "SF 0,9% 250ml EV 12/12h (manutenção)", item_details: { volume: 250, rate: "21ml/h" }, sequence_order: 9, status: "active" },
    ],
  },
];

// ============================================
// ALERGIAS COMUNS (para validação)
// ============================================
export const mockCommonAllergies = [
  "Dipirona",
  "Penicilina",
  "Amoxicilina",
  "Cefalosporinas",
  "Sulfonamidas",
  "AAS",
  "Anti-inflamatórios",
  "Ibuprofeno",
  "Morfina",
  "Tramadol",
  "Contraste Iodado",
  "Látex",
  "Frutos do Mar",
];

// ============================================
// TIPOS DE ITEM (para referência)
// ============================================
export const prescriptionItemTypes = [
  { id: "diet", label: "Dieta", icon: "🍽️" },
  { id: "solution", label: "Solução", icon: "💧" },
  { id: "medication", label: "Medicamento", icon: "💊" },
  { id: "care", label: "Cuidado", icon: "🩺" },
  { id: "exam", label: "Exame", icon: "🔬" },
  { id: "consultation", label: "Consultoria", icon: "👨‍⚕️" },
  { id: "allergy", label: "Alergia", icon: "⚠️" },
  { id: "observation", label: "Observação", icon: "📝" },
];
