import React, { useState } from 'react';
import { X, CalendarClock, Plus, Trash2 } from 'lucide-react';
import { MaintenancePlan, Asset, Technician, WorkOrderPriority } from '../../types';

interface PreventivePlanModalProps {
  plan: MaintenancePlan | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: MaintenancePlan) => void;
  onDelete?: (planId: string) => void;
  assets: Asset[];
  technicians: Technician[];
}

export const PreventivePlanModal: React.FC<PreventivePlanModalProps> = ({
  plan,
  isOpen,
  onClose,
  onSave,
  onDelete,
  assets,
  technicians
}) => {
  if (!isOpen) return null;

  const isEditing = !!plan;

  const [title, setTitle] = useState(plan?.title || '');
  const [assetId, setAssetId] = useState(plan?.assetId || (assets[0]?.id ?? ''));
  const [type, setType] = useState<MaintenancePlan['type']>(plan?.type || 'preventiva');
  const [frequencyType, setFrequencyType] = useState<'dias' | 'horimetro'>(plan?.frequencyType || 'dias');
  const [intervalValue, setIntervalValue] = useState<number>(plan?.intervalValue || 30);
  const [nextDueDate, setNextDueDate] = useState<string>(plan?.nextDueDate || new Date().toISOString().split('T')[0]);
  const [estimatedDurationHours, setEstimatedDurationHours] = useState<number>(plan?.estimatedDurationHours || 2.0);
  const [assignedTechnicianId, setAssignedTechnicianId] = useState(plan?.assignedTechnicianId || (technicians[0]?.id ?? ''));
  const [priority, setPriority] = useState<WorkOrderPriority>(plan?.priority || 'media');
  const [active, setActive] = useState<boolean>(plan?.active ?? true);

  const [checklistTemplates, setChecklistTemplates] = useState<string[]>(
    plan?.checklistTemplates || [
      'Inspeção visual e limpeza geral de componentes',
      'Aferição de temperatura de mancais e ruídos anormais',
      'Verificação do nível de lubrificação e filtros',
      'Checagem de aperto dos parafusos de sustentação'
    ]
  );
  const [newChecklistText, setNewChecklistText] = useState('');

  const handleAddTemplateItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklistTemplates(prev => [...prev, newChecklistText.trim()]);
    setNewChecklistText('');
  };

  const handleRemoveTemplateItem = (index: number) => {
    setChecklistTemplates(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Por favor informe o título do plano de manutenção preventiva.');
      return;
    }

    const updated: MaintenancePlan = {
      id: plan?.id || `pln-${Date.now()}`,
      title: title.trim(),
      assetId,
      type,
      frequencyType,
      intervalValue: Number(intervalValue) || 30,
      lastExecutionDate: plan?.lastExecutionDate,
      nextDueDate,
      estimatedDurationHours: Number(estimatedDurationHours) || 2,
      assignedTechnicianId,
      checklistTemplates,
      active,
      priority
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Editar Plano Preventivo' : 'Criar Plano de Manutenção Preventiva'}
              </h3>
              <p className="text-xs text-slate-500">Configure periodicidade, ativo vinculado e checklist padrão</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Título do Plano Preventivo *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Revisão Trimestral do Compressor Atlas Copco"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Ativo Vinculado *
              </label>
              <select
                value={assetId}
                onChange={e => setAssetId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {assets.map(a => (
                  <option key={a.id} value={a.id}>
                    [{a.tag}] {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Técnico Preferencial
              </label>
              <select
                value={assignedTechnicianId}
                onChange={e => setAssignedTechnicianId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tipo de Rotina
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="preventiva">Preventiva Periódica</option>
                <option value="preditiva">Preditiva (Vibração / Termografia)</option>
                <option value="lubrificacao">Plano de Lubrificação</option>
                <option value="calibracao">Calibração de Instrumentos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Prioridade da O.S. Gerada
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as WorkOrderPriority)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Periodicidade (A cada quantos dias ou horas)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={intervalValue}
                  onChange={e => setIntervalValue(parseInt(e.target.value) || 1)}
                  className="w-24 px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900"
                />
                <select
                  value={frequencyType}
                  onChange={e => setFrequencyType(e.target.value as any)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white"
                >
                  <option value="dias">Dias Corridos</option>
                  <option value="horimetro">Horas de Operação</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Próxima Execução Prevista
              </label>
              <input
                type="date"
                required
                value={nextDueDate}
                onChange={e => setNextDueDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Duração Estimada (Horas)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={estimatedDurationHours}
                onChange={e => setEstimatedDurationHours(parseFloat(e.target.value) || 1)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={e => setActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-800">Plano Ativo no Cronograma</span>
              </label>
            </div>
          </div>

          {/* Checklist Modelo */}
          <div className="border-t border-slate-200 pt-4 space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Checklist Padrão do Plano (Será copiado para cada O.S. gerada)
            </label>

            <div className="space-y-1.5 mb-2">
              {checklistTemplates.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-800">
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTemplateItem(idx)}
                    className="text-slate-400 hover:text-rose-600"
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
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTemplateItem(); } }}
                placeholder="Adicionar tarefa ao roteiro padrão..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddTemplateItem}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Adicionar
              </button>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 -mx-6 -mb-6 mt-6 bg-slate-50 flex items-center justify-between">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Deseja excluir permanentemente este plano preventivo?')) {
                    onDelete(plan.id);
                    onClose();
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
              >
                Excluir Plano
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                {isEditing ? 'Salvar Plano' : 'Criar Plano'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
