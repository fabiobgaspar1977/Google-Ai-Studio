import React from 'react';
import { 
  Wrench, 
  Plus, 
  HardDrive, 
  Download, 
  CheckCircle2, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { AppModule } from '../../types';

interface NavbarProps {
  currentModule: AppModule;
  onOpenNewWorkOrder: () => void;
  onNavigate: (module: AppModule) => void;
  lastUpdated?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentModule,
  onOpenNewWorkOrder,
  onNavigate,
  lastUpdated
}) => {
  const getModuleTitle = () => {
    switch (currentModule) {
      case 'dashboard': return 'Painel Geral & Indicadores';
      case 'work-orders': return 'Ordens de Serviço (O.S.)';
      case 'assets': return 'Ativos & Máquinas Industriais';
      case 'preventive': return 'Planos & Preventivas Programadas';
      case 'inventory': return 'Almoxarifado & Peças de Reposição';
      case 'technicians': return 'Equipe Técnica & Especialistas';
      case 'ai-assistant': return 'Diagnóstico de Falhas com IA';
      case 'backup': return 'Armazenamento & Backup no Navegador';
      default: return 'Controle de Manutenção';
    }
  };

  return (
    <header className="no-print sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {getModuleTitle()}
        </h1>
        <span className="hidden sm:inline-block text-xs text-slate-400">|</span>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          <HardDrive className="w-3.5 h-3.5" />
          <span className="font-medium">Salvo no Navegador</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="hidden md:inline-flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            Atualizado {new Date(lastUpdated).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}

        <button
          onClick={() => onNavigate('backup')}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors border border-slate-200"
          title="Backup e Dados Locais"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Backup Local</span>
        </button>

        <button
          onClick={onOpenNewWorkOrder}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm hover:shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nova O.S.</span>
        </button>
      </div>
    </header>
  );
};
