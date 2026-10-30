import React, { useState, useEffect } from 'react';
import { AppModule, AppStateData, WorkOrder, Asset, MaintenancePlan } from './types';
import { storage } from './services/storage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { WorkOrdersView } from './components/workOrders/WorkOrdersView';
import { AssetsView } from './components/assets/AssetsView';
import { PreventiveView } from './components/preventive/PreventiveView';
import { InventoryView } from './components/inventory/InventoryView';
import { TechniciansView } from './components/technicians/TechniciansView';
import { AiDiagnosticView } from './components/aiAssistant/AiDiagnosticView';
import { BackupView } from './components/backup/BackupView';
import { WorkOrderModal } from './components/workOrders/WorkOrderModal';

export default function App() {
  const [data, setData] = useState<AppStateData>(() => storage.getData());
  const [currentModule, setCurrentModule] = useState<AppModule>('dashboard');

  // Modal global para criação rápida de OS
  const [isGlobalOrderModalOpen, setIsGlobalOrderModalOpen] = useState(false);
  const [globalOrderDraft, setGlobalOrderDraft] = useState<WorkOrder | null>(null);

  // Seleção contextual de ativo ou ordem para visualização cruzada
  const [selectedOrderContext, setSelectedOrderContext] = useState<WorkOrder | null>(null);
  const [selectedAssetContext, setSelectedAssetContext] = useState<Asset | null>(null);

  // Sincronização reativa com o storage local do navegador
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setData(storage.getData());
    });
    return () => unsubscribe();
  }, []);

  // Handlers para Ordens de Serviço
  const handleSaveWorkOrder = (order: WorkOrder) => {
    // Se novas peças foram consumidas nesta ordem, deduzir automaticamente do estoque do almoxarifado!
    const existingOrder = data.workOrders.find(o => o.id === order.id);
    const prevParts = existingOrder?.partsUsed || [];

    order.partsUsed.forEach(newPart => {
      const prevQty = prevParts.find(p => p.partId === newPart.partId)?.quantity || 0;
      const deltaUsed = newPart.quantity - prevQty;
      if (deltaUsed > 0) {
        storage.adjustStock(newPart.partId, -deltaUsed);
      }
    });

    storage.saveWorkOrder(order);
  };

  const handleDeleteWorkOrder = (orderId: string) => {
    storage.deleteWorkOrder(orderId);
  };

  // Abrir modal de criação de O.S. a partir de um Ativo
  const handleOpenWorkOrderForAsset = (asset: Asset) => {
    const draft: WorkOrder = {
      id: `os-${Date.now()}`,
      code: `OS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      assetId: asset.id,
      title: `Intervenção em ${asset.name}`,
      description: `Chamado técnico para o equipamento ${asset.name} (${asset.tag}) no setor ${asset.sector}.`,
      type: 'corretiva',
      priority: asset.criticality === 'A' ? 'alta' : 'media',
      status: 'aberta',
      assignedTechnicianId: data.technicians[0]?.id,
      requesterName: 'Operador / Encarregado',
      createdAt: new Date().toISOString(),
      scheduledDate: new Date().toISOString().split('T')[0],
      estimatedHours: 2.0,
      hourlyRate: 50.0,
      checklist: [
        { id: `ck-1`, text: 'Aplicar bloqueio e etiquetagem LOTO no painel', completed: false },
        { id: `ck-2`, text: 'Inspecionar sintomas informados na máquina', completed: false },
        { id: `ck-3`, text: 'Executar conserto ou ajuste necessário', completed: false },
        { id: `ck-4`, text: 'Liberar e testar funcionamento em vazio', completed: false }
      ],
      partsUsed: []
    };
    setGlobalOrderDraft(draft);
    setIsGlobalOrderModalOpen(true);
  };

  // Gerar Ordem de Serviço Imediata a partir de um Plano Preventivo (1-Clique)
  const handleGenerateOrderFromPlan = (plan: MaintenancePlan) => {
    const asset = data.assets.find(a => a.id === plan.assetId);
    const tech = data.technicians.find(t => t.id === plan.assignedTechnicianId) || data.technicians[0];

    const draft: WorkOrder = {
      id: `os-${Date.now()}`,
      code: `OS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      assetId: plan.assetId,
      title: plan.title,
      description: `Ordem gerada automaticamente a partir do cronograma preventivo para ${asset?.name || 'Equipamento'}.\nPeriodicidade: a cada ${plan.intervalValue} ${plan.frequencyType}.`,
      type: plan.type,
      priority: plan.priority || 'media',
      status: 'aberta',
      assignedTechnicianId: tech?.id,
      requesterName: 'Cronograma PCM Automático',
      createdAt: new Date().toISOString(),
      scheduledDate: plan.nextDueDate,
      estimatedHours: plan.estimatedDurationHours,
      hourlyRate: tech?.hourlyRate || 50.0,
      checklist: plan.checklistTemplates.map((text, idx) => ({
        id: `ck-gen-${idx}-${Date.now()}`,
        text,
        completed: false
      })),
      partsUsed: []
    };

    // Atualizar próxima data de vencimento do plano preventivo
    const nextDue = new Date();
    if (plan.frequencyType === 'dias') {
      nextDue.setDate(nextDue.getDate() + plan.intervalValue);
    } else {
      nextDue.setDate(nextDue.getDate() + 30);
    }
    storage.savePlan({
      ...plan,
      lastExecutionDate: new Date().toISOString().split('T')[0],
      nextDueDate: nextDue.toISOString().split('T')[0]
    });

    setGlobalOrderDraft(draft);
    setIsGlobalOrderModalOpen(true);
  };

  // Criar O.S. a partir do Assistente IA
  const handleCreateOrderFromAI = (draft: Partial<WorkOrder>) => {
    const tech = data.technicians[0];
    const newOrder: WorkOrder = {
      id: `os-${Date.now()}`,
      code: `OS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      assetId: draft.assetId || data.assets[0]?.id || '',
      title: draft.title || 'Ordem Técnica Sugerida por IA',
      description: draft.description || '',
      type: draft.type || 'corretiva',
      priority: draft.priority || 'alta',
      status: 'aberta',
      assignedTechnicianId: tech?.id,
      requesterName: 'Diagnóstico IA Mantix',
      createdAt: new Date().toISOString(),
      scheduledDate: new Date().toISOString().split('T')[0],
      estimatedHours: draft.estimatedHours || 2.5,
      hourlyRate: tech?.hourlyRate || 50.0,
      checklist: draft.checklist || [],
      partsUsed: [],
      failureCause: draft.failureCause
    };
    setGlobalOrderDraft(newOrder);
    setIsGlobalOrderModalOpen(true);
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden font-sans">
      {/* Barra Lateral de Módulos */}
      <Sidebar
        currentModule={currentModule}
        onNavigate={setCurrentModule}
        data={data}
      />

      {/* Área Central Principal */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar
          currentModule={currentModule}
          onOpenNewWorkOrder={() => {
            setGlobalOrderDraft(null);
            setIsGlobalOrderModalOpen(true);
          }}
          onNavigate={setCurrentModule}
          lastUpdated={data.lastUpdated}
        />

        {/* Conteúdo com Scroll */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {currentModule === 'dashboard' && (
              <DashboardView
                data={data}
                onNavigate={setCurrentModule}
                onSelectWorkOrder={(order) => {
                  setSelectedOrderContext(order);
                  setCurrentModule('work-orders');
                }}
                onSelectAsset={(asset) => {
                  setSelectedAssetContext(asset);
                  setCurrentModule('assets');
                }}
                onGenerateOrderFromPlan={handleGenerateOrderFromPlan}
              />
            )}

            {currentModule === 'work-orders' && (
              <WorkOrdersView
                orders={data.workOrders}
                assets={data.assets}
                technicians={data.technicians}
                parts={data.parts}
                onSaveOrder={handleSaveWorkOrder}
                onDeleteOrder={handleDeleteWorkOrder}
                selectedOrderForModal={selectedOrderContext}
                onClearSelectedOrder={() => setSelectedOrderContext(null)}
              />
            )}

            {currentModule === 'assets' && (
              <AssetsView
                assets={data.assets}
                workOrders={data.workOrders}
                onSaveAsset={(asset) => storage.saveAsset(asset)}
                onDeleteAsset={(assetId) => storage.deleteAsset(assetId)}
                onOpenWorkOrderForAsset={handleOpenWorkOrderForAsset}
                selectedAssetForDetail={selectedAssetContext}
              />
            )}

            {currentModule === 'preventive' && (
              <PreventiveView
                plans={data.plans}
                assets={data.assets}
                technicians={data.technicians}
                onSavePlan={(plan) => storage.savePlan(plan)}
                onDeletePlan={(planId) => storage.deletePlan(planId)}
                onGenerateOrderFromPlan={handleGenerateOrderFromPlan}
              />
            )}

            {currentModule === 'inventory' && (
              <InventoryView
                parts={data.parts}
                onSavePart={(part) => storage.savePart(part)}
                onAdjustStock={(partId, delta) => storage.adjustStock(partId, delta)}
                onDeletePart={(partId) => storage.deletePart(partId)}
              />
            )}

            {currentModule === 'technicians' && (
              <TechniciansView
                technicians={data.technicians}
                workOrders={data.workOrders}
                onSaveTechnician={(tech) => storage.saveTechnician(tech)}
                onDeleteTechnician={(techId) => storage.deleteTechnician(techId)}
              />
            )}

            {currentModule === 'ai-assistant' && (
              <AiDiagnosticView
                assets={data.assets}
                onCreateOrderFromAI={handleCreateOrderFromAI}
              />
            )}

            {currentModule === 'backup' && (
              <BackupView
                data={data}
                onRefreshData={() => setData(storage.getData())}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modal Global de O.S. (acionável de qualquer tela via Navbar ou atalhos) */}
      {isGlobalOrderModalOpen && (
        <WorkOrderModal
          order={globalOrderDraft}
          isOpen={isGlobalOrderModalOpen}
          onClose={() => {
            setIsGlobalOrderModalOpen(false);
            setGlobalOrderDraft(null);
          }}
          onSave={handleSaveWorkOrder}
          onDelete={handleDeleteWorkOrder}
          assets={data.assets}
          technicians={data.technicians}
          parts={data.parts}
        />
      )}
    </div>
  );
}
