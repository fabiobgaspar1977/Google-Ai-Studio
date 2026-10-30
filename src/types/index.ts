/**
 * Definições de Tipos e Modelos de Domínio para o Mantix CMMS
 */

export type Criticality = 'A' | 'B' | 'C'; // A: Crítico/Parada total, B: Importante, C: Baixo impacto
export type AssetStatus = 'operacional' | 'em_manutencao' | 'parado' | 'em_alerta';

export interface Asset {
  id: string;
  tag: string; // Ex: COMP-01, EST-04, GER-02
  name: string;
  category: 'Compressores' | 'Motores & Bombas' | 'Linhas de Produção' | 'Climatização & HVAC' | 'Geradores & Energia' | 'Veículos & Empilhadeiras' | 'Predial';
  sector: string; // Ex: Usinagem, Linha 2, Subestação, Galpão A
  criticality: Criticality;
  status: AssetStatus;
  manufacturer: string;
  model: string;
  serialNumber: string;
  installationDate: string; // YYYY-MM-DD
  operatingHours: number; // Horímetro acumulado
  lastMaintenanceDate?: string;
  nextScheduledDate?: string;
  notes?: string;
  imageUrl?: string;
}

export type WorkOrderType = 'corretiva' | 'preventiva' | 'preditiva' | 'melhoria' | 'calibracao' | 'lubrificacao';
export type WorkOrderPriority = 'baixa' | 'media' | 'alta' | 'urgente';
export type WorkOrderStatus = 'aberta' | 'em_andamento' | 'aguardando_peca' | 'concluida' | 'cancelada';

export interface WorkOrderChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface WorkOrderPartUsed {
  partId: string;
  partName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface WorkOrder {
  id: string;
  code: string; // Ex: OS-2026-001
  assetId: string;
  title: string;
  description: string;
  type: WorkOrderType;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  assignedTechnicianId?: string;
  requesterName: string;
  createdAt: string; // ISO string
  scheduledDate?: string; // YYYY-MM-DD
  startedAt?: string;
  completedAt?: string;
  estimatedHours: number;
  actualHours?: number;
  hourlyRate: number; // Custo hora do técnico
  checklist: WorkOrderChecklistItem[];
  partsUsed: WorkOrderPartUsed[];
  failureCause?: string; // Diagnóstico de causa raiz
  resolutionNotes?: string; // Ações tomadas
  laborCost?: number;
  partsCost?: number;
  totalCost?: number;
}

export interface MaintenancePlan {
  id: string;
  title: string;
  assetId: string;
  type: 'preventiva' | 'preditiva' | 'lubrificacao' | 'calibracao';
  frequencyType: 'dias' | 'horimetro';
  intervalValue: number; // a cada X dias ou Y horas
  lastExecutionDate?: string;
  nextDueDate: string;
  estimatedDurationHours: number;
  assignedTechnicianId?: string;
  checklistTemplates: string[];
  recommendedParts?: string[];
  active: boolean;
  priority: WorkOrderPriority;
}

export interface SparePart {
  id: string;
  sku: string;
  name: string;
  category: 'Rolamentos & Mancais' | 'Correias & Correntes' | 'Filtros & Vedações' | 'Lubrificantes & Fluidos' | 'Elétrica & Sensores' | 'Pneumática & Hidráulica' | 'Geral';
  quantity: number;
  minQuantity: number;
  unit: 'un' | 'litros' | 'kg' | 'metros' | 'jogos';
  unitCost: number;
  location: string; // Prateleira A-03, Gaveta 12
  supplier?: string;
}

export interface Technician {
  id: string;
  name: string;
  role: 'Mecânico Industrial' | 'Eletricista / Eletromecânico' | 'Técnico de Automação' | 'Supervisor de Manutenção' | 'Lubrificador';
  email: string;
  phone: string;
  specialties: string[];
  status: 'disponivel' | 'em_campo' | 'ausente';
  hourlyRate: number; // R$/hora
}

export interface AppStateData {
  version: number;
  lastUpdated: string;
  assets: Asset[];
  workOrders: WorkOrder[];
  plans: MaintenancePlan[];
  parts: SparePart[];
  technicians: Technician[];
}

export type AppModule = 
  | 'dashboard'
  | 'work-orders'
  | 'assets'
  | 'preventive'
  | 'inventory'
  | 'technicians'
  | 'ai-assistant'
  | 'backup';
