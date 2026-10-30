import React, { useRef, useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  HardDrive, 
  FileJson, 
  ShieldCheck,
  Cpu,
  ClipboardList,
  Package,
  Users
} from 'lucide-react';
import { AppStateData } from '../../types';
import { storage } from '../../services/storage';

interface BackupViewProps {
  data: AppStateData;
  onRefreshData: () => void;
}

export const BackupView: React.FC<BackupViewProps> = ({ data, onRefreshData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  const usage = storage.getStorageUsage();

  const handleExportBackup = () => {
    const jsonStr = storage.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mantix_cmms_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const ok = storage.importBackupJson(content);
      if (ok) {
        setImportStatus({ success: true, message: 'Dados restaurados com sucesso a partir do arquivo JSON!' });
        onRefreshData();
      } else {
        setImportStatus({ success: false, message: 'Arquivo JSON inválido ou corrompido. Verifique o formato do arquivo.' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetToFactory = () => {
    if (confirm('Tem certeza que deseja redefinir para os dados de demonstração iniciais? Suas alterações locais serão substituídas pelos dados de fábrica.')) {
      storage.resetToFactory();
      setImportStatus({ success: true, message: 'Banco de dados local restaurado para os dados padrão de fábrica!' });
      onRefreshData();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner de Armazenamento Local */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Armazenamento Local no Navegador (Offline-First)</h2>
            <p className="text-xs text-slate-500">
              Todos os seus ativos, ordens de serviço, preventivas e estoque são salvos no <code>localStorage</code> deste computador.
            </p>
          </div>
        </div>

        {/* Estatísticas de Armazenamento */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>Ativos Cadastrados</span>
            </div>
            <span className="text-lg font-bold text-slate-900">{data.assets.length}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Ordens de Serviço</span>
            </div>
            <span className="text-lg font-bold text-slate-900">{data.workOrders.length}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Package className="w-3.5 h-3.5" />
              <span>Peças & Insumos</span>
            </div>
            <span className="text-lg font-bold text-slate-900">{data.parts.length}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>Técnicos Registrados</span>
            </div>
            <span className="text-lg font-bold text-slate-900">{data.technicians.length}</span>
          </div>
        </div>

        <div className="pt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100">
          <span>Espaço ocupado no browser: <strong>{usage.kb} KB</strong> (~{usage.percentEstimate}% da cota recomendada)</span>
          <span>Versão da base: <strong>v{data.version}</strong></span>
        </div>
      </div>

      {/* Ações de Backup & Restauração */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Exportar */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Exportar Backup Completo (JSON)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Baixe um arquivo seguro com todos os registros do sistema para manter uma cópia externa ou transferir para outro computador ou navegador.
            </p>
          </div>

          <button
            onClick={handleExportBackup}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Arquivo de Backup (.json)</span>
          </button>
        </div>

        {/* Importar */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Restaurar Backup a partir de Arquivo</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Carregue um arquivo JSON gerado anteriormente pelo Mantix CMMS para restaurar todos os seus dados e configurações.
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold py-2.5 rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Selecionar Arquivo JSON</span>
          </button>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {importStatus && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
          importStatus.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {importStatus.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span className="font-medium">{importStatus.message}</span>
        </div>
      )}

      {/* Reset para Demonstração */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Restaurar Dados de Fábrica / Demonstração</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Recarrega o catálogo original com compressores, esteiras, geradores, almoxarifado completo e ordens de exemplo.
          </p>
        </div>

        <button
          onClick={handleResetToFactory}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-2 rounded-lg border border-rose-200 transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar Fábrica</span>
        </button>
      </div>
    </div>
  );
};
