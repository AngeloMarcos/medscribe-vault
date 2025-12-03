// Mock data for the medical system with realistic Brazilian data

export interface MockPatient {
  id: string;
  name: string;
  age: string;
  prontuario: string;
  cpf: string;
  phone: string;
  insurance: string;
  birthDate: string;
}

export interface MockAppointment {
  id: string;
  consultaId: string;
  patientId: string;
  patientName: string;
  age: string;
  prontuario: string;
  hora: string;
  chegada: string | null;
  especialidade: string;
  sala: string;
  status: 'agendado' | 'aguardando' | 'em_atendimento' | 'atendido' | 'pendente' | 'ausente';
  equipe: string;
  profissional: string;
}

export interface MockEvolution {
  id: string;
  date: string;
  consulta: string;
  especialidade: string;
  equipe: string;
  text: string;
}

export const mockPatients: MockPatient[] = [
  { id: '1', name: 'Maria Bezerly Santos', age: '1m 11d', prontuario: '3898888', cpf: '123.456.789-00', phone: '(21) 99999-1234', insurance: 'SUS', birthDate: '2025-10-22' },
  { id: '2', name: 'João Carlos Silva', age: '42a', prontuario: '1234567', cpf: '987.654.321-00', phone: '(21) 98888-5678', insurance: 'Unimed', birthDate: '1983-05-15' },
  { id: '3', name: 'Ana Paula Oliveira', age: '35a', prontuario: '2345678', cpf: '456.789.123-00', phone: '(21) 97777-9012', insurance: 'Bradesco Saúde', birthDate: '1990-08-20' },
  { id: '4', name: 'Pedro Henrique Costa', age: '28a', prontuario: '3456789', cpf: '789.123.456-00', phone: '(21) 96666-3456', insurance: 'SUS', birthDate: '1997-03-10' },
  { id: '5', name: 'Fernanda Lima Souza', age: '55a', prontuario: '4567890', cpf: '321.654.987-00', phone: '(21) 95555-7890', insurance: 'Amil', birthDate: '1970-12-05' },
  { id: '6', name: 'Carlos Eduardo Pereira', age: '67a', prontuario: '5678901', cpf: '654.987.321-00', phone: '(21) 94444-1234', insurance: 'SUS', birthDate: '1958-07-25' },
  { id: '7', name: 'Mariana Rodrigues', age: '31a', prontuario: '6789012', cpf: '147.258.369-00', phone: '(21) 93333-5678', insurance: 'Sul América', birthDate: '1994-02-14' },
  { id: '8', name: 'Roberto Almeida Filho', age: '48a', prontuario: '7890123', cpf: '258.369.147-00', phone: '(21) 92222-9012', insurance: 'Unimed', birthDate: '1977-09-30' },
  { id: '9', name: 'Juliana Martins', age: '22a', prontuario: '8901234', cpf: '369.147.258-00', phone: '(21) 91111-3456', insurance: 'SUS', birthDate: '2003-06-18' },
  { id: '10', name: 'Antônio José Ferreira', age: '73a', prontuario: '9012345', cpf: '741.852.963-00', phone: '(21) 90000-7890', insurance: 'Bradesco Saúde', birthDate: '1952-11-08' },
  { id: '11', name: 'Beatriz Carvalho', age: '39a', prontuario: '0123456', cpf: '852.963.741-00', phone: '(21) 99999-0123', insurance: 'Amil', birthDate: '1986-04-22' },
  { id: '12', name: 'Lucas Gabriel Nunes', age: '8a', prontuario: '1234568', cpf: '963.741.852-00', phone: '(21) 98888-4567', insurance: 'SUS', birthDate: '2017-01-30' },
];

