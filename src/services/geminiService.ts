/**
 * Serviço de Inteligência Artificial para Diagnóstico e Planos de Manutenção
 * Utiliza o SDK @google/genai com fallback automático de base técnica de engenharia.
 */

import { GoogleGenAI } from '@google/genai';

export interface AIDiagnosisResult {
  assetName: string;
  symptoms: string;
  probableCauses: Array<{
    cause: string;
    probability: 'Alta' | 'Média' | 'Baixa';
    explanation: string;
  }>;
  recommendedSteps: string[];
  safetyPrecautions: string[];
  suggestedParts: string[];
  estimatedHours: number;
  priorityRecommendation: 'baixa' | 'media' | 'alta' | 'urgente';
}

export interface AIPartForecastResult {
  partName: string;
  recommendedStock: number;
  criticalityReason: string;
}

// Fallback industrial inteligente caso a chave não esteja configurada ou ocorra erro
const KNOWLEDGE_FALLBACK: Record<string, AIDiagnosisResult> = {
  vibracao: {
    assetName: 'Equipamento Rotativo',
    symptoms: 'Vibração excessiva ou ruído de rolamento',
    probableCauses: [
      { cause: 'Desalinhamento entre eixos motor/carga', probability: 'Alta', explanation: 'Vibração típica em 1X e 2X RPM com sobrecarga axial.' },
      { cause: 'Falha ou desgaste na pista externa de rolamento', probability: 'Alta', explanation: 'Picos em alta frequência (BPFO/demodulação de sinal).' },
      { cause: 'Desbalanceamento estático ou dinâmico do rotor/polia', probability: 'Média', explanation: 'Forte componente radial em 1X RPM.' },
      { cause: 'Folga mecânica estrutural ou base solta', probability: 'Baixa', explanation: 'Geração de múltiplos harmônicos de rotação.' }
    ],
    recommendedSteps: [
      'Executar bloqueio elétrico e teste de energia zero (LOTO)',
      'Medir espectro de vibração com acelerômetro nos pontos mancais H/V/A',
      'Verificar aperto dos parafusos de fixação da base (torque especificado)',
      'Aferir alinhamento a laser dos eixos e checar pé-manco',
      'Inspecionar estado do acoplamento flexível e lubrificação'
    ],
    safetyPrecautions: [
      'Bloqueio com cadeado e etiqueta (LOTO NR-10 e NR-12)',
      'Aguardar parada total do rotor antes de tocar em partes mecânicas',
      'Uso obrigatório de óculos de proteção, protetor auricular e luvas nitrílicas'
    ],
    suggestedParts: ['Rolamento de reposição compatível', 'Elemento elástico de acoplamento', 'Graxa industrial de lítio NLGI 2'],
    estimatedHours: 3.5,
    priorityRecommendation: 'alta'
  },
  aquecimento: {
    assetName: 'Motor / Compressor / Sistema Elétrico',
    symptoms: 'Aquecimento anormal ou desarme térmico frequente',
    probableCauses: [
      { cause: 'Sobrecarga mecânica ou atrito interno excessivo', probability: 'Alta', explanation: 'Demanda de corrente acima da nominal (In).' },
      { cause: 'Deficiência de ventilação / aletas de refrigeração obstruídas', probability: 'Alta', explanation: 'Incômodo térmico devido a acúmulo de pó/sujeira.' },
      { cause: 'Desbalanceamento de tensão entre fases elétricas (>2%)', probability: 'Média', explanation: 'Provoca aquecimento severo nos enrolamentos do estator.' },
      { cause: 'Lubrificante degradado ou em excesso no mancal', probability: 'Média', explanation: 'Excesso de graxa eleva o atrito fluido e gera aquecimento.' }
    ],
    recommendedSteps: [
      'Realizar termografia infravermelha identificando o ponto focal mais quente',
      'Medir corrente trifásica com alicate amperímetro e comparar com placa',
      'Limpar defletor e aletas de refrigeração com ar comprimido seco',
      'Medir resistência de isolamento dos enrolamentos com Megôhmetro (500Vcc)',
      'Verificar o histórico de lubrificação e temperatura do óleo'
    ],
    safetyPrecautions: [
      'Cuidado com superfícies aquecidas acima de 70°C (risco de queimadura)',
      'EPI elétrico para medição sob tensão (luva de isolação e capacete)',
      'Nunca desarmar travas térmicas sem antes identificar a causa raiz'
    ],
    suggestedParts: ['Relé térmico bimetálico', 'Filtro de ar de resfriamento', 'Graxa para altas temperaturas sintética'],
    estimatedHours: 2.5,
    priorityRecommendation: 'urgente'
  }
};

