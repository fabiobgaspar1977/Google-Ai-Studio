import React from 'react';
import { WorkOrder, Asset, Technician } from '../../types';

interface PrintableWorkOrderProps {
  order: WorkOrder;
  asset?: Asset;
  technician?: Technician;
}

export const PrintableWorkOrder: React.FC<PrintableWorkOrderProps> = ({
  order,
  asset,
  technician
}) => {
  return (
    <div className="print-only hidden p-8 bg-white text-black font-sans max-w-4xl mx-auto">
      {/* Cabeçalho da OS */}
      <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">Ordem de Serviço de Manutenção</h1>
          <p className="text-sm font-semibold text-gray-700">Mantix CMMS · Controle Operacional de Manutenção</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-mono font-bold">{order.code}</div>
          <div className="text-xs text-gray-600">
            Emissão: {new Date(order.createdAt).toLocaleDateString('pt-BR')}
          </div>
          <div className="text-xs font-bold uppercase mt-1">
            Prioridade: {order.priority} · Tipo: {order.type}
          </div>
        </div>
      </div>

      {/* Dados do Equipamento */}
      <div className="grid grid-cols-2 gap-4 border border-black p-3 mb-4 text-xs">
        <div>
          <p><strong>Equipamento:</strong> {asset?.name || 'Não identificado'}</p>
          <p><strong>Tag / Identificador:</strong> {asset?.tag || 'S/TAG'}</p>
          <p><strong>Setor / Localização:</strong> {asset?.sector || 'Geral'}</p>
        </div>
        <div>
          <p><strong>Fabricante / Modelo:</strong> {asset?.manufacturer} {asset?.model}</p>
          <p><strong>Número de Série:</strong> {asset?.serialNumber}</p>
          <p><strong>Horímetro Registrado:</strong> {asset?.operatingHours} horas</p>
        </div>
      </div>

      {/* Descrição do Chamado */}
      <div className="border border-black p-3 mb-4 text-xs">
        <h3 className="font-bold uppercase mb-1">Título & Escopo do Serviço:</h3>
        <p className="text-sm font-semibold mb-2">{order.title}</p>
        <p className="whitespace-pre-line text-gray-800">{order.description || 'Nenhuma descrição complementar.'}</p>
      </div>

      {/* Checklist de Tarefas */}
      {order.checklist && order.checklist.length > 0 && (
        <div className="border border-black p-3 mb-4 text-xs">
          <h3 className="font-bold uppercase mb-2">Checklist de Procedimentos & Segurança:</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-400">
                <th className="w-8">Status</th>
                <th>Descrição do Procedimento</th>
                <th className="w-24 text-right">Data/Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.checklist.map((c) => (
                <tr key={c.id}>
                  <td className="py-1">
                    <span className="inline-block w-4 h-4 border border-black text-center text-[10px] font-bold">
                      {c.completed ? 'X' : ''}
                    </span>
                  </td>
                  <td className="py-1">{c.text}</td>
                  <td className="py-1 text-right text-[10px]">
                    {c.completedAt ? new Date(c.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Peças e Materiais */}
      {order.partsUsed && order.partsUsed.length > 0 && (
        <div className="border border-black p-3 mb-4 text-xs">
          <h3 className="font-bold uppercase mb-2">Peças e Materiais Aplicados:</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-400">
                <th>Item / Descrição</th>
                <th className="w-16 text-center">Qtd</th>
                <th className="w-24 text-right">Valor Unit.</th>
                <th className="w-24 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.partsUsed.map((p) => (
                <tr key={p.partId}>
                  <td className="py-1">{p.partName}</td>
                  <td className="py-1 text-center">{p.quantity}</td>
                  <td className="py-1 text-right">R$ {p.unitCost.toFixed(2)}</td>
                  <td className="py-1 text-right font-bold">R$ {p.totalCost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Diagnóstico e Causa Raiz */}
      <div className="border border-black p-3 mb-6 text-xs">
        <p className="mb-2"><strong>Diagnóstico da Causa Raiz:</strong> {order.failureCause || '_________________________________________________________________'}</p>
        <p><strong>Ação Corretiva Realizada:</strong> {order.resolutionNotes || '_________________________________________________________________'}</p>
      </div>

      {/* Assinaturas */}
      <div className="grid grid-cols-2 gap-12 mt-12 pt-6 text-xs text-center border-t border-gray-300">
        <div>
          <div className="border-b border-black mb-1 pb-4"></div>
          <p className="font-bold">{technician?.name || 'Técnico Responsável'}</p>
          <p className="text-gray-600">{technician?.role || 'Executante'}</p>
        </div>
        <div>
          <div className="border-b border-black mb-1 pb-4"></div>
          <p className="font-bold">Supervisor / Líder de Produção</p>
          <p className="text-gray-600">Visto de Liberação do Equipamento</p>
        </div>
      </div>
    </div>
  );
};
