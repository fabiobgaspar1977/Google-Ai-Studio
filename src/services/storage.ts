/**
 * Serviço Modular de Armazenamento Local no Navegador (localStorage)
 * Garante persistência permanente no browser do usuário com dados iniciais realistas,
 * exportação/importação de backup JSON e sincronização instantânea.
 */

import { AppStateData, Asset, WorkOrder, MaintenancePlan, SparePart, Technician } from '../types';

const STORAGE_KEY = 'mantix_cmms_data_v1';

export const INITIAL_DATA: AppStateData = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  assets: [
    {
      id: 'ast-1',
      tag: 'COMP-01',
      name: 'Compressor de Ar Parafuso Atlas Copco GA 37',
      category: 'Compressores',
      sector: 'Casa de Máquinas / Subsolo',
      criticality: 'A',
      status: 'operacional',
      manufacturer: 'Atlas Copco',
      model: 'GA 37 VSD+',
      serialNumber: 'AC-2022-9843',
      installationDate: '2022-03-15',
      operatingHours: 6420,
      lastMaintenanceDate: '2026-09-10',
      nextScheduledDate: '2026-11-15',
      notes: 'Alimenta toda a rede de ar comprimido da estamparia e montagem. Pressão nominal 7.5 bar.',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'ast-2',
      tag: 'LIN-02',
      name: 'Esteira Transportadora de Rolos Motorizados',
      category: 'Linhas de Produção',
      sector: 'Expedição & Linha 2',
      criticality: 'B',
      status: 'em_manutencao',
      manufacturer: 'Dematic',
      model: 'MDR-Conveyor-50',
      serialNumber: 'DM-88210',
      installationDate: '2021-08-20',
      operatingHours: 9810,
      lastMaintenanceDate: '2026-10-14',
      nextScheduledDate: '2026-11-01',
      notes: 'Substituição de mancal do rolo tracionador em andamento.',
      imageUrl: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'ast-3',
      tag: 'CHIL-01',
      name: 'Chiller de Água Gelada Trane 120 TR',
      category: 'Climatização & HVAC',
      sector: 'Cobertura Técnica Bloco B',
      criticality: 'A',
      status: 'operacional',
      manufacturer: 'Trane',
      model: 'RTAF 120',
      serialNumber: 'TRN-4491-K',
      installationDate: '2020-11-10',
      operatingHours: 14200,
      lastMaintenanceDate: '2026-08-05',
      nextScheduledDate: '2026-11-05',
      notes: 'Responsável pelo resfriamento dos moldes de injeção e data center.',
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'ast-4',
      tag: 'GER-01',
      name: 'Grupo Gerador a Diesel Cummins 500 kVA',
      category: 'Geradores & Energia',
      sector: 'Pátio Externo de Força',
      criticality: 'A',
      status: 'operacional',
      manufacturer: 'Cummins',
      model: 'C500 D5e',
      serialNumber: 'CUM-2019-331',
      installationDate: '2019-06-01',
      operatingHours: 780,
      lastMaintenanceDate: '2026-09-28',
      nextScheduledDate: '2026-10-31',
      notes: 'Sistema de emergência no-break da fábrica. Tanque diário de 400 litros.',
      imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'ast-5',
      tag: 'EMP-03',
      name: 'Empilhadeira Elétrica Trilateral Still 2.0t',
      category: 'Veículos & Empilhadeiras',
      sector: 'Almoxarifado Central',
      criticality: 'B',
      status: 'em_alerta',
      manufacturer: 'Still',
      model: 'FM-X 20',
      serialNumber: 'STL-99412',
      installationDate: '2023-01-18',
      operatingHours: 3150,
      lastMaintenanceDate: '2026-07-20',
      nextScheduledDate: '2026-10-25',
      notes: 'Alerta de vibração anormal no mastro de elevação durante carga máxima.',
      imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'ast-6',
      tag: 'BOM-02',
      name: 'Bomba Centrífuga Multiestágio KSB 15cv',
      category: 'Motores & Bombas',
      sector: 'Estação de Tratamento de Efluentes',
      criticality: 'C',
      status: 'operacional',
      manufacturer: 'KSB',
      model: 'Meganorm 50-200',
      serialNumber: 'KSB-7128-BR',
      installationDate: '2021-04-12',
      operatingHours: 11200,
      lastMaintenanceDate: '2026-10-02',
      nextScheduledDate: '2026-12-02',
      notes: 'Selo mecânico substituído na última intervenção trimestral.',
      imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80'
    }
  ],
  technicians: [
    {
      id: 'tec-1',
      name: 'Carlos Mendes',
      role: 'Supervisor de Manutenção',
      email: 'carlos.mendes@empresa.com',
      phone: '(11) 98765-4321',
      specialties: ['Planejamento & PCM', 'Termografia', 'Análise de Vibração'],
      status: 'disponivel',
      hourlyRate: 65.0
    },
    {
      id: 'tec-2',
      name: 'Ricardo Silveira',
      role: 'Mecânico Industrial',
      email: 'ricardo.s@empresa.com',
      phone: '(11) 98822-1100',
      specialties: ['Bombas & Válvulas', 'Alinhamento a Laser', 'Hidráulica'],
      status: 'em_campo',
      hourlyRate: 48.0
    },
    {
      id: 'tec-3',
      name: 'Mariana Duarte',
      role: 'Eletricista / Eletromecânico',
      email: 'mariana.duarte@empresa.com',
      phone: '(11) 99344-5566',
      specialties: ['Painéis Elétricos', 'Inversores de Frequência', 'CLP'],
      status: 'disponivel',
      hourlyRate: 52.0
    },
    {
      id: 'tec-4',
      name: 'João Pedro Ramos',
      role: 'Lubrificador',
      email: 'joao.ramos@empresa.com',
      phone: '(11) 97711-2233',
      specialties: ['Rotas de Lubrificação', 'Contaminação de Óleo', 'Filtros'],
      status: 'disponivel',
      hourlyRate: 38.0
    }
  ],
  parts: [
    {
      id: 'prt-1',
      sku: 'ROL-6208-2RS',
      name: 'Rolamento de Esferas SKF 6208-2RS1/C3',
      category: 'Rolamentos & Mancais',
      quantity: 14,
      minQuantity: 6,
      unit: 'un',
      unitCost: 89.50,
      location: 'Prateleira A - Caixa 04',
      supplier: 'SKF Brasil'
    },
    {
      id: 'prt-2',
      sku: 'OLEO-ISO-VG46',
      name: 'Óleo Lubrificante Hidráulico Mobil DTE 25 (ISO VG 46)',
      category: 'Lubrificantes & Fluidos',
      quantity: 180,
      minQuantity: 80,
      unit: 'litros',
      unitCost: 26.00,
      location: 'Área de Tambores 02',
      supplier: 'Cosan / Mobil'
    },
    {
      id: 'prt-3',
      sku: 'CORR-V-B58',
      name: 'Correia em V Gates Hi-Power II B-58',
      category: 'Correias & Correntes',
      quantity: 8,
      minQuantity: 10, // Abaixo do mínimo!
      unit: 'un',
      unitCost: 45.00,
      location: 'Gaveteiro B - Linha 3',
      supplier: 'Gates Correias'
    },
    {
      id: 'prt-4',
      sku: 'FILT-AR-AC37',
      name: 'Elemento Filtrante de Ar Atlas Copco 1622065800',
      category: 'Filtros & Vedações',
      quantity: 3,
      minQuantity: 4, // Abaixo do mínimo!
      unit: 'un',
      unitCost: 310.00,
      location: 'Prateleira C - Armário 1',
      supplier: 'Atlas Copco Distribuidora'
    },
    {
      id: 'prt-5',
      sku: 'SELO-MEC-38',
      name: 'Selo Mecânico Monomola 38mm Silício/Carbeto Viton',
      category: 'Filtros & Vedações',
      quantity: 5,
      minQuantity: 2,
      unit: 'un',
      unitCost: 195.00,
      location: 'Gaveteiro Selos - 01',
      supplier: 'EagleBurgmann'
    },
    {
      id: 'prt-6',
      sku: 'RELE-TER-30A',
      name: 'Relé de Sobrecarga Térmico Siemens 3RU21 20-32A',
      category: 'Elétrica & Sensores',
      quantity: 7,
      minQuantity: 3,
      unit: 'un',
      unitCost: 165.00,
      location: 'Painel Elétrico Almoxarifado',
      supplier: 'Siemens Brasil'
    }
  ],
  workOrders: [
    {
      id: 'os-1',
      code: 'OS-2026-001',
      assetId: 'ast-2',
      title: 'Ruído excessivo e aquecimento no mancal do rolo tracionador',
      description: 'Operadores relataram som metálico intermitente na linha 2. Verificação inicial acusou temperatura de 78°C no mancal dianteiro direito.',
      type: 'corretiva',
      priority: 'alta',
      status: 'em_andamento',
      assignedTechnicianId: 'tec-2',
      requesterName: 'Marcos Silva (Líder Turno B)',
      createdAt: '2026-10-28T09:15:00.000Z',
      scheduledDate: '2026-10-28',
      startedAt: '2026-10-28T10:30:00.000Z',
      estimatedHours: 3.5,
      actualHours: 2.0,
      hourlyRate: 48.0,
      checklist: [
        { id: 'ck-1', text: 'Desenergizar equipamento e aplicar Bloqueio/LOTO', completed: true, completedAt: '2026-10-28T10:35:00.000Z' },
        { id: 'ck-2', text: 'Remover proteção de corrente e afrouxar esticador', completed: true, completedAt: '2026-10-28T11:00:00.000Z' },
        { id: 'ck-3', text: 'Sacar rolamento danificado e inspecionar eixo quanto a desgastes', completed: true, completedAt: '2026-10-28T11:45:00.000Z' },
        { id: 'ck-4', text: 'Instalar novo rolamento SKF 6208 com aquecedor indutivo', completed: false },
        { id: 'ck-5', text: 'Efetuar alinhamento e teste em vazio por 15 minutos', completed: false }
      ],
      partsUsed: [
        { partId: 'prt-1', partName: 'Rolamento de Esferas SKF 6208-2RS1/C3', quantity: 1, unitCost: 89.50, totalCost: 89.50 }
      ],
      laborCost: 96.0,
      partsCost: 89.50,
      totalCost: 185.50
    },
    {
      id: 'os-2',
      code: 'OS-2026-002',
      assetId: 'ast-4',
      title: 'Inspeção preventiva mensal e teste de partida em carga',
      description: 'Rotina de prevenção mensal do grupo gerador Cummins 500 kVA. Verificação de baterias, nível de água do radiador e pré-aquecimento.',
      type: 'preventiva',
      priority: 'media',
      status: 'aberta',
      assignedTechnicianId: 'tec-3',
      requesterName: 'Sistema Automático PCM',
      createdAt: '2026-10-29T08:00:00.000Z',
      scheduledDate: '2026-10-31',
      estimatedHours: 2.0,
      hourlyRate: 52.0,
      checklist: [
        { id: 'ck-201', text: 'Medir tensão de flutuação das baterias (esperado 27.2Vcc)', completed: false },
        { id: 'ck-202', text: 'Verificar nível e saturação do filtro de combustível Racor', completed: false },
        { id: 'ck-203', text: 'Checar nível de líquido arrefecedor e resistência de bloco', completed: false },
        { id: 'ck-204', text: 'Testar comutação automática da chave de transferência (QTA)', completed: false }
      ],
      partsUsed: [],
      laborCost: 104.0,
      partsCost: 0,
      totalCost: 104.0
    },
    {
      id: 'os-3',
      code: 'OS-2026-003',
      assetId: 'ast-5',
      title: 'Vibração excessiva no sistema de elevação da torre',
      description: 'Operador de logística informou trepidação ao elevar paletes acima de 4 metros. Necessário inspecionar guias, roletes e corrente de içamento.',
      type: 'preditiva',
      priority: 'alta',
      status: 'aberta',
      assignedTechnicianId: 'tec-2',
      requesterName: 'Fernanda Rocha (Supervisão Logística)',
      createdAt: '2026-10-27T14:20:00.000Z',
      scheduledDate: '2026-10-30',
      estimatedHours: 4.0,
      hourlyRate: 48.0,
      checklist: [
        { id: 'ck-301', text: 'Medir folga radial e axial dos roletes da torre com paquímetro', completed: false },
        { id: 'ck-302', text: 'Checar desgaste e tensão entre as correntes duplas', completed: false },
        { id: 'ck-303', text: 'Inspecionar pressão da válvula de alívio do cilindro principal', completed: false }
      ],
      partsUsed: [],
      laborCost: 192.0,
      partsCost: 0,
      totalCost: 192.0
    },
    {
      id: 'os-4',
      code: 'OS-2026-004',
      assetId: 'ast-1',
      title: 'Troca de elemento filtrante e dreno condensado',
      description: 'Manutenção preventiva programada de 6.000 horas do compressor de ar Atlas Copco.',
      type: 'preventiva',
      priority: 'media',
      status: 'concluida',
      assignedTechnicianId: 'tec-4',
      requesterName: 'Sistema Automático PCM',
      createdAt: '2026-09-08T10:00:00.000Z',
      scheduledDate: '2026-09-10',
      startedAt: '2026-09-10T08:30:00.000Z',
      completedAt: '2026-09-10T12:00:00.000Z',
      estimatedHours: 3.5,
      actualHours: 3.5,
      hourlyRate: 38.0,
      checklist: [
        { id: 'ck-401', text: 'Isolamento elétrico e despressurização do reservatório', completed: true, completedAt: '2026-09-10T08:45:00.000Z' },
        { id: 'ck-402', text: 'Substituição do filtro de ar e filtro de óleo', completed: true, completedAt: '2026-09-10T09:40:00.000Z' },
        { id: 'ck-403', text: 'Limpeza do dreno eletrônico de condensado', completed: true, completedAt: '2026-09-10T10:30:00.000Z' },
        { id: 'ck-404', text: 'Teste de estanqueidade e aferição da temperatura de descarga', completed: true, completedAt: '2026-09-10T11:50:00.000Z' }
      ],
      partsUsed: [
        { partId: 'prt-4', partName: 'Elemento Filtrante de Ar Atlas Copco 1622065800', quantity: 1, unitCost: 310.00, totalCost: 310.00 }
      ],
      failureCause: 'Desgaste natural por ciclo de operação programado.',
      resolutionNotes: 'Troca realizada com sucesso. Pressão de trabalho aferida em 7.4 bar estável.',
      laborCost: 133.0,
      partsCost: 310.0,
      totalCost: 443.0
    }
  ],
  plans: [
    {
      id: 'pln-1',
      title: 'Plano Preventivo Mensal - Grupo Gerador',
      assetId: 'ast-4',
      type: 'preventiva',
      frequencyType: 'dias',
      intervalValue: 30,
      lastExecutionDate: '2026-09-28',
      nextDueDate: '2026-10-31',
      estimatedDurationHours: 2.0,
      assignedTechnicianId: 'tec-3',
      checklistTemplates: [
        'Medição de tensão das baterias e conexões',
        'Verificação de nível de óleo do cárter e fluido de arrefecimento',
        'Teste de partida a vazio por 10 minutos',
        'Inspeção visual de vazamentos de diesel e mangueiras'
      ],
      recommendedParts: ['Filtro de Óleo Lubrificante', 'Aditivo de Radiador'],
      active: true,
      priority: 'media'
    },
    {
      id: 'pln-2',
      title: 'Revisão Trimestral - Compressor de Ar GA 37',
      assetId: 'ast-1',
      type: 'preventiva',
      frequencyType: 'dias',
      intervalValue: 90,
      lastExecutionDate: '2026-09-10',
      nextDueDate: '2026-12-10',
      estimatedDurationHours: 4.0,
      assignedTechnicianId: 'tec-4',
      checklistTemplates: [
        'Substituição ou limpeza dos filtros de ar e óleo',
        'Verificação de delta de pressão no separador ar/óleo',
        'Inspeção da válvula de admissão e válvula de pressão mínima',
        'Leitura de temperatura de descarga e ruído acústico'
      ],
      recommendedParts: ['prt-4'],
      active: true,
      priority: 'alta'
    },
    {
      id: 'pln-3',
      title: 'Inspeção de Lubrificação e Mancais - Esteiras',
      assetId: 'ast-2',
      type: 'lubrificacao',
      frequencyType: 'dias',
      intervalValue: 15,
      lastExecutionDate: '2026-10-14',
      nextDueDate: '2026-10-29',
      estimatedDurationHours: 1.5,
      assignedTechnicianId: 'tec-2',
      checklistTemplates: [
        'Engraxamento dos rolamentos das extremidades tracionadora e de retorno',
        'Verificação da folga e tensão das correias de acionamento',
        'Limpeza de poeira e detritos nas guias laterais'
      ],
      active: true,
      priority: 'media'
    },
    {
      id: 'pln-4',
      title: 'Termografia e Aferição de Corrente - Chiller Central',
      assetId: 'ast-3',
      type: 'preditiva',
      frequencyType: 'dias',
      intervalValue: 60,
      lastExecutionDate: '2026-08-05',
      nextDueDate: '2026-11-05',
      estimatedDurationHours: 3.0,
      assignedTechnicianId: 'tec-1',
      checklistTemplates: [
        'Termografia infravermelha no quadro de comando e bornes de compressores',
        'Medição de corrente balanceada nas 3 fases dos motores elétricos',
        'Verificação de superaquecimento e sub-resfriamento do fluido R134a'
      ],
      active: true,
      priority: 'alta'
    }
  ]
};

