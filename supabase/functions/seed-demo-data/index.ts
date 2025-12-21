import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============= GENERATORS =============

// Brazilian first names
const firstNames = [
  'Maria', 'Ana', 'Juliana', 'Fernanda', 'Patricia', 'Camila', 'Luciana', 'Mariana', 'Beatriz', 'Larissa',
  'José', 'Carlos', 'Pedro', 'Lucas', 'Marcos', 'Rafael', 'Fernando', 'Ricardo', 'Paulo', 'Bruno',
  'Gabriela', 'Amanda', 'Leticia', 'Vanessa', 'Renata', 'Claudia', 'Sandra', 'Adriana', 'Tatiana', 'Priscila',
  'João', 'Antonio', 'Francisco', 'Luiz', 'Gustavo', 'Eduardo', 'Rodrigo', 'Thiago', 'André', 'Daniel'
];

const lastNames = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
  'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa',
  'Rocha', 'Dias', 'Nascimento', 'Andrade', 'Moreira', 'Nunes', 'Marques', 'Machado', 'Mendes', 'Freitas'
];

// Specialties for professionals
const specialties = [
  { nome: 'Cardiologia', codigo: 'CARD' },
  { nome: 'Pediatria', codigo: 'PED' },
  { nome: 'Ginecologia', codigo: 'GIN' },
  { nome: 'Ortopedia', codigo: 'ORT' },
  { nome: 'Clínica Geral', codigo: 'CLG' },
  { nome: 'Dermatologia', codigo: 'DERM' },
  { nome: 'Oftalmologia', codigo: 'OFT' },
  { nome: 'Odontologia', codigo: 'ODO' },
];

// Common CIDs
const commonCIDs = [
  { codigo: 'J00', descricao: 'Nasofaringite aguda (resfriado comum)' },
  { codigo: 'J06.9', descricao: 'Infecção aguda das vias aéreas superiores' },
  { codigo: 'K29.7', descricao: 'Gastrite não especificada' },
  { codigo: 'M54.5', descricao: 'Dor lombar baixa' },
  { codigo: 'I10', descricao: 'Hipertensão essencial (primária)' },
  { codigo: 'E11', descricao: 'Diabetes mellitus tipo 2' },
  { codigo: 'F32.0', descricao: 'Episódio depressivo leve' },
  { codigo: 'N39.0', descricao: 'Infecção do trato urinário' },
  { codigo: 'R51', descricao: 'Cefaleia' },
  { codigo: 'K21.0', descricao: 'Doença de refluxo gastroesofágico' },
];

// Evolution texts
const evolutionTexts = [
  'Paciente refere melhora dos sintomas após início da medicação. Mantém queixas leves. Orientado a retornar em caso de piora.',
  'Quadro estável. Paciente assintomático no momento da consulta. Exame físico sem alterações significativas.',
  'Paciente com queixas persistentes. Ajustada medicação. Solicitados exames complementares.',
  'Melhora parcial do quadro. Orientações gerais reforçadas. Seguimento ambulatorial mantido.',
  'Paciente em bom estado geral. Sem intercorrências no período. Mantida conduta terapêutica.',
  'Evolução satisfatória. Parâmetros clínicos dentro da normalidade. Alta ambulatorial.',
  'Paciente refere novas queixas. Investigação complementar iniciada. Retorno agendado.',
  'Quadro clínico controlado. Boa adesão ao tratamento. Orientado sobre sinais de alarme.',
];

// Anamnesis texts
const anamnesisTexts = [
  'Paciente refere dor de cabeça há 3 dias, de intensidade moderada, sem febre. Nega náuseas ou vômitos.',
  'Queixa de dor lombar que piora ao esforço físico. Sem irradiação para membros inferiores.',
  'Tosse seca há 5 dias, associada a coriza e dor de garganta. Nega dispneia.',
  'Dor abdominal em região epigástrica após alimentação. Associada a queimação retroesternal.',
  'Paciente refere fadiga e indisposição há 2 semanas. Nega perda de peso ou febre.',
  'Queixa de ansiedade e dificuldade para dormir. Sintomas há aproximadamente 1 mês.',
  'Dor articular em joelhos bilateralmente, pior pela manhã. Melhora com movimento.',
  'Paciente com quadro gripal há 4 dias. Febre baixa, mialgia e prostração.',
];