export const mockAppointments: MockAppointment[] = [
  { id: '1', consultaId: '2514433', patientId: '1', patientName: 'Maria Bezerly Santos', age: '1m 11d', prontuario: '3898888', hora: '11:00', chegada: '10:03', especialidade: 'Oftalmologia', sala: '39', status: 'aguardando', equipe: 'Equipe Oftalmologia', profissional: 'Dr. Ricardo Santos' },
  { id: '2', consultaId: '2514434', patientId: '2', patientName: 'João Carlos Silva', age: '42a', prontuario: '1234567', hora: '11:30', chegada: '11:15', especialidade: 'Cardiologia', sala: '12', status: 'em_atendimento', equipe: 'Equipe Cardiologia', profissional: 'Dra. Maria Fernanda' },
  { id: '3', consultaId: '2514435', patientId: '3', patientName: 'Ana Paula Oliveira', age: '35a', prontuario: '2345678', hora: '14:00', chegada: null, especialidade: 'Dermatologia', sala: '25', status: 'agendado', equipe: 'Equipe Dermatologia', profissional: 'Dr. Paulo Mendes' },
  { id: '4', consultaId: '2514436', patientId: '4', patientName: 'Pedro Henrique Costa', age: '28a', prontuario: '3456789', hora: '09:00', chegada: '08:45', especialidade: 'Ortopedia', sala: '18', status: 'atendido', equipe: 'Equipe Ortopedia', profissional: 'Dr. André Lima' },
  { id: '5', consultaId: '2514437', patientId: '5', patientName: 'Fernanda Lima Souza', age: '55a', prontuario: '4567890', hora: '10:00', chegada: '09:50', especialidade: 'Endocrinologia', sala: '22', status: 'atendido', equipe: 'Equipe Endocrinologia', profissional: 'Dra. Carla Ribeiro' },
  { id: '6', consultaId: '2514438', patientId: '6', patientName: 'Carlos Eduardo Pereira', age: '67a', prontuario: '5678901', hora: '15:00', chegada: null, especialidade: 'Cardiologia', sala: '12', status: 'agendado', equipe: 'Equipe Cardiologia', profissional: 'Dra. Maria Fernanda' },
  { id: '7', consultaId: '2514439', patientId: '7', patientName: 'Mariana Rodrigues', age: '31a', prontuario: '6789012', hora: '16:00', chegada: '15:45', especialidade: 'Ginecologia', sala: '30', status: 'aguardando', equipe: 'Equipe Ginecologia', profissional: 'Dra. Helena Costa' },
  { id: '8', consultaId: '2514440', patientId: '8', patientName: 'Roberto Almeida Filho', age: '48a', prontuario: '7890123', hora: '08:30', chegada: '08:20', especialidade: 'Urologia', sala: '15', status: 'atendido', equipe: 'Equipe Urologia', profissional: 'Dr. Marcos Vinicius' },
  { id: '9', consultaId: '2514441', patientId: '9', patientName: 'Juliana Martins', age: '22a', prontuario: '8901234', hora: '13:00', chegada: null, especialidade: 'Clínica Geral', sala: '05', status: 'pendente', equipe: 'Equipe Clínica Geral', profissional: 'Dr. Felipe Augusto' },
  { id: '10', consultaId: '2514442', patientId: '10', patientName: 'Antônio José Ferreira', age: '73a', prontuario: '9012345', hora: '09:30', chegada: null, especialidade: 'Geriatria', sala: '08', status: 'ausente', equipe: 'Equipe Geriatria', profissional: 'Dra. Lucia Menezes' },
];

export const mockEvolutions: MockEvolution[] = [
  {
    id: '1',
    date: '10/11/2025 11:10',
    consulta: '2473589',
    especialidade: 'Oftalmologia',
    equipe: 'Equipe de Oftalmologia',
    text: `OFTALMO
VEM PARA MR POR PREMATURIDADE
MR: MEIOS CLAROS, RETINA COLADA COM VASCULARIZAÇÃO ZIII SEM PLUS AO
CD: REAVALIAR EM 3 SEMANAS`
  },
  {
    id: '2',
    date: '25/10/2025 10:30',
    consulta: '2458712',
    especialidade: 'Oftalmologia',
    equipe: 'Equipe de Oftalmologia',
    text: `OFTALMO - RETORNO
RN PREMATURO 32 SEMANAS
FUNDO DE OLHO: SEM ALTERAÇÕES
RETINA BEM VASCULARIZADA
CD: ACOMPANHAMENTO AMBULATORIAL`
  },
];

export const especialidades = [
  'Oftalmologia',
  'Cardiologia',
  'Dermatologia',
  'Ortopedia',
  'Endocrinologia',
  'Ginecologia',
  'Urologia',
  'Clínica Geral',
  'Geriatria',
  'Neurologia',
  'Pediatria',
  'Psiquiatria',
];

export const zonas = [
  'AMB EGRESSO',
  'AMB GERAL',
  'AMB ESPECIALIDADES',
  'AMB PEDIATRIA',
  'AMB CIRÚRGICO',
];

export const turnos = ['Manhã', 'Tarde', 'Noite'];

export const salas = Array.from({ length: 50 }, (_, i) => `Sala ${i + 1}`);

export const cids = [
  { code: 'H52.1', description: 'Miopia' },
  { code: 'H52.2', description: 'Astigmatismo' },
  { code: 'H52.4', description: 'Presbiopia' },
  { code: 'Z00.0', description: 'Exame médico geral' },
  { code: 'Z00.1', description: 'Exame de rotina da criança' },
  { code: 'I10', description: 'Hipertensão essencial (primária)' },
  { code: 'E11', description: 'Diabetes mellitus tipo 2' },
  { code: 'J06.9', description: 'Infecção aguda das vias aéreas superiores' },
  { code: 'M54.5', description: 'Dor lombar baixa' },
  { code: 'K29.7', description: 'Gastrite, não especificada' },
];
