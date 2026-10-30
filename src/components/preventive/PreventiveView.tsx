import React, { useState } from 'react';
import { 
  CalendarClock, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Wrench, 
  Play, 
  Edit3, 
  Calendar,
  Layers
} from 'lucide-react';
import { MaintenancePlan, Asset, Technician } from '../../types';
import { PreventivePlanModal } from './PreventivePlanModal';

interface PreventiveViewProps {
  plans: MaintenancePlan[];
  assets: Asset[];
  technicians: Technician[];
  onSavePlan: (plan: MaintenancePlan) => void;
  onDeletePlan: (planId: string) => void;
  onGenerateOrderFromPlan: (plan: MaintenancePlan) => void;
}

export const PreventiveView: React.FC<PreventiveViewProps> = ({
  plans,
  assets,
  technicians,
  onSavePlan,
  onDeletePlan,
  onGenerateOrderFromPlan
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeEditingPlan, setActiveEditingPlan] = useState<MaintenancePlan | null>(null);

  const getDueStatus = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `Atrasada (${Math.abs(diffDays)} dias)`,
        badgeClass: 'text-rose-700 bg-rose-50 border-rose-200 font-bold',
        icon: AlertTriangle
      };
    } else if (diffDays === 0) {
      return {
        label: 'Vence Hoje',
        badgeClass: 'text-amber-800 bg-amber-50 border-amber-200 font-bold',
        icon: Clock
      };
    } else if (diffDays <= 7) {
      return {
        label: `Vence em ${diffDays} dias`,
        badgeClass: 'text-blue-700 bg-blue-50 border-blue-200 font-medium',
        icon: Clock
      };
    } else {
      return {
        label: `Em dia (${diffDays} dias)`,
        badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200 font-medium',
        icon: CheckCircle2
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Ações */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Cronograma de Manutenção Preventiva</h2>
          <p className="text-xs text-slate-500">
            Rotinas automáticas programadas por dias corridos ou horímetro de máquina
          </p>
        </div>

        <button
          onClick={() => { setActiveEditingPlan(null); setIsModalOpen(true); }}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Plano Preventivo</span>
        </button>
      </div>

      {/* Grid de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {plans.map(plan => {
          const asset = assets.find(a => a.id === plan.assetId);
          const tech = technicians.find(t => t.id === plan.assignedTechnicianId);
          const dueStatus = getDueStatus(plan.nextDueDate);
          const StatusIcon = dueStatus.icon;

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                plan.active ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {asset?.tag || 'S/TAG'}
                      </span>
                      <span className="text-xs uppercase font-semibold text-slate-500">
                        {plan.type}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{plan.title}</h3>
                    <p className="text-xs text-slate-500">
                      Equipamento: <strong className="text-slate-700">{asset?.name || 'Não identificado'}</strong>
                    </p>
                  </div>

                  <span className={`text-[11px] px-2.5 py-1 rounded-md border flex items-center gap-1 ${dueStatus.badgeClass}`}>
                    <StatusIcon className="w-3 h-3" />
                    <span>{dueStatus.label}</span>
                  </span>
                </div>

                {/* Parâmetros do Plano */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Periodicidade</span>
                    <span className="font-semibold text-slate-800">
                      A cada {plan.intervalValue} {plan.frequencyType}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Próxima Data</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(plan.nextDueDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Técnico Designado</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {tech?.name || 'Qualquer técnico'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Duração Estimada</span>
                    <span className="font-semibold text-slate-800">
                      {plan.estimatedDurationHours} horas
                    </span>
                  </div>
                </div>

                {/* Checklist Preview */}
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                    Tarefas Programadas ({plan.checklistTemplates.length})
                  </span>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {plan.checklistTemplates.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="truncate">{item}</span>
                      </li>
                    ))}
                    {plan.checklistTemplates.length > 3 && (
                      <li className="text-[11px] text-slate-400 italic">
                        + mais {plan.checklistTemplates.length - 3} itens no roteiro
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Ações */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => { setActiveEditingPlan(plan); setIsModalOpen(true); }}
                  className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Editar Plano</span>
                </button>

                <button
                  onClick={() => onGenerateOrderFromPlan(plan)}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Gerar O.S. Imediata</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <PreventivePlanModal
          plan={activeEditingPlan}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={onSavePlan}
          onDelete={onDeletePlan}
          assets={assets}
          technicians={technicians}
        />
      )}
    </div>
  );
};