class StorageService {
  private cache: AppStateData | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
    this.init();
  }

  private init(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppStateData;
        if (parsed && Array.isArray(parsed.assets) && Array.isArray(parsed.workOrders)) {
          this.cache = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Falha ao ler dados locais, redefinindo para padrão inicial.', e);
    }

    // Inicializa com dados padrão
    this.cache = { ...INITIAL_DATA };
    this.persist();
  }

  public getData(): AppStateData {
    if (!this.cache) {
      this.init();
    }
    return this.cache!;
  }

  public updateData(updater: (current: AppStateData) => AppStateData): void {
    const current = this.getData();
    const updated = updater({ ...current, lastUpdated: new Date().toISOString() });
    this.cache = updated;
    this.persist();
    this.notify();
  }

  private persist(): void {
    if (typeof window === 'undefined' || !this.cache) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
    } catch (err) {
      console.error('Erro ao salvar no localStorage:', err);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('Erro no listener de storage:', err);
      }
    }
  }

  // Operações em Ativos
  public saveAsset(asset: Asset): void {
    this.updateData(data => {
      const existsIndex = data.assets.findIndex(a => a.id === asset.id);
      let newAssets: Asset[];
      if (existsIndex >= 0) {
        newAssets = [...data.assets];
        newAssets[existsIndex] = asset;
      } else {
        newAssets = [asset, ...data.assets];
      }
      return { ...data, assets: newAssets };
    });
  }

  public deleteAsset(assetId: string): void {
    this.updateData(data => ({
      ...data,
      assets: data.assets.filter(a => a.id !== assetId)
    }));
  }

  // Operações em Ordens de Serviço
  public saveWorkOrder(workOrder: WorkOrder): void {
    this.updateData(data => {
      const existsIndex = data.workOrders.findIndex(o => o.id === workOrder.id);
      let newOrders: WorkOrder[];
      if (existsIndex >= 0) {
        newOrders = [...data.workOrders];
        newOrders[existsIndex] = workOrder;
      } else {
        newOrders = [workOrder, ...data.workOrders];
      }

      // Se a OS mudar o status do ativo (ex: se OS está em andamento corretiva, ativo fica 'em_manutencao')
      let newAssets = [...data.assets];
      const targetAsset = newAssets.find(a => a.id === workOrder.assetId);
      if (targetAsset) {
        if (workOrder.status === 'em_andamento' && workOrder.type === 'corretiva') {
          targetAsset.status = 'em_manutencao';
        } else if (workOrder.status === 'concluida') {
          // Checar se não há outras ordens abertas para esse ativo
          const remainingOpenOrders = newOrders.filter(o => o.assetId === workOrder.assetId && (o.status === 'aberta' || o.status === 'em_andamento'));
          if (remainingOpenOrders.length === 0) {
            targetAsset.status = 'operacional';
            targetAsset.lastMaintenanceDate = new Date().toISOString().split('T')[0];
          }
        }
      }

      return { ...data, workOrders: newOrders, assets: newAssets };
    });
  }

  public deleteWorkOrder(orderId: string): void {
    this.updateData(data => ({
      ...data,
      workOrders: data.workOrders.filter(o => o.id !== orderId)
    }));
  }

  // Operações em Planos
  public savePlan(plan: MaintenancePlan): void {
    this.updateData(data => {
      const existsIndex = data.plans.findIndex(p => p.id === plan.id);
      let newPlans: MaintenancePlan[];
      if (existsIndex >= 0) {
        newPlans = [...data.plans];
        newPlans[existsIndex] = plan;
      } else {
        newPlans = [plan, ...data.plans];
      }
      return { ...data, plans: newPlans };
    });
  }

  public deletePlan(planId: string): void {
    this.updateData(data => ({
      ...data,
      plans: data.plans.filter(p => p.id !== planId)
    }));
  }

  // Operações em Peças & Estoque
  public savePart(part: SparePart): void {
    this.updateData(data => {
      const existsIndex = data.parts.findIndex(p => p.id === part.id);
      let newParts: SparePart[];
      if (existsIndex >= 0) {
        newParts = [...data.parts];
        newParts[existsIndex] = part;
      } else {
        newParts = [part, ...data.parts];
      }
      return { ...data, parts: newParts };
    });
  }

  public adjustStock(partId: string, delta: number): void {
    this.updateData(data => {
      const newParts = data.parts.map(p => {
        if (p.id === partId) {
          const newQty = Math.max(0, p.quantity + delta);
          return { ...p, quantity: newQty };
        }
        return p;
      });
      return { ...data, parts: newParts };
    });
  }

  public deletePart(partId: string): void {
    this.updateData(data => ({
      ...data,
      parts: data.parts.filter(p => p.id !== partId)
    }));
  }

  // Operações em Técnicos
  public saveTechnician(tech: Technician): void {
    this.updateData(data => {
      const existsIndex = data.technicians.findIndex(t => t.id === tech.id);
      let newTechs: Technician[];
      if (existsIndex >= 0) {
        newTechs = [...data.technicians];
        newTechs[existsIndex] = tech;
      } else {
        newTechs = [tech, ...data.technicians];
      }
      return { ...data, technicians: newTechs };
    });
  }

  public deleteTechnician(techId: string): void {
    this.updateData(data => ({
      ...data,
      technicians: data.technicians.filter(t => t.id !== techId)
    }));
  }

  // Backup & Restauração
  public exportBackupJson(): string {
    const data = this.getData();
    return JSON.stringify(data, null, 2);
  }

  public importBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString) as AppStateData;
      if (parsed && Array.isArray(parsed.assets) && Array.isArray(parsed.workOrders)) {
        this.cache = {
          ...parsed,
          version: parsed.version || 1,
          lastUpdated: new Date().toISOString()
        };
        this.persist();
        this.notify();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Erro na importação JSON:', e);
      return false;
    }
  }

  public resetToFactory(): void {
    this.cache = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.persist();
    this.notify();
  }

  public getStorageUsage(): { bytes: number; kb: number; percentEstimate: number } {
    if (typeof window === 'undefined') return { bytes: 0, kb: 0, percentEstimate: 0 };
    const raw = localStorage.getItem(STORAGE_KEY) || '';
    const bytes = new Blob([raw]).size;
    const kb = Math.round(bytes / 1024 * 10) / 10;
    // localStorage normalmente suporta ~5MB (5120 KB)
    const percentEstimate = Math.min(100, Math.round((kb / 5120) * 1000) / 10);
    return { bytes, kb, percentEstimate };
  }
}

export const storage = new StorageService();