// Nursing notes
const nursingNotes = [
  'Paciente consciente, orientado, colaborativo. Sinais vitais estáveis. Aceita dieta via oral.',
  'Realizada administração de medicação conforme prescrição. Paciente sem queixas no momento.',
  'Curativo realizado em ferida operatória. Aspecto limpo, sem sinais de infecção.',
  'Paciente apresentou pico febril de 38.2°C. Comunicado médico. Iniciada medida antitérmica.',
  'Administrada medicação endovenosa. Paciente sem intercorrências durante infusão.',
  'Realizada coleta de exames laboratoriais. Paciente cooperativo durante procedimento.',
  'Aferidos sinais vitais: PA 120x80mmHg, FC 72bpm, FR 16irpm, Tax 36.5°C, SpO2 98%.',
  'Paciente deambulando com auxílio. Sem queixas álgicas. Mantida vigilância.',
];

// Helper functions
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCPF(): string {
  const n = () => randomInt(0, 9);
  return `${n()}${n()}${n()}.${n()}${n()}${n()}.${n()}${n()}${n()}-${n()}${n()}`;
}

function generatePhone(): string {
  const ddd = randomElement(['11', '21', '31', '41', '51', '61', '71', '81']);
  return `(${ddd}) 9${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`;
}

function generateBirthDate(): string {
  const year = randomInt(1940, 2020);
  const month = String(randomInt(1, 12)).padStart(2, '0');
  const day = String(randomInt(1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generatePastDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysAgo));
  return date.toISOString().split('T')[0];
}

function generateFutureDate(daysAhead: number): string {
  const date = new Date();
  date.setDate(date.getDate() + randomInt(1, daysAhead));
  return date.toISOString().split('T')[0];
}

function generateTime(): string {
  const hours = String(randomInt(7, 17)).padStart(2, '0');
  const minutes = randomElement(['00', '15', '30', '45']);
  return `${hours}:${minutes}`;
}

function generateName(): string {
  return `${randomElement(firstNames)} ${randomElement(lastNames)} ${randomElement(lastNames)}`;
}

// Dental conditions for odontogram
function generateOdontogramData(): Record<string, unknown> {
  const conditions = ['saudavel', 'carie', 'restauracao', 'ausente', 'protese', 'fratura'];
  const surfaces = ['oclusal', 'mesial', 'distal', 'vestibular', 'lingual'];
  const teeth: Record<string, Record<string, string>> = {};
  
  // Upper teeth (11-18, 21-28)
  for (let i = 11; i <= 18; i++) {
    if (Math.random() > 0.6) {
      teeth[i.toString()] = {
        condition: randomElement(conditions),
        surface: randomElement(surfaces),
      };
    }
  }
  for (let i = 21; i <= 28; i++) {
    if (Math.random() > 0.6) {
      teeth[i.toString()] = {
        condition: randomElement(conditions),
        surface: randomElement(surfaces),
      };
    }
  }
  // Lower teeth (31-38, 41-48)
  for (let i = 31; i <= 38; i++) {
    if (Math.random() > 0.6) {
      teeth[i.toString()] = {
        condition: randomElement(conditions),
        surface: randomElement(surfaces),
      };
    }
  }
  for (let i = 41; i <= 48; i++) {
    if (Math.random() > 0.6) {
      teeth[i.toString()] = {
        condition: randomElement(conditions),
        surface: randomElement(surfaces),
      };
    }
  }
  
  return { teeth };
}

