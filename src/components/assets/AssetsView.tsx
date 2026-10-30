import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Cpu, 
  Wrench, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Layers,
  ChevronRight,
  History,
  QrCode
} from 'lucide-react';
import { Asset, WorkOrder, Criticality, AssetStatus } from '../../types';
import { AssetModal } from './AssetModal';

interface AssetsViewProps {
  assets: Asset[];
  workOrders: WorkOrder[];
  onSaveAsset: (asset: Asset) => void;
  onDeleteAsset: (assetId: string) => void;
  onOpenWorkOrderForAsset: (asset: Asset) => void;
  selectedAssetForDetail?: Asset | null;
}

export const AssetsView: React.FC<AssetsViewProps> = ({
  assets,
  workOrders,
  onSaveAsset,
  onDeleteAsset,
  onOpenWorkOrderForAsset,
  selectedAssetForDetail
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCriticality, setFilterCriticality] = useState<string>('todas');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterCategory, setFilterCategory] = useState<string>('todas');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeEditingAsset, setActiveEditingAsset] = useState<Asset | null>(null);
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<Asset | null>(selectedAssetForDetail || null);

  React.useEffect(() => {
    if (selectedAssetForDetail) {
      setSelectedAssetDetail(selectedAssetForDetail);
    }
  }, [selectedAssetForDetail]);

  const filteredAssets = assets.filter(asset => {
    const matchSearch =
      asset.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCrit = filterCriticality === 'todas' || asset.criticality === filterCriticality;
    const matchStat = filterStatus === 'todos' || asset.status === filterStatus;
    const matchCat = filterCategory === 'todas' || asset.category === filterCategory;

    return matchSearch && matchCrit && matchStat && matchCat;
  });

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'operacional':
        return <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded">Operacional</span>;
      case 'em_manutencao':
        return <span className="text-blue-700 bg-blue-50 border border-blue-200 text-[11px] font-semibold px-2 py-0.5 rounded">Em Manutenção</span>;
      case 'parado':
        return <span className="text-rose-700 bg-rose-50 border border-rose-200 text-[11px] font-semibold px-2 py-0.5 rounded">Parado / Crítico</span>;
      case 'em_alerta':
        return <span className="text-amber-700 bg-amber-50 border border-amber-200 text-[11px] font-semibold px-2 py-0.5 rounded">Em Alerta</span>;
    }
  };

  const getCriticalityBadge = (crit: Criticality) => {
    switch (crit) {
      case 'A':
        return <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded text-[10px]">Classe A</span>;
      case 'B':
        return <span className="font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[10px]">Classe B</span>;
      case 'C':
        return <span className="font-medium text-slate-700 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">Classe C</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controles de Busca e Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por TAG, nome do equipamento, setor ou fabricante..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => { setActiveEditingAsset(null); setIsModalOpen(true); }}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors self-end md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Ativo</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          <select
            value={filterCriticality}
            onChange={e => setFilterCriticality(e.target.value)}
            className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 text-xs"
          >
            <option value="todas">Todas as Criticidades</option>
            <option value="A">Classe A (Críticos)</option>
            <option value="B">Classe B (Importantes)</option>
            <option value="C">Classe C (Secundários)</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 text-xs"
          >
            <option value="todos">Todos os Status</option>
            <option value="operacional">Operacional</option>
            <option value="em_manutencao">Em Manutenção</option>
            <option value="em_alerta">Em Alerta</option>
            <option value="parado">Parado</option>
          </select>

          <span className="text-slate-400 ml-auto">
            {filteredAssets.length} de {assets.length} ativos
          </span>
        </div>
      </div>

      {/* Grid de Ativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAssets.map(asset => {
          const assetOrders = workOrders.filter(o => o.assetId === asset.id);
          const activeOrders = assetOrders.filter(o => o.status === 'aberta' || o.status === 'em_andamento');

          return (
            <div
              key={asset.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {asset.tag}
                      </span>
                      {getCriticalityBadge(asset.criticality)}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{asset.name}</h3>
                    <p className="text-xs text-slate-500">{asset.sector}</p>
                  </div>

                  <div>
                    {getStatusBadge(asset.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block">Horímetro</span>
                    <span className="font-semibold text-slate-800">{asset.operatingHours.toLocaleString()} h</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Fabricante</span>
                    <span className="font-semibold text-slate-800 truncate block">{asset.manufacturer || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">O.S. em Aberto</span>
                    <span className={`font-semibold ${activeOrders.length > 0 ? 'text-blue-600' : 'text-slate-700'}`}>
                      {activeOrders.length} ordens
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Última Revisão</span>
                    <span className="font-semibold text-slate-800">
                      {asset.lastMaintenanceDate ? new Date(asset.lastMaintenanceDate).toLocaleDateString('pt-BR') : 'Sem reg.'}
                    </span>
                  </div>
                </div>

                {asset.notes && (
                  <p className="text-xs text-slate-600 line-clamp-2 italic">
                    "{asset.notes}"
                  </p>
                )}
              </div>

              {/* Ações do Card */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedAssetDetail(asset)}
                  className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                >
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <span>Histórico ({assetOrders.length})</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setActiveEditingAsset(asset); setIsModalOpen(true); }}
                    className="text-slate-500 hover:text-blue-600 font-medium px-2 py-1 rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onOpenWorkOrderForAsset(asset)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2.5 py-1 rounded-md transition-colors"
                  >
                    + Abrir O.S.
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer / Modal de Detalhes e Histórico de Intervenções */}
      {selectedAssetDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {selectedAssetDetail.tag.slice(0, 4)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Histórico & Prontuário Técnico: [{selectedAssetDetail.tag}] {selectedAssetDetail.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Setor: {selectedAssetDetail.sector} · Modelo: {selectedAssetDetail.model || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAssetDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block">Horímetro Total</span>
                  <span className="text-base font-bold text-slate-900">{selectedAssetDetail.operatingHours}h</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block">Status Operacional</span>
                  <span className="mt-1 block">{getStatusBadge(selectedAssetDetail.status)}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block">Criticidade Operacional</span>
                  <span className="mt-1 block">{getCriticalityBadge(selectedAssetDetail.criticality)}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                  Histórico de Intervenções e Ordens de Serviço
                </h4>
                {(() => {
                  const history = workOrders.filter(o => o.assetId === selectedAssetDetail.id);
                  if (history.length === 0) {
                    return (
                      <p className="text-xs text-slate-400 py-4 text-center">
                        Nenhuma ordem de serviço registrada para este equipamento até o momento.
                      </p>
                    );
                  }
                  return (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                      {history.map(order => (
                        <div key={order.id} className="p-3 text-xs flex items-center justify-between hover:bg-slate-50">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-blue-700">{order.code}</span>
                              <span className="text-slate-400">·</span>
                              <span className="font-semibold text-slate-800">{order.title}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Tipo: {order.type} · Data: {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-slate-900">
                              {(order.totalCost || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                            <span className="block text-[10px] uppercase font-bold text-slate-500">
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => setSelectedAssetDetail(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  const asset = selectedAssetDetail;
                  setSelectedAssetDetail(null);
                  onOpenWorkOrderForAsset(asset);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                Abrir Nova O.S. para este Ativo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação / Edição de Ativo */}
      {isModalOpen && (
        <AssetModal
          asset={activeEditingAsset}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={onSaveAsset}
          onDelete={onDeleteAsset}
        />
      )}
    </div>
  );
};
