# Módulo de Prescrição Médica

Sistema completo para criação, edição e gerenciamento de prescrições médicas hospitalares.

## Estrutura de Arquivos

```
src/
├── pages/
│   ├── PrescriptionList.tsx      # Lista de pacientes para prescrição
│   ├── CreatePrescription.tsx    # Tela de criação/seleção de prescrição
│   └── MaintainPrescription.tsx  # Manutenção e edição de itens
├── components/prescription/
│   ├── PrescriptionBreadcrumb.tsx
│   ├── PrescriptionItemList.tsx
│   ├── PrescriptionPreview.tsx
│   ├── forms/                    # Formulários por tipo de item
│   │   ├── MedicationForm.tsx
│   │   ├── DietForm.tsx
│   │   ├── SolutionForm.tsx
│   │   ├── CareForm.tsx
│   │   └── ConsultationForm.tsx
│   └── alerts/                   # Alertas de segurança
│       ├── AllergyAlert.tsx
│       ├── HighRiskAlert.tsx
│       └── index.ts
├── contexts/
│   └── PrescriptionContext.tsx   # Estado global da prescrição
├── hooks/
│   ├── usePrescriptionActions.ts # Ações e validações
│   ├── useScheduling.ts          # Cálculo de aprazamento
│   └── useMockData.ts            # Dados mock para desenvolvimento
├── types/
│   └── prescription.ts           # Tipos TypeScript
├── data/
│   └── prescriptionMockData.ts   # Dados de exemplo
└── lib/
    └── toastMessages.ts          # Mensagens padronizadas
```

## Fluxo de Uso

1. **Lista de Pacientes** (`/prescription`)
   - Exibe pacientes com consultas ativas
   - Filtros por nome, prontuário, unidade
   - Ordenação por múltiplas colunas

2. **Elaborar Prescrição** (`/prescription/create/:patientId`)
   - Visualiza prescrições existentes
   - Cria nova prescrição ou edita existente
   - Mostra histórico de prescrições

3. **Manter Prescrição** (`/prescription/maintain/:patientId/:prescriptionId?`)
   - Adiciona itens por categoria
   - Edita, copia, suspende ou exclui itens
   - Confirma e envia para enfermagem

## Hooks Disponíveis

### `usePrescription()`
Estado global e ações da prescrição atual.

```typescript
const { 
  prescription,      // Dados da prescrição
  items,             // Itens da prescrição
  isLoading,         // Estado de carregamento
  isDirty,           // Indica alterações não salvas
  addItem,           // Adiciona novo item
  updateItem,        // Atualiza item existente
  removeItem,        // Remove item
  savePrescription,  // Salva como pendente
  confirmPrescription // Confirma prescrição
} = usePrescription();
```

### `usePrescriptionActions()`
Validações e utilitários adicionais.

```typescript
const {
  validateBeforeAdd,    // Valida alergias e alto risco
  getAllergies,         // Obtém alergias cadastradas
  getItemsByCategory,   // Agrupa itens por categoria
  hasHighRiskItems,     // Verifica se há itens alto risco
} = usePrescriptionActions();
```

### `useScheduling()`
Cálculo de horários de aprazamento.

```typescript
const {
  calculateScheduleTimes,  // Calcula horários baseado na frequência
  formatSchedule,          // Formata para exibição
} = useScheduling();
```

### `useMockData()`
Controle de dados mock para desenvolvimento.

```typescript
const {
  useMock,         // Estado do modo mock
  toggleMock,      // Alterna modo mock
  getMedications,  // Retorna medicamentos mock
  getDiets,        // Retorna dietas mock
  getCareTexts,    // Retorna textos de cuidados
} = useMockData();
```

## Categorias de Itens

| ID | Label | Descrição |
|----|-------|-----------|
| `dieta` | Dieta | Prescrição alimentar |
| `solucoes` | Soluções | Soros e soluções EV |
| `medicamentos` | Medicamentos | Medicação oral, EV, IM, etc. |
| `cuidados` | Cuidados | Orientações de enfermagem |
| `consultoria` | Consultoria | Pareceres de outras especialidades |
| `hemoterapia` | Hemoterapia | Transfusões sanguíneas |
| `procedimentos` | Procedimentos | Procedimentos médicos |
| `diagnostico` | Diagnóstico | Exames diagnósticos |
| `alergias` | Alergias | Registro de alergias |
| `modelo_basico` | Modelo Básico | Templates pré-definidos |

## Status da Prescrição

- `draft` - Rascunho (não salvo)
- `pending` - Pendente de confirmação
- `confirmed` - Confirmada e ativa
- `cancelled` - Cancelada
- `expired` - Expirada

## Acessibilidade

O módulo implementa:
- ARIA labels em todos os botões de ícone
- Navegação por teclado completa
- Focus states visíveis
- Roles semânticos (`navigation`, `main`, `group`)
- Screen reader support com `sr-only` labels

## Responsividade

- **Desktop (1024px+)**: Layout com sidebar fixa
- **Tablet (768-1023px)**: Sidebar colapsável
- **Mobile (<768px)**: Categorias em barra horizontal scrollável

## Mensagens de Feedback

Todas as mensagens são centralizadas em `src/lib/toastMessages.ts`:

```typescript
import { prescriptionToasts } from "@/lib/toastMessages";

// Uso
prescriptionToasts.itemAdded();
prescriptionToasts.prescriptionConfirmed();
prescriptionToasts.errorSaving();
```

## Segurança

- Verificação de alergias antes de adicionar medicamentos
- Destaque visual para itens de alto risco
- Confirmação antes de excluir itens
- Validação de campos obrigatórios

## Performance

- Lazy loading de páginas via React.lazy
- Memoização de listas com useMemo
- Debounce em campos de busca (300ms)
- Skeleton loaders durante carregamento