// Vitals generator
function generateVitals() {
  const systolic = randomInt(100, 160);
  const diastolic = randomInt(60, 100);
  return {
    blood_pressure: `${systolic}/${diastolic}`,
    heart_rate: String(randomInt(60, 100)),
    respiratory_rate: String(randomInt(12, 20)),
    temperature: (36 + Math.random() * 2).toFixed(1),
    o2_sat: String(randomInt(95, 100)),
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { tenant_id, modules, clear_existing } = await req.json();

    if (!tenant_id) {
      throw new Error('tenant_id is required');
    }

    console.log(`Starting seed for tenant: ${tenant_id}`);
    console.log(`Modules requested: ${modules?.join(', ') || 'all'}`);

    const results: Record<string, number> = {};

    // ============= PHASE 1: PROFESSIONALS =============
    if (!modules || modules.includes('base')) {
      console.log('Phase 1: Creating professionals...');
      
      // Get specialties from database
      const { data: existingSpecialties } = await supabase
        .from('especialidades')
        .select('id, nome')
        .eq('ativo', true);
      
      const specialtyMap = new Map(existingSpecialties?.map(s => [s.nome, s.id]) || []);
      
      const professionals = [
        { nome: 'Dr. Carlos Eduardo Mendes', tipo_registro: 'CRM', registro: 'CRM-SP 123456', specialty: 'Cardiologia' },
        { nome: 'Dra. Ana Paula Costa', tipo_registro: 'CRM', registro: 'CRM-SP 234567', specialty: 'Pediatria' },
        { nome: 'Dr. Ricardo Santos Lima', tipo_registro: 'CRO', registro: 'CRO-SP 45678', specialty: null },
        { nome: 'Dra. Mariana Silva Ferreira', tipo_registro: 'CRM', registro: 'CRM-SP 345678', specialty: 'Ginecologia' },
        { nome: 'Dr. Fernando Oliveira', tipo_registro: 'CRM', registro: 'CRM-SP 456789', specialty: 'Clínica Geral' },
        { nome: 'Enf. Juliana Pereira', tipo_registro: 'COREN', registro: 'COREN-SP 567890', specialty: null },
        { nome: 'Enf. Roberto Alves', tipo_registro: 'COREN', registro: 'COREN-SP 678901', specialty: null },
        { nome: 'Dr. Paulo Henrique Rocha', tipo_registro: 'CRM', registro: 'CRM-SP 789012', specialty: 'Ortopedia' },
        { nome: 'Dra. Leticia Gomes', tipo_registro: 'CRO', registro: 'CRO-SP 89012', specialty: null },
        { nome: 'Dr. Marcos Antônio Dias', tipo_registro: 'CRM', registro: 'CRM-SP 890123', specialty: 'Dermatologia' },
      ];

      const professionalsToInsert = professionals.map(p => ({
        nome: p.nome,
        cpf: generateCPF(),
        registro_profissional: p.registro,
        tipo_registro: p.tipo_registro,
        telefone: generatePhone(),
        email: `${p.nome.toLowerCase().replace(/\s+/g, '.').normalize('NFD').replace(/[\u0300-\u036f]/g, '')}@clinica.com`,
        especialidade_id: p.specialty ? specialtyMap.get(p.specialty) : null,
        ativo: true,
      }));

      const { data: insertedProfessionals, error: profError } = await supabase
        .from('profissionais')
        .insert(professionalsToInsert)
        .select('id');
      
      if (profError) {
        console.error('Error inserting professionals:', profError);
      } else {
        results.profissionais = insertedProfessionals?.length || 0;
        console.log(`Created ${results.profissionais} professionals`);
      }
    }

    // Get professionals for later use
    const { data: allProfessionals } = await supabase
      .from('profissionais')
      .select('id, nome, tipo_registro')
      .eq('ativo', true);
    
    const doctors = allProfessionals?.filter(p => p.tipo_registro === 'CRM') || [];
    const dentists = allProfessionals?.filter(p => p.tipo_registro === 'CRO') || [];
    const nurses = allProfessionals?.filter(p => p.tipo_registro === 'COREN') || [];

    // ============= PHASE 2: PATIENTS =============
    if (!modules || modules.includes('patients')) {
      console.log('Phase 2: Creating patients...');
      
      const patientsToInsert = Array.from({ length: 100 }, (_, i) => ({
        name: generateName(),
        cpf: generateCPF(),
        birth_date: generateBirthDate(),
        phone: generatePhone(),
        insurance: randomElement(['SUS', 'Unimed', 'Bradesco Saúde', 'Amil', 'SulAmérica', 'Particular', 'SUS']),
        medical_record_number: String(100000 + i),
        tenant_id,
      }));

      const { data: insertedPatients, error: patError } = await supabase
        .from('patients')
        .insert(patientsToInsert)
        .select('id');
      
      if (patError) {
        console.error('Error inserting patients:', patError);
      } else {
        results.patients = insertedPatients?.length || 0;
        console.log(`Created ${results.patients} patients`);
      }
    }

    // Get patients for later use
    const { data: allPatients } = await supabase
      .from('patients')
      .select('id, name')
      .eq('tenant_id', tenant_id);
    
    const patients = allPatients || [];

    // Get specialties for consultations
    const { data: allSpecialties } = await supabase
      .from('especialidades')
      .select('id, nome')
      .eq('ativo', true);
    
    const specialtiesData = allSpecialties || [];

    // ============= PHASE 3: AMBULATORY =============
    if (!modules || modules.includes('ambulatorio')) {
      console.log('Phase 3: Creating ambulatory data...');
      
      const consultasToInsert = [];
      const statuses = ['agendado', 'em_atendimento', 'atendido', 'atendido', 'atendido', 'faltou'];
      
      for (let i = 0; i < 200; i++) {
        const patient = randomElement(patients);
        const doctor = randomElement(doctors);
        const specialty = randomElement(specialtiesData);
        const status = randomElement(statuses);
        const date = generatePastDate(30);
        const time = generateTime();
        
        consultasToInsert.push({
          paciente_id: patient.id,
          profissional_id: doctor?.id,
          especialidade_id: specialty?.id,
          data_consulta: date,
          hora_inicio: time,
          numero_consulta: `2024${String(i + 1).padStart(6, '0')}`,
          status,
          tipo_consulta: randomElement(['primeira_vez', 'retorno', 'urgencia']),
          motivo_consulta: randomElement(anamnesisTexts).substring(0, 100),
          tenant_id,
        });
      }

      const { data: insertedConsultas, error: consError } = await supabase
        .from('consultas')
        .insert(consultasToInsert)
        .select('id, paciente_id, profissional_id, status');
      
      if (consError) {
        console.error('Error inserting consultas:', consError);
      } else {
        results.consultas = insertedConsultas?.length || 0;
        console.log(`Created ${results.consultas} consultas`);

        // Create atendimentos for completed consultas
        const completedConsultas = insertedConsultas?.filter(c => c.status === 'atendido') || [];
        const atendimentosToInsert = completedConsultas.map(c => {
          const cid = randomElement(commonCIDs);
          return {
            consulta_id: c.id,
            paciente_id: c.paciente_id,
            profissional_id: c.profissional_id,
            anamnese: randomElement(anamnesisTexts),
            evolucao: randomElement(evolutionTexts),
            cid_principal: cid.codigo,
            assinado: Math.random() > 0.3,
            tenant_id,
          };
        });

        if (atendimentosToInsert.length > 0) {
          const { data: insertedAtend, error: atendError } = await supabase
            .from('atendimentos')
            .insert(atendimentosToInsert)
            .select('id, paciente_id');
          
          if (atendError) {
            console.error('Error inserting atendimentos:', atendError);
          } else {
            results.atendimentos = insertedAtend?.length || 0;
            console.log(`Created ${results.atendimentos} atendimentos`);
          }
        }

        // Create vitals for some atendimentos
        const vitalsToInsert = completedConsultas.slice(0, 120).map(c => ({
          patient_id: c.paciente_id,
          ...generateVitals(),
          tenant_id,
        }));

        if (vitalsToInsert.length > 0) {
          const { error: vitalsError } = await supabase
            .from('vitals')
            .insert(vitalsToInsert);
          
          if (vitalsError) {
            console.error('Error inserting vitals:', vitalsError);
          } else {
            results.vitals = vitalsToInsert.length;
            console.log(`Created ${results.vitals} vitals`);
          }
        }
      }
    }

    // ============= PHASE 4: DENTISTRY =============
    if (!modules || modules.includes('odontologia')) {
      console.log('Phase 4: Creating dentistry data...');
      
      // Get dental procedures
      const { data: procedures } = await supabase
        .from('procedimentos_odonto')
        .select('id, nome, preco_padrao')
        .eq('ativo', true);
      
      const dentalProcedures = procedures || [];
      const dentalStatuses = ['agendado', 'confirmado', 'em_atendimento', 'atendido', 'atendido', 'faltou'];
      
      // Dental appointments
      const dentalAppointments = [];
      for (let i = 0; i < 80; i++) {
        const patient = randomElement(patients);
        const dentist = randomElement(dentists);
        const date = generatePastDate(30);
        const time = generateTime();
        
        dentalAppointments.push({
          paciente_id: patient.id,
          profissional_id: dentist?.id,
          data: date,
          hora_inicio: time,
          duracao_minutos: randomElement([30, 45, 60, 90]),
          cadeira: randomElement(['Cadeira 01', 'Cadeira 02', 'Cadeira 03']),
          status: randomElement(dentalStatuses),
          tenant_id,
        });
      }

      const { data: insertedDentalAppts, error: dentalError } = await supabase
        .from('agendamentos_odonto')
        .insert(dentalAppointments)
        .select('id, paciente_id');
      
      if (dentalError) {
        console.error('Error inserting dental appointments:', dentalError);
      } else {
        results.agendamentos_odonto = insertedDentalAppts?.length || 0;
        console.log(`Created ${results.agendamentos_odonto} dental appointments`);
      }

      // Odontograms
      const selectedPatients = patients.slice(0, 30);
      const odontogramsToInsert = selectedPatients.map(p => ({
        patient_id: p.id,
        dados: generateOdontogramData(),
        profissional_id: randomElement(dentists)?.id,
        observacoes: 'Odontograma inicial',
        tenant_id,
      }));

      const { error: odoError } = await supabase
        .from('odontogramas')
        .insert(odontogramsToInsert);
      
      if (odoError) {
        console.error('Error inserting odontogramas:', odoError);
      } else {
        results.odontogramas = odontogramsToInsert.length;
        console.log(`Created ${results.odontogramas} odontogramas`);
      }

      // Treatment plans
      const planStatuses = ['orcamento', 'aprovado', 'em_andamento', 'concluido'];
      const plansToInsert = patients.slice(0, 20).map(p => ({
        patient_id: p.id,
        profissional_id: randomElement(dentists)?.id,
        status: randomElement(planStatuses),
        data_inicio: generatePastDate(60),
        observacoes_gerais: 'Plano de tratamento completo',
        tenant_id,
      }));

      const { data: insertedPlans, error: planError } = await supabase
        .from('planos_tratamento_odonto')
        .insert(plansToInsert)
        .select('id');
      
      if (planError) {
        console.error('Error inserting treatment plans:', planError);
      } else {
        results.planos_tratamento = insertedPlans?.length || 0;
        console.log(`Created ${results.planos_tratamento} treatment plans`);

        // Treatment plan items
        if (insertedPlans && dentalProcedures.length > 0) {
          const planItemsToInsert: Array<{
            plano_id: string;
            procedimento_id: string;
            dente: number;
            valor_unitario: number;
            valor_final: number;
            status: string;
            urgencia: string;
            tenant_id: string;
          }> = [];
          
          insertedPlans.forEach(plan => {
            const numItems = randomInt(3, 8);
            for (let i = 0; i < numItems; i++) {
              const proc = randomElement(dentalProcedures);
              const price = proc.preco_padrao || randomInt(100, 500);
              planItemsToInsert.push({
                plano_id: plan.id,
                procedimento_id: proc.id,
                dente: randomElement([11, 12, 21, 22, 31, 32, 41, 42, 16, 26, 36, 46]),
                valor_unitario: price,
                valor_final: price,
                status: randomElement(['pendente', 'agendado', 'realizado']),
                urgencia: randomElement(['normal', 'urgente', 'muito_urgente']),
                tenant_id,
              });
            }
          });

          const { error: itemsError } = await supabase
            .from('itens_plano_tratamento')
            .insert(planItemsToInsert);
          
          if (itemsError) {
            console.error('Error inserting plan items:', itemsError);
          } else {
            results.itens_plano_tratamento = planItemsToInsert.length;
            console.log(`Created ${results.itens_plano_tratamento} plan items`);
          }
        }
      }
    }

    // ============= PHASE 5: NURSING =============
    if (!modules || modules.includes('enfermagem')) {
      console.log('Phase 5: Creating nursing data...');
      
      const sectors = ['Triagem', 'Medicação', 'Curativo', 'Acolhimento', 'Vacinas'];
      const priorities = ['normal', 'normal', 'urgente', 'emergencia'];
      const queueStatuses = ['waiting', 'in_progress', 'completed'];
      
      const nursingQueueToInsert = patients.slice(0, 30).map(p => ({
        patient_id: p.id,
        sector: randomElement(sectors),
        priority: randomElement(priorities),
        status: randomElement(queueStatuses),
        notes: randomElement(nursingNotes).substring(0, 100),
        attended_by: randomElement(nurses)?.id,
        tenant_id,
      }));

      const { error: queueError } = await supabase
        .from('nursing_queue')
        .insert(nursingQueueToInsert);
      
      if (queueError) {
        console.error('Error inserting nursing queue:', queueError);
      } else {
        results.nursing_queue = nursingQueueToInsert.length;
        console.log(`Created ${results.nursing_queue} nursing queue items`);
      }

      // Nursing notes - using a valid user_id
      // We need to get a valid user_id from profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      const createdBy = profiles?.[0]?.id;
      
      if (createdBy) {
        const nursingNotesToInsert = patients.slice(0, 80).map(p => ({
          patient_id: p.id,
          content: randomElement(nursingNotes),
          note_type: randomElement(['Evolução', 'Observação', 'Intercorrência', 'Administração']),
          is_critical: Math.random() > 0.9,
          created_by: createdBy,
          tenant_id,
        }));

        const { error: notesError } = await supabase
          .from('nursing_notes')
          .insert(nursingNotesToInsert);
        
        if (notesError) {
          console.error('Error inserting nursing notes:', notesError);
        } else {
          results.nursing_notes = nursingNotesToInsert.length;
          console.log(`Created ${results.nursing_notes} nursing notes`);
        }
      }
    }

    // ============= PHASE 6: CLINICAL DOCUMENTS =============
    if (!modules || modules.includes('documentos')) {
      console.log('Phase 6: Creating clinical documents...');
      
      // Get medications
      const { data: medications } = await supabase
        .from('medicamentos_remume')
        .select('id, nome_generico, apresentacao, via_padrao')
        .eq('ativo', true)
        .limit(50);
      
      const meds = medications || [];

      // Get exams
      const { data: exams } = await supabase
        .from('exames_catalogo')
        .select('id, nome')
        .eq('ativo', true)
        .limit(30);
      
      const examsList = exams || [];

      // Prescriptions (hospital type)
      const prescriptionsToInsert = patients.slice(0, 50).map(p => ({
        patient_id: p.id,
        prescription_date: generatePastDate(30),
        validity_start: new Date().toISOString(),
        validity_end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_by: randomElement(doctors)?.id,
        status: randomElement(['pending', 'active', 'completed']),
        tenant_id,
      }));

      const { data: insertedPrescriptions, error: prescError } = await supabase
        .from('prescriptions')
        .insert(prescriptionsToInsert)
        .select('id');
      
      if (prescError) {
        console.error('Error inserting prescriptions:', prescError);
      } else {
        results.prescriptions = insertedPrescriptions?.length || 0;
        console.log(`Created ${results.prescriptions} prescriptions`);

        // Prescription items
        if (insertedPrescriptions && meds.length > 0) {
          const prescriptionItemsToInsert: Array<{
            prescription_id: string;
            item_type: string;
            description: string;
            sequence_order: number;
            item_details: Record<string, unknown>;
            tenant_id: string;
          }> = [];
          
          insertedPrescriptions.forEach(presc => {
            const numItems = randomInt(2, 6);
            for (let i = 0; i < numItems; i++) {
              const med = randomElement(meds);
              prescriptionItemsToInsert.push({
                prescription_id: presc.id,
                item_type: randomElement(['medication', 'solution', 'care']),
                description: `${med.nome_generico} ${med.apresentacao}`,
                sequence_order: i + 1,
                item_details: {
                  medication_id: med.id,
                  dose: randomElement(['1 comprimido', '2 comprimidos', '10ml', '5ml']),
                  frequency: randomElement(['8/8h', '12/12h', '6/6h', '1x ao dia']),
                  route: med.via_padrao || 'VO',
                },
                tenant_id,
              });
            }
          });

          const { error: itemsError } = await supabase
            .from('prescription_items')
            .insert(prescriptionItemsToInsert);
          
          if (itemsError) {
            console.error('Error inserting prescription items:', itemsError);
          } else {
            results.prescription_items = prescriptionItemsToInsert.length;
            console.log(`Created ${results.prescription_items} prescription items`);
          }
        }
      }

      // Receitas (recipes/prescriptions for external use)
      const receitasToInsert = patients.slice(0, 120).map(p => ({
        paciente_id: p.id,
        profissional_id: randomElement(doctors)?.id,
        tipo: randomElement(['simples', 'simples', 'controlada']),
        status: 'ativa',
        data_emissao: generatePastDate(30),
        tenant_id,
      }));

      const { data: insertedReceitas, error: recError } = await supabase
        .from('receitas')
        .insert(receitasToInsert)
        .select('id');
      
      if (recError) {
        console.error('Error inserting receitas:', recError);
      } else {
        results.receitas = insertedReceitas?.length || 0;
        console.log(`Created ${results.receitas} receitas`);

        // Receita items
        if (insertedReceitas && meds.length > 0) {
          const receitaItensToInsert: Array<{
            receita_id: string;
            medicamento_nome: string;
            medicamento_id: string | null;
            dose: string;
            frequencia: string;
            via: string;
            duracao_dias: number;
            unidade: string;
            ordem: number;
          }> = [];
          
          insertedReceitas.forEach((rec, idx) => {
            const numItems = randomInt(1, 4);
            for (let i = 0; i < numItems; i++) {
              const med = randomElement(meds);
              receitaItensToInsert.push({
                receita_id: rec.id,
                medicamento_nome: `${med.nome_generico} ${med.apresentacao}`,
                medicamento_id: med.id,
                dose: randomElement(['1 comprimido', '2 comprimidos', '10ml', '5ml', '1 cápsula']),
                frequencia: randomElement(['8/8h', '12/12h', '6/6h', '1x ao dia', '2x ao dia']),
                via: med.via_padrao || 'VO',
                duracao_dias: randomInt(5, 30),
                unidade: randomElement(['comprimido', 'ml', 'cápsula', 'gota']),
                ordem: i + 1,
              });
            }
          });

          const { error: recItensError } = await supabase
            .from('receita_itens')
            .insert(receitaItensToInsert);
          
          if (recItensError) {
            console.error('Error inserting receita itens:', recItensError);
          } else {
            results.receita_itens = receitaItensToInsert.length;
            console.log(`Created ${results.receita_itens} receita items`);
          }
        }
      }

      // Atestados (medical certificates)
      const atestadosToInsert = patients.slice(0, 60).map(p => {
        const startDate = generatePastDate(30);
        const days = randomInt(1, 15);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + days);
        const cid = randomElement(commonCIDs);
        
        return {
          paciente_id: p.id,
          profissional_id: randomElement(doctors)?.id,
          data_inicio: startDate,
          data_fim: endDate.toISOString().split('T')[0],
          dias_afastamento: days,
          cid_codigo: cid.codigo,
          motivo: cid.descricao,
          tenant_id,
        };
      });

      const { error: atestError } = await supabase
        .from('atestados')
        .insert(atestadosToInsert);
      
      if (atestError) {
        console.error('Error inserting atestados:', atestError);
      } else {
        results.atestados = atestadosToInsert.length;
        console.log(`Created ${results.atestados} atestados`);
      }

      // Exam requests
      const examRequestsToInsert = patients.slice(0, 90).map(p => {
        const cid = randomElement(commonCIDs);
        return {
          paciente_id: p.id,
          profissional_id: randomElement(doctors)?.id,
          data_solicitacao: generatePastDate(30),
          status: randomElement(['solicitado', 'agendado', 'realizado', 'laudado']),
          cid_justificativa: cid.codigo,
          hipotese_diagnostica: cid.descricao,
          urgencia: randomElement(['normal', 'urgente']),
          tenant_id,
        };
      });

      const { data: insertedExamReqs, error: examReqError } = await supabase
        .from('solicitacoes_exames')
        .insert(examRequestsToInsert)
        .select('id');
      
      if (examReqError) {
        console.error('Error inserting exam requests:', examReqError);
      } else {
        results.solicitacoes_exames = insertedExamReqs?.length || 0;
        console.log(`Created ${results.solicitacoes_exames} exam requests`);

        // Exam request items
        if (insertedExamReqs && examsList.length > 0) {
          const examItensToInsert: Array<{
            solicitacao_id: string;
            exame_nome: string;
            exame_id: string | null;
            status: string;
          }> = [];
          
          insertedExamReqs.forEach(req => {
            const numItems = randomInt(1, 5);
            for (let i = 0; i < numItems; i++) {
              const exam = randomElement(examsList);
              examItensToInsert.push({
                solicitacao_id: req.id,
                exame_nome: exam.nome,
                exame_id: exam.id,
                status: randomElement(['solicitado', 'agendado', 'realizado', 'laudado']),
              });
            }
          });

          const { error: examItensError } = await supabase
            .from('solicitacao_exame_itens')
            .insert(examItensToInsert);
          
          if (examItensError) {
            console.error('Error inserting exam items:', examItensError);
          } else {
            results.solicitacao_exame_itens = examItensToInsert.length;
            console.log(`Created ${results.solicitacao_exame_itens} exam items`);
          }
        }
      }

      // Referrals (encaminhamentos)
      const referralTypes = ['especialidade', 'urgencia', 'internacao', 'exame_externo'];
      const referralStatuses = ['pendente', 'agendado', 'realizado', 'cancelado'];
      const destSpecialties = ['Cardiologia', 'Neurologia', 'Gastroenterologia', 'Endocrinologia', 'Psiquiatria'];
      
      const referralsToInsert = patients.slice(0, 50).map(p => {
        const cid = randomElement(commonCIDs);
        return {
          paciente_id: p.id,
          profissional_id: randomElement(doctors)?.id,
          tipo: randomElement(referralTypes),
          urgencia: randomElement(['normal', 'urgente', 'emergencia']),
          especialidade_destino: randomElement(destSpecialties),
          justificativa: `Paciente com ${cid.descricao.toLowerCase()}. Necessita avaliação especializada.`,
          hipotese_diagnostica: cid.descricao,
          cid_principal: cid.codigo,
          status: randomElement(referralStatuses),
          data_encaminhamento: generatePastDate(30),
          tenant_id,
        };
      });

      const { error: refError } = await supabase
        .from('encaminhamentos')
        .insert(referralsToInsert);
      
      if (refError) {
        console.error('Error inserting referrals:', refError);
      } else {
        results.encaminhamentos = referralsToInsert.length;
        console.log(`Created ${results.encaminhamentos} referrals`);
      }
    }

    // Calculate total
    const totalRecords = Object.values(results).reduce((sum, count) => sum + count, 0);

    console.log('Seed completed successfully!');
    console.log('Results:', results);
    console.log('Total records created:', totalRecords);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seed completed successfully! Created ${totalRecords} records.`,
        results,
        total: totalRecords,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in seed-demo-data:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
