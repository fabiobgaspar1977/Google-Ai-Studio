import React from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Cpu, 
  CalendarClock, 
  Package, 
  Users, 
  Sparkles, 
  Database,
  ShieldCheck
} from 'lucide-react';
import { AppModule, AppStateData } from '../../types';

interface SidebarProps {
  currentModule: AppModule;
  onNavigate: (module: AppModule) => void;
  data: AppStateData;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentModule, onNavigate, data }) => {
  const openOrdersCount = data.workOrders.filter(o => o.status === 'aberta' || o.status === 'em_andamento').length;
  const criticalStockCount = data.parts.filter(p => p.quantity <= p.minQuantity).length;
  const warningAssetsCount = data.assets.filter(a => a.status === 'parado' || a.status === 'em_alerta' || a.status === 'em_manutencao').length;

  const navItems = [
    {
      id: 'dashboard' as AppModule,
      label: 'Painel Geral',
      icon: LayoutDashboard,
      badge: undefined
    },
    {
      id: 'work-orders' as AppModule,
      label: 'Ordens de Serviço',
      icon: ClipboardList,
      badge: openOrdersCount > 0 ? openOrdersCount : undefined,
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'assets' as AppModule,
      label: 'Ativos & Máquinas',
      icon: Cpu,
      badge: warningAssetsCount > 0 ? warningAssetsCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'preventive' as AppModule,
      label: 'Preventivas & Planos',
      icon: CalendarClock,
      badge: data.plans.filter(p => p.active).length || undefined,
      badgeColor: 'bg-slate-100 text-slate-700'
    },
    {
      id: 'inventory' as AppModule,
      label: 'Peças & Estoque',
      icon: Package,
      badge: criticalStockCount > 0 ? criticalStockCount : undefined,
      badgeColor: 'bg-rose-100 text-rose-800'
    },
    {
      id: 'technicians' as AppModule,
      label: 'Equipe Técnica',
      icon: Users,
      badge: undefined
    },
    {
      id: 'ai-assistant' as AppModule,
      label: 'Diagnóstico com IA',
      icon: Sparkles,
      badge: 'Smart',
      badgeColor: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: 'backup' as AppModule,
      label: 'Armazenamento & Backup',
      icon: Database,
      badge: undefined
    }
  ];

  return (
    <aside className="no-print w-64 flex-shrink-0 border-r border-slate-200 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="text-base font-bold text-white tracking-tight">Mantix CMMS</span>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Controle de Manutenção</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Módulos do Sistema
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">Modo Local Offline-First</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Todos os registros e atualizações são gravados permanentemente no armazenamento deste navegador.
        </p>
      </div>
    </aside>
  );
};
