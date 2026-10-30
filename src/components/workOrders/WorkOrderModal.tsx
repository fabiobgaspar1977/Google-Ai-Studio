import React, { useState } from 'react';
import { 
  X, 
  CheckSquare, 
  Plus, 
  Trash2, 
  Printer, 
  Clock, 
  DollarSign, 
  Package, 
  AlertCircle,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { WorkOrder, Asset, Technician, SparePart, WorkOrderPriority, WorkOrderType, WorkOrderStatus, WorkOrderChecklistItem, WorkOrderPartUsed } from '../../types';

interface WorkOrderModalProps {
  order: WorkOrder | null; // null se for criar nova
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: WorkOrder) => void;
  onDelete?: (orderId: string) => void;
  assets: Asset[];
  technicians: Technician[];
  parts: SparePart[];
}

export const WorkOrderModal: React.FC<WorkOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onSave,
  onDelete,
  assets,
  technicians,
  parts
}) => {
  if (!isOpen) return null;

  const isEditing = !!order;

  // Estados do formulário
  const [assetId, setAssetId] = useState<string>(order?.assetId || (assets[0]?.id ?? ''));
  const [title, setTitle] = useState<string>(order?.title || '');
  const [description, setDescription] = useState<string>(order?.description || '');
  const [type, setType] = useState<WorkOrderType>(order?.type || 'corretiva');
  const [priority, setPriority] = useState<WorkOrderPriority>(order?.priority || 'media');
  const [status, setStatus] = useState<WorkOrderStatus>(order?.status || 'aberta');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState<string>(order?.assignedTechnicianId || (technicians[0]?.id ?? ''));
  const [requesterName, setRequesterName] = useState<string>(order?.requesterName || 'Operação de Manutenção');
  const [scheduledDate, setScheduledDate] = useState<string>(order?.scheduledDate || new Date().toISOString().split('T')[0]);
  const [estimatedHours, setEstimatedHours] = useState<number>(order?.estimatedHours || 2.0);
  const [actualHours, setActualHours] = useState<number>(order?.actualHours || 0);
  const [failureCause, setFailureCause] = useState<string>(order?.failureCause || '');
  const [resolutionNotes, setResolutionNotes] = useState<string>(order?.resolutionNotes || '');

  // Checklist
  const [checklist, setChecklist] = useState<WorkOrderChecklistItem[]>(order?.checklist || [
    { id: 'ck-default-1', text: 'Realizar bloqueio e etiquetagem LOTO de segurança', completed: false },
    { id: 'ck-default-2', text: 'Inspecionar componentes e avaliar integridade estrutural', completed: false },
    { id: 'ck-default-3', text: 'Executar intervenção técnica especificada', completed: false },
    { id: 'ck-default-4', text: 'Testar funcionamento em regime operacional normal', completed: false }
  ]);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Peças Utilizadas
  const [partsUsed, setPartsUsed] = useState<WorkOrderPartUsed[]>(order?.partsUsed || []);
  const [selectedPartId, setSelectedPartId] = useState<string>(parts[0]?.id || '');
  const [selectedPartQty, setSelectedPartQty] = useState<number>(1);

  // Manipulação de Checklist
  const handleToggleChecklist = (id: string) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.completed;
        return {
          ...item,
          completed: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined
        };
      }
      return item;
    }));
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const newItem: WorkOrderChecklistItem = {
      id: `ck-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false
    };
    setChecklist(prev => [...prev, newItem]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  // Manipulação de Peças
  const handleAddPart = () => {
    const part = parts.find(p => p.id === selectedPartId);
    if (!part || selectedPartQty <= 0) return;

    const existingIndex = partsUsed.findIndex(p => p.partId === part.id);
    if (existingIndex >= 0) {
      const updated = [...partsUsed];
      const newQty = updated[existingIndex].quantity + selectedPartQty;
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        totalCost: newQty * part.unitCost
      };
      setPartsUsed(updated);
    } else {
      setPartsUsed(prev => [
        ...prev,
        {
          partId: part.id,
          partName: part.name,
          quantity: selectedPartQty,
          unitCost: part.unitCost,
          totalCost: selectedPartQty * part.unitCost
        }
      ]);
    }
  };

  const handleRemovePart = (partId: string) => {
    setPartsUsed(prev => prev.filter(p => p.partId !== partId));
  };

  // Cálculos de Custo
  const tech = technicians.find(t => t.id === assignedTechnicianId);
  const hourlyRate = tech?.hourlyRate || 50.0;
  const effectiveHours = status === 'concluida' && actualHours > 0 ? actualHours : estimatedHours;
  const laborCost = effectiveHours * hourlyRate;
  const partsCost = partsUsed.reduce((acc, curr) => acc + curr.totalCost, 0);
  const totalCost = laborCost + partsCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Por favor informe o título da ordem de serviço.');
      return;
    }

    const updatedOrder: WorkOrder = {
      id: order?.id || `os-${Date.now()}`,
      code: order?.code || `OS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      assetId,
      title: title.trim(),
      description: description.trim(),
      type,
      priority,
      status,
      assignedTechnicianId,
      requesterName: requesterName.trim(),
      createdAt: order?.createdAt || new Date().toISOString(),
      scheduledDate,
      startedAt: status === 'em_andamento' && !order?.startedAt ? new Date().toISOString() : order?.startedAt,
      completedAt: status === 'concluida' && !order?.completedAt ? new Date().toISOString() : order?.completedAt,
      estimatedHours: Number(estimatedHours) || 1,
      actualHours: Number(actualHours) || 0,
      hourlyRate,
      checklist,
      partsUsed,
      failureCause: failureCause.trim() || undefined,
      resolutionNotes: resolutionNotes.trim() || undefined,
      laborCost,
      partsCost,
      totalCost
    };

    onSave(updatedOrder);
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              OS
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing ? `Editar Ordem de Serviço ${order.code}` : 'Nova Ordem de Serviço'}
              </h3>
              <p className="text-xs text-slate-500">
                Preencha os parâmetros operacionais, equipe, checklist e peças
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={handlePrint}
                className="no-print p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 text-xs font-semibold flex items-center gap-1.5"
                title="Imprimir / Exportar PDF da O.S."
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Imprimir O.S.</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formulário com Scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Seção 1: Dados Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Título do Serviço / Resumo da Intervenção *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Substituição de rolamentos do motor de tração da esteira 2"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Ativo / Máquina *
              </label>
              <select
                value={assetId}
                onChange={e => setAssetId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {assets.map(a => (
                  <option key={a.id} value={a.id}>
                    [{a.tag}] {a.name} ({a.sector})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Técnico Responsável *
              </label>
              <select
                value={assignedTechnicianId}
                onChange={e => setAssignedTechnicianId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} - {t.role} (R$ {t.hourlyRate}/h)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tipo de Manutenção
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as WorkOrderType)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="corretiva">Corretiva (Falha detectada)</option>
                <option value="preventiva">Preventiva (Programada)</option>
                <option value="preditiva">Preditiva (Condição / Análise)</option>
                <option value="melhoria">Melhoria / Adequação</option>
                <option value="calibracao">Calibração / Ajuste</option>
                <option value="lubrificacao">Lubrificação & Fluidos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Prioridade Operacional
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as WorkOrderPriority)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="baixa">Baixa (Pode aguardar)</option>
                <option value="media">Média (Rotina padrão)</option>
                <option value="alta">Alta (Risco de parada)</option>
                <option value="urgente">Urgente (Parada imediata de linha)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Status da Ordem
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as WorkOrderStatus)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="aberta">Aberta (Aguardando início)</option>
                <option value="em_andamento">Em Execução (Técnico trabalhando)</option>
                <option value="aguardando_peca">Aguardando Peça (Bloqueado)</option>
                <option value="concluida">Concluída (Finalizada com sucesso)</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Data Prevista / Agendada
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tempo Estimado (Horas)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={estimatedHours}
                onChange={e => setEstimatedHours(parseFloat(e.target.value) || 1)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tempo Real Gasto (Horas Apontadas)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={actualHours}
                onChange={e => setActualHours(parseFloat(e.target.value) || 0)}
                placeholder="0.0"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Descrição Detalhada do Problema / Atividade
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Descreva sintomas, local exato, instruções operacionais e condições anormais..."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Seção 2: Checklist Operacional Interativo */}
          <div className="border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">Checklist de Execução & Segurança</h4>
              </div>
              <span className="text-xs text-slate-500">
                {checklist.filter(c => c.completed).length} de {checklist.length} concluídos
              </span>
            </div>

            <div className="space-y-2 mb-3">
              {checklist.map((item) => (
                <div 
                  key={item.id} 
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                    item.completed ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklist(item.id)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className={`text-xs ${item.completed ? 'line-through text-slate-500' : 'font-medium'}`}>
                      {item.text}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={e => setNewChecklistText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddChecklistItem(); } }}
                placeholder="Adicionar novo item ao checklist (pressione Enter)..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {/* Seção 3: Peças & Materiais Aplicados */}
          <div className="border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">Peças & Insumos Utilizados</h4>
              </div>
              <span className="text-xs font-semibold text-slate-700">
                Subtotal Peças: {partsCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>

            {partsUsed.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden mb-3">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Peça / Insumo</th>
                      <th className="p-2.5 text-center">Qtd</th>
                      <th className="p-2.5 text-right">Unitário</th>
                      <th className="p-2.5 text-right">Total</th>
                      <th className="p-2.5 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {partsUsed.map(p => (
                      <tr key={p.partId} className="hover:bg-slate-50">
                        <td className="p-2.5 font-medium text-slate-900">{p.partName}</td>
                        <td className="p-2.5 text-center">{p.quantity}</td>
                        <td className="p-2.5 text-right text-slate-600">
                          {p.unitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="p-2.5 text-right font-semibold text-slate-900">
                          {p.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemovePart(p.partId)}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedPartId}
                onChange={e => setSelectedPartId(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                {parts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Estoque: {p.quantity} {p.unit} - R$ {p.unitCost.toFixed(2)})
                  </option>
                ))}
              </select>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="1"
                  value={selectedPartQty}
                  onChange={e => setSelectedPartQty(parseInt(e.target.value) || 1)}
                  className="w-20 px-2 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-900 text-center"
                />
                <button
                  type="button"
                  onClick={handleAddPart}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Vincular Peça</span>
                </button>
              </div>
            </div>
          </div>

          {/* Seção 4: Relatório de Encerramento (se estiver concluindo ou concluído) */}
          <div className="border-t border-slate-200 pt-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Encerramento Técnico & Causa Raiz</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Diagnóstico da Causa Raiz da Falha
                </label>
                <textarea
                  rows={2}
                  value={failureCause}
                  onChange={e => setFailureCause(e.target.value)}
                  placeholder="Ex: Fadiga prematura por desalinhamento angular ou falta de lubrificação periódica..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Ação Corretiva Realizada / Recomendações Futuras
                </label>
                <textarea
                  rows={2}
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  placeholder="Ex: Rolamento trocado, alinhado a laser em 0.03mm. Sugerido reduzir intervalo de lubrificação..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Resumo Financeiro da Intervenção */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-xs text-slate-600">
              <div>
                <span className="block text-slate-400">Mão de Obra ({effectiveHours}h x R${hourlyRate}/h)</span>
                <span className="font-semibold text-slate-800 text-sm">{laborCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div>
                <span className="block text-slate-400">Custo com Peças</span>
                <span className="font-semibold text-slate-800 text-sm">{partsCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="block text-xs text-slate-500 font-semibold uppercase">Custo Total da O.S.</span>
              <span className="text-lg font-bold text-slate-900">{totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          </div>
        </form>

        {/* Footer com Ações */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <div>
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Tem certeza que deseja excluir permanentemente a ordem de serviço ${order.code}?`)) {
                    onDelete(order.id);
                    onClose();
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir O.S.</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              {isEditing ? 'Salvar Alterações' : 'Criar Ordem de Serviço'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
