import React, { useState } from 'react';
import { 
  Sparkles, 
  Wrench, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Cpu,
  Layers,
  ListOrdered
} from 'lucide-react';
import { Asset, WorkOrder, WorkOrderChecklistItem } from '../../types';
import { analyzeMaintenanceDiagnostic, generatePreventiveChecklist, AIDiagnosisResult } from '../../services/geminiService';

interface AiDiagnosticViewProps {
  assets: Asset[];
  onCreateOrderFromAI: (draft: Partial<WorkOrder>) => void;
}

export const AiDiagnosticView: React.FC<AiDiagnosticViewProps> = ({
  assets,
  onCreateOrderFromAI
}) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [customAssetName, setCustomAssetName] = useState('');
  const [symptoms, setSymptoms] = useState('Ruído estridente em alta rotação, vibração axial perceptível no mancal e elevação térmica para 78°C');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIDiagnosisResult | null>(null);

  // Tab: Diagnóstico de Falha vs Gerador de Checklist Preventivo
  const [activeTab, setActiveTab] = useState<'diagnostico' | 'checklist'>('diagnostico');
  const [preventiveCategory, setPreventiveCategory] = useState('Compressores de Parafuso');
  const [preventiveFrequency, setPreventiveFrequency] = useState('Mensal');
  const [generatedChecklist, setGeneratedChecklist] = useState<string[] | null>(null);

  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const assetNameUsed = selectedAsset ? `[${selectedAsset.tag}] ${selectedAsset.name}` : (customAssetName || 'Equipamento Geral');

  const handleRunDiagnostic = async () => {
    if (!symptoms.trim()) {
      alert('Por favor descreva os sintomas ou anomalias do equipamento.');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const res = await analyzeMaintenanceDiagnostic(
        assetNameUsed,
        selectedAsset?.category || 'Geral',
        symptoms,
        selectedAsset?.operatingHours
      );
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateChecklist = async () => {
    setIsLoading(true);
    setGeneratedChecklist(null);
    try {
      const list = await generatePreventiveChecklist(
        assetNameUsed,
        preventiveCategory,
        preventiveFrequency
      );
      setGeneratedChecklist(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertDiagnosisToOrder = () => {
    if (!result) return;

    const checklistItems: WorkOrderChecklistItem[] = result.recommendedSteps.map((step, idx) => ({
      id: `ck-ai-${idx}-${Date.now()}`,
      text: step,
      completed: false
    }));

    onCreateOrderFromAI({
      assetId: selectedAsset?.id || (assets[0]?.id ?? ''),
      title: `Diagnóstico IA: ${result.symptoms.slice(0, 60)}...`,
      description: `Investigação baseada em análise de engenharia:\nSintomas: ${result.symptoms}\n\nCausas Prováveis:\n${result.probableCauses.map(c => `• [${c.probability}] ${c.cause}: ${c.explanation}`).join('\n')}\n\nPrecauções de Segurança: ${result.safetyPrecautions.join('; ')}`,
      type: 'corretiva',
      priority: result.priorityRecommendation || 'alta',
      estimatedHours: result.estimatedHours || 3.0,
      checklist: checklistItems,
      failureCause: result.probableCauses[0]?.cause || undefined
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner Explicativo */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">Assistente Técnico Industrial</span>
            </div>
            <h2 className="text-xl font-bold">Diagnóstico Preditivo & Resolução com IA</h2>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
              Analise falhas mecânicas, elétricas e térmicas com base em normas de confiabilidade (RCM e FMEA). Gere checklists passo a passo e transforme a análise diretamente em Ordem de Serviço com 1 clique.
            </p>
          </div>

          <div className="flex items-center bg-white/10 p-1 rounded-lg border border-white/20 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('diagnostico')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'diagnostico' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Diagnóstico de Sintomas
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'checklist' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Gerador de Roteiro
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Aba 1: Diagnóstico de Falha */}
      {activeTab === 'diagnostico' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formulário de Sintomas */}
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>Dados da Anomalia do Equipamento</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Selecione o Ativo Cadastrado
              </label>
              <select
                value={selectedAssetId}
                onChange={e => setSelectedAssetId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
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
                Descrição dos Sintomas, Sons, Vibração ou Códigos de Erro *
              </label>
              <textarea
                rows={4}
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                placeholder="Ex: Motor trifásico desarmando por relé térmico após 20 minutos de carga plena. Temperatura carcaça em 85°C..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Quanto mais específico (temperatura, frequência do ruído, pressão), mais preciso o diagnóstico.
              </span>
            </div>

            <button
              onClick={handleRunDiagnostic}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold py-2.5 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processando Análise Técnica...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Analisar Falha & Gerar Recomendações</span>
                </>
              )}
            </button>
          </div>

          {/* Resultado do Diagnóstico */}
          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[420px] flex flex-col justify-between">
            {!result ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                <Wrench className="w-12 h-12 text-slate-300 stroke-1" />
                <div className="max-w-sm">
                  <h4 className="text-sm font-semibold text-slate-700">Aguardando Parâmetros</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Preencha os sintomas do equipamento à esquerda e execute a análise técnica para receber causas prováveis, checklist de segurança e peças sugeridas.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Resultado da Análise</span>
                    <h3 className="text-base font-bold text-slate-900">{result.assetName}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Prioridade sugerida:</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded uppercase bg-rose-50 text-rose-700 border border-rose-200">
                      {result.priorityRecommendation}
                    </span>
                  </div>
                </div>

                {/* Causas Prováveis */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
                    Causas Raiz Mais Prováveis (FMEA)
                  </h4>
                  <div className="space-y-2">
                    {result.probableCauses.map((pc, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{pc.cause}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            pc.probability === 'Alta' ? 'bg-rose-100 text-rose-800' : pc.probability === 'Média' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            Probabilidade {pc.probability}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{pc.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Roteiro Técnico Recomendado */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
                    Roteiro de Investigação & Manutenção
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {result.recommendedSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-50/70 p-2 rounded border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Precauções de Segurança */}
                <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Precauções de Segurança & Normas NR-10 / NR-12</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                    {result.safetyPrecautions.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>

                {/* Ação: Transformar em Ordem de Serviço */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Tempo estimado: <strong>{result.estimatedHours} horas</strong>
                  </span>

                  <button
                    onClick={handleConvertDiagnosisToOrder}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors"
                  >
                    <span>Criar Ordem de Serviço com esta Análise</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conteúdo Aba 2: Gerador de Checklist Preventivo */}
      {activeTab === 'checklist' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-blue-600" />
            <span>Gerador Automático de Roteiro Preventivo</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tipo / Família do Equipamento
              </label>
              <input
                type="text"
                value={preventiveCategory}
                onChange={e => setPreventiveCategory(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Frequência da Preventiva
              </label>
              <select
                value={preventiveFrequency}
                onChange={e => setPreventiveFrequency(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="Semanal">Semanal</option>
                <option value="Quinzenal">Quinzenal</option>
                <option value="Mensal">Mensal</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateChecklist}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold py-2 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? 'Gerando Roteiro com IA...' : 'Gerar Roteiro de Inspeção Técnica'}
          </button>

          {generatedChecklist && (
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-700">Tarefas Técnicas Sugeridas:</h4>
              <ul className="space-y-1.5 text-xs text-slate-800">
                {generatedChecklist.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