export async function analyzeMaintenanceDiagnostic(
  assetName: string,
  category: string,
  symptoms: string,
  operatingHours?: number
): Promise<AIDiagnosisResult> {
  // Tentar via Gemini se a chave de ambiente estiver acessível
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || '';

  if (apiKey) {
    try {
      const ai = new GoogleGenAI();
      const prompt = `Você é um engenheiro sênior especialista em Manutenção Industrial, RCM (Reliability Centered Maintenance) e Confiabilidade.
Analise a falha ou sintoma relatado para o seguinte equipamento:
- Equipamento / Ativo: "${assetName}" (${category})
- Sintomas relatados: "${symptoms}"
- Horímetro atual: ${operatingHours || 'Não informado'} horas

Retorne ESTRITAMENTE um objeto JSON válido (sem tags markdown de código e sem texto adicional) com a seguinte estrutura:
{
  "assetName": "${assetName}",
  "symptoms": "${symptoms}",
  "probableCauses": [
    { "cause": "Nome da causa provável", "probability": "Alta" | "Média" | "Baixa", "explanation": "Breve justificativa técnica" }
  ],
  "recommendedSteps": [
    "Passo 1 de investigação ou reparo",
    "Passo 2...",
    "Passo 3..."
  ],
  "safetyPrecautions": [
    "Medida de segurança e EPI necessário (NR-10, NR-12, LOTO...)"
  ],
  "suggestedParts": [
    "Peça ou insumo recomendado para verificação ou troca"
  ],
  "estimatedHours": 3.0,
  "priorityRecommendation": "baixa" | "media" | "alta" | "urgente"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      const responseText = response.text?.trim() || '';
      if (responseText) {
        const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleanJson) as AIDiagnosisResult;
        return parsed;
      }
    } catch (err) {
      console.warn('Gemini API indisponível ou erro na chamada, aplicando heurística industrial avançada:', err);
    }
  }

  // Fallback heurístico inteligente baseado nos termos informados
  const lower = (symptoms + ' ' + assetName).toLowerCase();
  let baseTemplate: AIDiagnosisResult;

  if (lower.includes('calor') || lower.includes('quente') || lower.includes('aquece') || lower.includes('desarme') || lower.includes('temperatura')) {
    baseTemplate = KNOWLEDGE_FALLBACK.aquecimento;
  } else {
    baseTemplate = KNOWLEDGE_FALLBACK.vibracao;
  }

  return {
    assetName,
    symptoms,
    probableCauses: baseTemplate.probableCauses,
    recommendedSteps: [
      `Inspecionar visualmente o equipamento ${assetName} buscando sinais anormais`,
      ...baseTemplate.recommendedSteps
    ],
    safetyPrecautions: baseTemplate.safetyPrecautions,
    suggestedParts: baseTemplate.suggestedParts,
    estimatedHours: baseTemplate.estimatedHours,
    priorityRecommendation: lower.includes('parou') || lower.includes('urgente') || lower.includes('fumaça') ? 'urgente' : baseTemplate.priorityRecommendation
  };
}

export async function generatePreventiveChecklist(
  equipmentName: string,
  category: string,
  frequency: string
): Promise<string[]> {
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || '';

  if (apiKey) {
    try {
      const ai = new GoogleGenAI();
      const prompt = `Gere uma lista de 5 a 6 tarefas técnicas de inspeção preventiva para:
Equipamento: ${equipmentName} (${category})
Periodicidade: ${frequency}

Retorne ESTRITAMENTE um array JSON de strings, sem formatação markdown:
["Tarefa 1", "Tarefa 2", ...]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const text = response.text?.trim() || '';
      if (text) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao gerar checklist via Gemini, usando gerador padrão:', e);
    }
  }

  // Heurística padrão por categoria
  return [
    `Inspeção visual e limpeza geral de componentes externos de ${equipmentName}`,
    'Verificação de torque de parafusos estruturais e elementos de fixação',
    'Conferência de níveis de lubrificantes, fluidos e ausência de vazamentos',
    'Aferição de temperatura de trabalho e níveis de ruído com o equipamento em regime',
    'Checagem do funcionamento dos dispositivos de segurança e parada de emergência',
    'Registro de leitura do horímetro e assinatura do cartão de preventiva'
  ];
}
