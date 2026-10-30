import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Kanban, 
  List, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Wrench, 
  ChevronRight,
  User,
  ArrowRight
} from 'lucide-react';
import { WorkOrder, Asset, Technician, SparePart, WorkOrderStatus, WorkOrderType, WorkOrderPriority } from '../../types';
import { WorkOrderModal } from './WorkOrderModal';
import { PrintableWorkOrder } from './PrintableWorkOrder';

interface WorkOrdersViewProps {
  orders: WorkOrder[];
  assets: Asset[];
  technicians: Technician[];
  parts: SparePart[];
  onSaveOrder: (order: WorkOrder) => void;
  onDeleteOrder: (orderId: string) => void;
  selectedOrderForModal?: WorkOrder | null;
  onClearSelectedOrder?: () => void;
}

export const WorkOrdersView: React.FC<WorkOrdersViewProps> = ({
  orders,
  assets,
  technicians,
  parts,
  onSaveOrder,
  onDeleteOrder,
  selectedOrderForModal,
  onClearSelectedOrder
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [filterPriority, setFilterPriority] = useState<string>('todas');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Modal de edição / criação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeEditingOrder, setActiveEditingOrder] = useState<WorkOrder | null>(null);

  // Monitorar se veio um selecionado externo (ex: do Dashboard)
  React.useEffect(() => {
    if (selectedOrderForModal) {
      setActiveEditingOrder(selectedOrderForModal);
      setIsModalOpen(true);
      if (onClearSelectedOrder) onClearSelectedOrder();
    }
  }, [selectedOrderForModal, onClearSelectedOrder]);

  const handleOpenNew = () => {
    setActiveEditingOrder(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (order: WorkOrder) => {
    setActiveEditingOrder(order);
    setIsModalOpen(true);
  };

  // Filtragem
  const filteredOrders = orders.filter(order => {
    const asset = assets.find(a => a.id === order.assetId);
    const tech = technicians.find(t => t.id === order.assignedTechnicianId);

    const matchSearch = 
      order.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset?.tag && asset.tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (asset?.name && asset.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tech?.name && tech.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchType = filterType === 'todos' || order.type === filterType;
    const matchPriority = filterPriority === 'todas' || order.priority === filterPriority;
    const matchStatus = filterStatus === 'todos' || order.status === filterStatus;

    return matchSearch && matchType && matchPriority && matchStatus;
  });

  // Mudança rápida de status no Kanban
  const handleQuickStatusChange = (order: WorkOrder, newStatus: WorkOrderStatus) => {
    const updated: WorkOrder = {
      ...order,
      status: newStatus,
      startedAt: newStatus === 'em_andamento' && !order.startedAt ? new Date().toISOString() : order.startedAt,
      completedAt: newStatus === 'concluida' && !order.completedAt ? new Date().toISOString() : order.completedAt
    };
    onSaveOrder(updated);
  };

  const getPriorityBadgeClass = (priority: WorkOrderPriority) => {
    switch (priority) {
      case 'urgente': return 'text-rose-700 bg-rose-50 border-rose-200 font-bold';
      case 'alta': return 'text-orange-700 bg-orange-50 border-orange-200 font-semibold';
      case 'media': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'baixa': return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const kanbanColumns: Array<{ id: WorkOrderStatus; title: string; color: string }> = [
    { id: 'aberta', title: 'Abertas', color: 'border-t-amber-500' },
    { id: 'em_andamento', title: 'Em Execução', color: 'border-t-blue-500' },
    { id: 'aguardando_peca', title: 'Aguardando Peças', color: 'border-t-purple-500' },
    { id: 'concluida', title: 'Concluídas', color: 'border-t-emerald-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Barra de Controles e Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Busca Textual */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por código, título, TAG do equipamento ou técnico..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Seletor Kanban vs Tabela */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Tabela</span>
              </button>
            </div>

            <button
              onClick={handleOpenNew}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nova O.S.</span>
            </button>
          </div>
        </div>

        {/* Filtros em Linha */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrar por:</span>
          </div>

          {/* Tipo */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="corretiva">Corretiva</option>
            <option value="preventiva">Preventiva</option>
            <option value="preditiva">Preditiva</option>
            <option value="melhoria">Melhoria</option>
          </select>

          {/* Prioridade */}
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="todas">Todas as Prioridades</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>

          {/* Status (visível especialmente no modo tabela) */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="todos">Todos os Status</option>
            <option value="aberta">Abertas</option>
            <option value="em_andamento">Em Execução</option>
            <option value="aguardando_peca">Aguardando Peça</option>
            <option value="concluida">Concluídas</option>
          </select>

          <span className="text-slate-400 ml-auto">
            Exibindo <strong>{filteredOrders.length}</strong> de {orders.length} ordens
          </span>
        </div>
      </div>

      {/* Visão 1: Kanban Board */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {kanbanColumns.map(col => {
            const colOrders = filteredOrders.filter(o => o.status === col.id);
            return (
              <div key={col.id} className={`bg-slate-100/70 rounded-xl p-3 border border-slate-200 border-t-4 ${col.color}`}>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{col.title}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 shadow-2xs">
                    {colOrders.length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[300px]">
                  {colOrders.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      Nenhuma O.S. nesta coluna
                    </div>
                  ) : (
                    colOrders.map(order => {
                      const asset = assets.find(a => a.id === order.assetId);
                      const tech = technicians.find(t => t.id === order.assignedTechnicianId);
                      const completedChecklist = order.checklist?.filter(c => c.completed).length || 0;
                      const totalChecklist = order.checklist?.length || 0;

                      return (
                        <div
                          key={order.id}
                          onClick={() => handleOpenEdit(order)}
                          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2.5 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              {order.code}
                            </span>
                            <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${getPriorityBadgeClass(order.priority)}`}>
                              {order.priority}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {order.title}
                          </h4>

                          <div className="text-[11px] text-slate-500 space-y-1">
                            <div className="truncate font-medium text-slate-700">
                              [{asset?.tag || 'S/TAG'}] {asset?.name}
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <User className="w-3 h-3 text-slate-400" />
                              <span className="truncate">{tech?.name || 'Não atribuído'}</span>
                            </div>
                          </div>

                          {/* Progresso do Checklist */}
                          {totalChecklist > 0 && (
                            <div className="pt-1">
                              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                <span>Checklist</span>
                                <span>{completedChecklist}/{totalChecklist}</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                <div 
                                  className="bg-emerald-500 h-full rounded-full"
                                  style={{ width: `${(completedChecklist / totalChecklist) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Ações Rápidas de Avançar Status */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 uppercase text-[10px] font-semibold">{order.type}</span>
                            
                            <div className="flex items-center gap-1">
                              {order.status === 'aberta' && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleQuickStatusChange(order, 'em_andamento'); }}
                                  className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-medium transition-colors"
                                >
                                  Iniciar
                                </button>
                              )}
                              {order.status === 'em_andamento' && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleQuickStatusChange(order, 'concluida'); }}
                                  className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-medium transition-colors"
                                >
                                  Concluir
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Visão 2: Tabela Detalhada */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Código / Título</th>
                  <th className="p-3.5">Ativo / Local</th>
                  <th className="p-3.5">Tipo</th>
                  <th className="p-3.5">Prioridade</th>
                  <th className="p-3.5">Técnico</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Custo Total</th>
                  <th className="p-3.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Nenhuma ordem de serviço corresponde aos filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => {
                    const asset = assets.find(a => a.id === order.assetId);
                    const tech = technicians.find(t => t.id === order.assignedTechnicianId);

                    return (
                      <tr 
                        key={order.id}
                        onClick={() => handleOpenEdit(order)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-blue-700 block">{order.code}</span>
                          <span className="font-semibold text-slate-900 block truncate max-w-xs">{order.title}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-medium text-slate-800 block">[{asset?.tag || 'S/TAG'}] {asset?.name}</span>
                          <span className="text-slate-500 text-[11px] block">{asset?.sector}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="capitalize font-medium text-slate-700">{order.type}</span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getPriorityBadgeClass(order.priority)}`}>
                            {order.priority}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium text-slate-800">
                          {tech?.name || 'Não atribuído'}
                        </td>
                        <td className="p-3.5">
                          <span className="capitalize font-medium text-slate-800">
                            {order.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-semibold text-slate-900">
                          {(order.totalCost || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleOpenEdit(order); }}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                          >
                            <ChevronRight className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de O.S. */}
      {isModalOpen && (
        <WorkOrderModal
          order={activeEditingOrder}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={onSaveOrder}
          onDelete={onDeleteOrder}
          assets={assets}
          technicians={technicians}
          parts={parts}
        />
      )}

      {/* Componente Invisível para Impressão caso tenha uma O.S. em edição */}
      {activeEditingOrder && (
        <PrintableWorkOrder
          order={activeEditingOrder}
          asset={assets.find(a => a.id === activeEditingOrder.assetId)}
          technician={technicians.find(t => t.id === activeEditingOrder.assignedTechnicianId)}
        />
      )}
    </div>
  );
};
