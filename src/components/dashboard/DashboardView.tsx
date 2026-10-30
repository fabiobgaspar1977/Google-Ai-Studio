import React from 'react';
import { 
  Activity, 
  Clock, 
  Wrench, 
  AlertTriangle, 
  DollarSign, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight,
  Package,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { AppStateData, WorkOrder, Asset, MaintenancePlan } from '../../types';

interface DashboardViewProps {
  data: AppStateData;
  onNavigate: (module: any) => void;
  onSelectWorkOrder: (order: WorkOrder) => void;
  onSelectAsset: (asset: Asset) => void;
  onGenerateOrderFromPlan: (plan: MaintenancePlan) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  onNavigate,
  onSelectWorkOrder,
  onSelectAsset,
  onGenerateOrderFromPlan
}) => {
  const { assets, workOrders, plans, parts, technicians } = data;

  // Cálculos de KPIs de Engenharia de Manutenção
  const totalAssets = assets.length;
  const operationalAssets = assets.filter(a => a.status === 'operacional').length;
  const plantAvailability = totalAssets > 0 ? Math.round((operationalAssets / totalAssets) * 100) : 100;

  const openOrders = workOrders.filter(o => o.status === 'aberta' || o.status === 'em_andamento');
  const criticalOrders = openOrders.filter(o => o.priority === 'alta' || o.priority === 'urgente');
  const completedOrders = workOrders.filter(o => o.status === 'concluida');

  // MTTR (Mean Time to Repair): Horas médias gastas nas corretivas concluídas
  const correctiveCompleted = completedOrders.filter(o => o.type === 'corretiva');
  const totalRepairHours = correctiveCompleted.reduce((acc, curr) => acc + (curr.actualHours || curr.estimatedHours || 0), 0);
  const mttrHours = correctiveCompleted.length > 0 
    ? (totalRepairHours / correctiveCompleted.length).toFixed(1) 
    : '2.4';

  // MTBF (Mean Time Between Failures): Estimativa por horas de operação divididas por falhas corretivas
  const totalOperatingHours = assets.reduce((acc, curr) => acc + (curr.operatingHours || 0), 0);
  const mtbfHours = correctiveCompleted.length > 0 
    ? Math.round(totalOperatingHours / (correctiveCompleted.length + 1)) 
    : 850;

  // Custo Total de Manutenção
  const totalCost = workOrders.reduce((acc, curr) => acc + (curr.totalCost || 0), 0);

  // Peças críticas
  const lowStockParts = parts.filter(p => p.quantity <= p.minQuantity);

  // Próximas preventivas (próximos 7 dias)
  const now = new Date();
  const next7Days = new Date();
  next7Days.setDate(now.getDate() + 7);

  const upcomingPlans = plans.filter(p => {
    if (!p.active) return false;
    const due = new Date(p.nextDueDate);
    return due <= next7Days;
  });

  // Distribuição por tipo de OS
  const typeCounts = {
    corretiva: workOrders.filter(o => o.type === 'corretiva').length,
    preventiva: workOrders.filter(o => o.type === 'preventiva').length,
    preditiva: workOrders.filter(o => o.type === 'preditiva').length,
    melhoria: workOrders.filter(o => o.type === 'melhoria' || o.type === 'calibracao').length
  };
  const totalTypes = Math.max(1, workOrders.length);

  return (
    <div className="space-y-6">
      {/* Banner de Boas-vindas e Status do Armazenamento */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-xl p-6 text-white shadow-sm border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold tracking-wider uppercase text-blue-400">Ambiente de Operações</span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-300">Persistência 100% no Navegador</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Centro de Controle & Confiabilidade</h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Monitoramento contínuo de {totalAssets} equipamentos industriais, {openOrders.length} ordens de serviço ativas e almoxarifado técnico com {parts.length} itens cadastrados.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('work-orders')}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow transition-colors flex items-center gap-2"
            >
              <span>Ver Todas as O.S.</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Métricas Principais (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Disponibilidade */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Disponibilidade</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{plantAvailability}%</div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>{operationalAssets} de {totalAssets} operacionais</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className={`h-full rounded-full ${plantAvailability >= 90 ? 'bg-emerald-500' : plantAvailability >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${plantAvailability}%` }}
            />
          </div>
        </div>

        {/* KPI 2: MTBF */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">MTBF Estimado</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{mtbfHours}h</div>
            <div className="text-xs text-slate-500 mt-1">Tempo médio entre falhas</div>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-3 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Confiabilidade estável</span>
          </div>
        </div>

        {/* KPI 3: MTTR */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">MTTR Médio</span>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{mttrHours}h</div>
            <div className="text-xs text-slate-500 mt-1">Tempo médio de reparo</div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3">
            Meta operacional: &lt; 3.0h
          </div>
        </div>

        {/* KPI 4: O.S. Abertas & Críticas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">O.S. em Aberto</span>
            <AlertTriangle className={`w-4 h-4 ${criticalOrders.length > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{openOrders.length}</div>
            <div className="text-xs text-slate-500 mt-1">
              <span className={criticalOrders.length > 0 ? 'text-rose-600 font-semibold' : ''}>
                {criticalOrders.length} com prioridade alta/urgente
              </span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3">
            {completedOrders.length} concluídas no período
          </div>
        </div>

        {/* KPI 5: Custo Total */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Custo Manutenção</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <div className="text-xs text-slate-500 mt-1">Mão de obra + Peças</div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3">
            Acumulado das O.S.
          </div>
        </div>
      </div>

      {/* Seção Operacional: Alertas e Ações Imediatas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel 1: Preventivas Próximas */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Preventivas nos Próximos 7 Dias</h3>
            </div>
            <button
              onClick={() => onNavigate('preventive')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todas
            </button>
          </div>

          {upcomingPlans.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              Nenhuma preventiva com vencimento para esta semana.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingPlans.slice(0, 3).map((plan) => {
                const asset = assets.find(a => a.id === plan.assetId);
                return (
                  <div key={plan.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">{plan.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span className="font-mono text-slate-700">{asset?.tag || 'Ativo'}</span>
                        <span>·</span>
                        <span>Vence em {new Date(plan.nextDueDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onGenerateOrderFromPlan(plan)}
                      className="px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors whitespace-nowrap"
                    >
                      Gerar O.S.
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Painel 2: Peças com Estoque Crítico */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">Alerta de Peças Sobressalentes</h3>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Almoxarifado
            </button>
          </div>

          {lowStockParts.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs flex flex-col items-center gap-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Nenhum item com estoque abaixo do mínimo de segurança.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockParts.slice(0, 3).map((part) => (
                <div key={part.id} className="p-3 rounded-lg border border-rose-100 bg-rose-50/50 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-900 truncate">{part.name}</div>
                    <div className="text-[11px] text-rose-700 mt-0.5">
                      Atual: <span className="font-bold">{part.quantity} {part.unit}</span> / Mínimo: {part.minQuantity} {part.unit}
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('inventory')}
                    className="text-xs font-medium text-rose-700 hover:text-rose-900 bg-white px-2 py-1 rounded border border-rose-200 shadow-2xs"
                  >
                    Repor
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Painel 3: Distribuição dos Tipos de Manutenção */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Mix de Tipos de Manutenção</h3>
            </div>
            <span className="text-xs text-slate-500">{workOrders.length} O.S. totais</span>
          </div>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Preventiva</span>
                <span className="font-semibold text-slate-900">{typeCounts.preventiva} ({Math.round((typeCounts.preventiva / totalTypes) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(typeCounts.preventiva / totalTypes) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Corretiva</span>
                <span className="font-semibold text-slate-900">{typeCounts.corretiva} ({Math.round((typeCounts.corretiva / totalTypes) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(typeCounts.corretiva / totalTypes) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Preditiva</span>
                <span className="font-semibold text-slate-900">{typeCounts.preditiva} ({Math.round((typeCounts.preditiva / totalTypes) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(typeCounts.preditiva / totalTypes) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Melhoria / Calibração</span>
                <span className="font-semibold text-slate-900">{typeCounts.melhoria} ({Math.round((typeCounts.melhoria / totalTypes) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(typeCounts.melhoria / totalTypes) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Ordens de Serviço Recentes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Ordens de Serviço em Destaque</h3>
            <p className="text-xs text-slate-500 mt-0.5">Últimas movimentações e intervenções abertas ou em andamento</p>
          </div>
          <button
            onClick={() => onNavigate('work-orders')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Gerenciar todas as ordens</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {workOrders.slice(0, 5).map((order) => {
            const asset = assets.find(a => a.id === order.assetId);
            const technician = technicians.find(t => t.id === order.assignedTechnicianId);

            const getStatusColor = (st: string) => {
              switch (st) {
                case 'aberta': return 'text-amber-800 bg-amber-50 border-amber-200';
                case 'em_andamento': return 'text-blue-800 bg-blue-50 border-blue-200';
                case 'aguardando_peca': return 'text-purple-800 bg-purple-50 border-purple-200';
                case 'concluida': return 'text-emerald-800 bg-emerald-50 border-emerald-200';
                default: return 'text-slate-800 bg-slate-50 border-slate-200';
              }
            };

            const getStatusLabel = (st: string) => {
              switch (st) {
                case 'aberta': return 'Aberta';
                case 'em_andamento': return 'Em Execução';
                case 'aguardando_peca': return 'Aguardando Peça';
                case 'concluida': return 'Concluída';
                default: return st;
              }
            };

            return (
              <div 
                key={order.id}
                onClick={() => onSelectWorkOrder(order)}
                className="px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {order.code}
                    </span>
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      {order.type}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500">
                      Prioridade: <strong className={order.priority === 'urgente' || order.priority === 'alta' ? 'text-rose-600' : 'text-slate-700'}>{order.priority.toUpperCase()}</strong>
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 truncate">{order.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>Equipamento: <strong className="text-slate-700">{asset?.name || 'Não identificado'} ({asset?.tag})</strong></span>
                    <span>·</span>
                    <span>Técnico: <strong className="text-slate-700">{technician?.name || 'Não atribuído'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-md border ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
