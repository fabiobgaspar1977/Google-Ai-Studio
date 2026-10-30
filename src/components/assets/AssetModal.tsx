import React, { useState } from 'react';
import { X, Cpu, Trash2 } from 'lucide-react';
import { Asset, Criticality, AssetStatus } from '../../types';

interface AssetModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: Asset) => void;
  onDelete?: (assetId: string) => void;
}

export const AssetModal: React.FC<AssetModalProps> = ({
  asset,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  if (!isOpen) return null;

  const isEditing = !!asset;

  const [tag, setTag] = useState(asset?.tag || '');
  const [name, setName] = useState(asset?.name || '');
  const [category, setCategory] = useState<Asset['category']>(asset?.category || 'Compressores');
  const [sector, setSector] = useState(asset?.sector || '');
  const [criticality, setCriticality] = useState<Criticality>(asset?.criticality || 'B');
  const [status, setStatus] = useState<AssetStatus>(asset?.status || 'operacional');
  const [manufacturer, setManufacturer] = useState(asset?.manufacturer || '');
  const [model, setModel] = useState(asset?.model || '');
  const [serialNumber, setSerialNumber] = useState(asset?.serialNumber || '');
  const [installationDate, setInstallationDate] = useState(asset?.installationDate || new Date().toISOString().split('T')[0]);
  const [operatingHours, setOperatingHours] = useState(asset?.operatingHours || 0);
  const [notes, setNotes] = useState(asset?.notes || '');
  const [imageUrl, setImageUrl] = useState(asset?.imageUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tag.trim() || !name.trim()) {
      alert('Por favor informe a TAG e o Nome do Equipamento.');
      return;
    }

    const updated: Asset = {
      id: asset?.id || `ast-${Date.now()}`,
      tag: tag.trim().toUpperCase(),
      name: name.trim(),
      category,
      sector: sector.trim() || 'Fábrica Geral',
      criticality,
      status,
      manufacturer: manufacturer.trim(),
      model: model.trim(),
      serialNumber: serialNumber.trim(),
      installationDate,
      operatingHours: Number(operatingHours) || 0,
      lastMaintenanceDate: asset?.lastMaintenanceDate,
      nextScheduledDate: asset?.nextScheduledDate,
      notes: notes.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined
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
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing ? `Editar Ativo: ${asset.tag}` : 'Cadastrar Novo Equipamento / Ativo'}
              </h3>
              <p className="text-xs text-slate-500">Defina TAG, criticidade e especificações técnicas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                TAG de Identificação *
              </label>
              <input
                type="text"
                required
                value={tag}
                onChange={e => setTag(e.target.value)}
                placeholder="Ex: COMP-02, EST-05, TR-01"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-mono uppercase text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nome do Equipamento *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Compressor de Parafuso 50HP"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Compressores">Compressores</option>
                <option value="Motores & Bombas">Motores & Bombas</option>
                <option value="Linhas de Produção">Linhas de Produção</option>
                <option value="Climatização & HVAC">Climatização & HVAC</option>
                <option value="Geradores & Energia">Geradores & Energia</option>
                <option value="Veículos & Empilhadeiras">Veículos & Empilhadeiras</option>
                <option value="Predial">Predial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Setor / Localização
              </label>
              <input
                type="text"
                value={sector}
                onChange={e => setSector(e.target.value)}
                placeholder="Ex: Galpão Central, Linha 3, Subestação"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Criticidade ABC
              </label>
              <select
                value={criticality}
                onChange={e => setCriticality(e.target.value as Criticality)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="A">Classe A - Crítico (Parada interrompe a fábrica)</option>
                <option value="B">Classe B - Importante (Parada afeta a capacidade)</option>
                <option value="C">Classe C - Secundário (Baixo impacto operacional)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Status Operacional
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as AssetStatus)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="operacional">Operacional (Em funcionamento)</option>
                <option value="em_manutencao">Em Manutenção (Intervenção em curso)</option>
                <option value="parado">Parado / Inoperante</option>
                <option value="em_alerta">Em Alerta (Operando com anomalia)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Fabricante
              </label>
              <input
                type="text"
                value={manufacturer}
                onChange={e => setManufacturer(e.target.value)}
                placeholder="Ex: WEG, Atlas Copco, Siemens"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Modelo
              </label>
              <input
                type="text"
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="Ex: W22 Premium IE3"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Número de Série
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={e => setSerialNumber(e.target.value)}
                placeholder="Ex: SN-2023-8874"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Horímetro Acumulado (Horas)
              </label>
              <input
                type="number"
                min="0"
                value={operatingHours}
                onChange={e => setOperatingHours(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Observações Técnicas / Plano de Fundo
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Especificações de voltagem, capacidade nominal, histórico de instalação..."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 -mx-6 -mb-6 mt-6 bg-slate-50 flex items-center justify-between">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Excluir permanentemente o equipamento ${asset.tag}?`)) {
                    onDelete(asset.id);
                    onClose();
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Ativo</span>
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
                {isEditing ? 'Salvar Ativo' : 'Cadastrar Ativo'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
