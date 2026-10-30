import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Trash2, 
  Edit3, 
  X,
  CheckCircle2
} from 'lucide-react';
import { SparePart } from '../../types';

interface InventoryViewProps {
  parts: SparePart[];
  onSavePart: (part: SparePart) => void;
  onAdjustStock: (partId: string, delta: number) => void;
  onDeletePart: (partId: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  parts,
  onSavePart,
  onAdjustStock,
  onDeletePart
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('todas');
  const [showOnlyCritical, setShowOnlyCritical] = useState<boolean>(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeEditingPart, setActiveEditingPart] = useState<SparePart | null>(null);

  // Form states
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SparePart['category']>('Rolamentos & Mancais');
  const [quantity, setQuantity] = useState(10);
  const [minQuantity, setMinQuantity] = useState(5);
  const [unit, setUnit] = useState<SparePart['unit']>('un');
  const [unitCost, setUnitCost] = useState(50.0);
  const [location, setLocation] = useState('');
  const [supplier, setSupplier] = useState('');

  const handleOpenNew = () => {
    setActiveEditingPart(null);
    setSku(`PRT-${Math.floor(1000 + Math.random() * 9000)}`);
    setName('');
    setCategory('Rolamentos & Mancais');
    setQuantity(10);
    setMinQuantity(5);
    setUnit('un');
    setUnitCost(50.0);
    setLocation('Prateleira A - Caixa 01');
    setSupplier('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (part: SparePart) => {
    setActiveEditingPart(part);
    setSku(part.sku);
    setName(part.name);
    setCategory(part.category);
    setQuantity(part.quantity);
    setMinQuantity(part.minQuantity);
    setUnit(part.unit);
    setUnitCost(part.unitCost);
    setLocation(part.location);
    setSupplier(part.supplier || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPart: SparePart = {
      id: activeEditingPart?.id || `prt-${Date.now()}`,
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category,
      quantity: Number(quantity) || 0,
      minQuantity: Number(minQuantity) || 0,
      unit,
      unitCost: Number(unitCost) || 0,
      location: location.trim() || 'Almoxarifado Geral',
      supplier: supplier.trim() || undefined
    };

    onSavePart(newPart);
    setIsModalOpen(false);
  };

  // Filtragem
  const filteredParts = parts.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.supplier && p.supplier.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCat = filterCategory === 'todas' || p.category === filterCategory;
    const matchCrit = !showOnlyCritical || p.quantity <= p.minQuantity;

    return matchSearch && matchCat && matchCrit;
  });

  // Métricas do Almoxarifado
  const totalStockValue = parts.reduce((acc, curr) => acc + (curr.quantity * curr.unitCost), 0);
  const criticalPartsCount = parts.filter(p => p.quantity <= p.minQuantity).length;

  return (
    <div className="space-y-6">
      {/* Resumo do Almoxarifado */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Itens Cadastrados</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{parts.length} itens</div>
            <span className="text-xs text-slate-400">Total de SKUs ativos</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Valor Total Imobilizado</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {totalStockValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <span className="text-xs text-slate-400">Patrimônio em peças sobressalentes</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-5 rounded-xl border shadow-sm flex items-center justify-between ${
          criticalPartsCount > 0 ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className={`text-xs font-semibold uppercase tracking-wider block ${criticalPartsCount > 0 ? 'text-rose-800' : 'text-slate-500'}`}>
              Abaixo do Estoque Mínimo
            </span>
            <div className={`text-2xl font-bold mt-1 ${criticalPartsCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
              {criticalPartsCount} itens
            </div>
            <span className={`text-xs ${criticalPartsCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
              {criticalPartsCount > 0 ? 'Requer pedido imediato de reposição' : 'Estoque seguro'}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${criticalPartsCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Controles de Busca e Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, SKU, fornecedor ou prateleira..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs"
          >
            <option value="todas">Todas as Categorias</option>
            <option value="Rolamentos & Mancais">Rolamentos & Mancais</option>
            <option value="Correias & Correntes">Correias & Correntes</option>
            <option value="Filtros & Vedações">Filtros & Vedações</option>
            <option value="Lubrificantes & Fluidos">Lubrificantes & Fluidos</option>
            <option value="Elétrica & Sensores">Elétrica & Sensores</option>
            <option value="Pneumática & Hidráulica">Pneumática & Hidráulica</option>
          </select>

          <button
            onClick={() => setShowOnlyCritical(!showOnlyCritical)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              showOnlyCritical 
                ? 'bg-rose-600 text-white border-rose-600' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Apenas Estoque Baixo
          </button>

          <button
            onClick={handleOpenNew}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Peça</span>
          </button>
        </div>
      </div>

      {/* Tabela de Peças */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">SKU / Peça</th>
                <th className="p-3.5">Categoria</th>
                <th className="p-3.5">Localização</th>
                <th className="p-3.5 text-center">Qtd Atual</th>
                <th className="p-3.5 text-center">Mínimo</th>
                <th className="p-3.5 text-right">Valor Unit.</th>
                <th className="p-3.5 text-right">Valor Total</th>
                <th className="p-3.5 text-center">Ajuste Rápido</th>
                <th className="p-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Nenhuma peça encontrada.
                  </td>
                </tr>
              ) : (
                filteredParts.map(part => {
                  const isLow = part.quantity <= part.minQuantity;
                  const totalItemValue = part.quantity * part.unitCost;

                  return (
                    <tr key={part.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-slate-600 block">{part.sku}</span>
                        <span className="font-semibold text-slate-900 block truncate max-w-xs">{part.name}</span>
                        {part.supplier && (
                          <span className="text-[11px] text-slate-400 block truncate">Fornecedor: {part.supplier}</span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {part.category}
                      </td>
                      <td className="p-3.5 text-slate-600 font-mono text-[11px]">
                        {part.location}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                          isLow ? 'text-rose-700 bg-rose-50 border border-rose-200' : 'text-slate-900'
                        }`}>
                          {part.quantity} {part.unit}
                        </span>
                      </td>
                      <td className="p-3.5 text-center text-slate-500">
                        {part.minQuantity} {part.unit}
                      </td>
                      <td className="p-3.5 text-right text-slate-700">
                        {part.unitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-900">
                        {totalItemValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-md border border-slate-200">
                          <button
                            type="button"
                            onClick={() => onAdjustStock(part.id, -1)}
                            className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors shadow-2xs"
                            title="Consumir 1 item (-1)"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => onAdjustStock(part.id, 1)}
                            className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors shadow-2xs"
                            title="Entrada de 1 item (+1)"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(part)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
                        >
                          <Edit3 className="w-3.5 h-3.5 inline" />
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

      {/* Modal de Criação / Edição de Peça */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {activeEditingPart ? 'Editar Peça Sobressalente' : 'Cadastrar Peça no Almoxarifado'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Código SKU / TAG
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Rolamentos & Mancais">Rolamentos & Mancais</option>
                    <option value="Correias & Correntes">Correias & Correntes</option>
                    <option value="Filtros & Vedações">Filtros & Vedações</option>
                    <option value="Lubrificantes & Fluidos">Lubrificantes & Fluidos</option>
                    <option value="Elétrica & Sensores">Elétrica & Sensores</option>
                    <option value="Pneumática & Hidráulica">Pneumática & Hidráulica</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nome / Descrição da Peça *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Rolamento Autocompensador 22216 EK"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Quantidade em Estoque
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Estoque Mínimo de Alerta
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minQuantity}
                    onChange={e => setMinQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Unidade de Medida
                  </label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="un">Unidade (un)</option>
                    <option value="litros">Litros (L)</option>
                    <option value="kg">Quilogramas (kg)</option>
                    <option value="metros">Metros (m)</option>
                    <option value="jogos">Jogos / Kits</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Custo Unitário (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={unitCost}
                    onChange={e => setUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Endereço / Prateleira
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Ex: Prateleira B - Gaveta 03"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Fornecedor Principal
                  </label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={e => setSupplier(e.target.value)}
                    placeholder="Ex: SKF, Gates, Parker"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                {activeEditingPart ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Excluir peça ${activeEditingPart.name}?`)) {
                        onDeletePart(activeEditingPart.id);
                        setIsModalOpen(false);
                      }
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
