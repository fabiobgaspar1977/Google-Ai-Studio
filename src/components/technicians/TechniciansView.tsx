import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Phone, 
  Mail, 
  Wrench, 
  DollarSign, 
  Edit3, 
  Trash2, 
  X,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Technician, WorkOrder } from '../../types';

interface TechniciansViewProps {
  technicians: Technician[];
  workOrders: WorkOrder[];
  onSaveTechnician: (tech: Technician) => void;
  onDeleteTechnician: (techId: string) => void;
}

export const TechniciansView: React.FC<TechniciansViewProps> = ({
  technicians,
  workOrders,
  onSaveTechnician,
  onDeleteTechnician
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeEditingTech, setActiveEditingTech] = useState<Technician | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState<Technician['role']>('Mecânico Industrial');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialtiesText, setSpecialtiesText] = useState('');
  const [hourlyRate, setHourlyRate] = useState(50.0);
  const [status, setStatus] = useState<Technician['status']>('disponivel');

  const handleOpenNew = () => {
    setActiveEditingTech(null);
    setName('');
    setRole('Mecânico Industrial');
    setEmail('');
    setPhone('');
    setSpecialtiesText('Mecânica Geral, Pneumática');
    setHourlyRate(45.0);
    setStatus('disponivel');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tech: Technician) => {
    setActiveEditingTech(tech);
    setName(tech.name);
    setRole(tech.role);
    setEmail(tech.email);
    setPhone(tech.phone);
    setSpecialtiesText(tech.specialties.join(', '));
    setHourlyRate(tech.hourlyRate);
    setStatus(tech.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const specialties = specialtiesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const updatedTech: Technician = {
      id: activeEditingTech?.id || `tec-${Date.now()}`,
      name: name.trim(),
      role,
      email: email.trim(),
      phone: phone.trim(),
      specialties,
      hourlyRate: Number(hourlyRate) || 40,
      status
    };

    onSaveTechnician(updatedTech);
    setIsModalOpen(false);
  };

  const getStatusBadge = (st: Technician['status']) => {
    switch (st) {
      case 'disponivel':
        return <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">Disponível</span>;
      case 'em_campo':
        return <span className="text-blue-700 bg-blue-50 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded">Em Campo</span>;
      case 'ausente':
        return <span className="text-slate-500 bg-slate-100 border border-slate-200 text-[10px] font-medium px-2 py-0.5 rounded">Ausente</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Ações */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Corpo Técnico & Especialistas</h2>
          <p className="text-xs text-slate-500">
            Escala, apontamento de homem-hora (H/H) e especialidades técnicas da manutenção
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Técnico</span>
        </button>
      </div>

      {/* Grid de Técnicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {technicians.map(tech => {
          const activeOrders = workOrders.filter(o => o.assignedTechnicianId === tech.id && (o.status === 'aberta' || o.status === 'em_andamento'));
          const completedOrders = workOrders.filter(o => o.assignedTechnicianId === tech.id && o.status === 'concluida');

          return (
            <div
              key={tech.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                      {tech.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{tech.name}</h3>
                      <p className="text-xs text-slate-500">{tech.role}</p>
                    </div>
                  </div>
                  {getStatusBadge(tech.status)}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tech.email || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tech.phone || 'Não informado'}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Custo Homem/Hora</span>
                    <span className="font-bold text-slate-900">R$ {tech.hourlyRate.toFixed(2)}/h</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">O.S. Atribuídas</span>
                    <span className={`font-bold ${activeOrders.length > 0 ? 'text-blue-600' : 'text-slate-700'}`}>
                      {activeOrders.length} ativas ({completedOrders.length} fechs.)
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                    Especialidades
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {tech.specialties.map((spec, i) => (
                      <span key={i} className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(tech)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Cadastro</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {activeEditingTech ? 'Editar Técnico' : 'Cadastrar Novo Técnico'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo de Oliveira"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Função / Cargo
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Mecânico Industrial">Mecânico Industrial</option>
                  <option value="Eletricista / Eletromecânico">Eletricista / Eletromecânico</option>
                  <option value="Técnico de Automação">Técnico de Automação</option>
                  <option value="Supervisor de Manutenção">Supervisor de Manutenção</option>
                  <option value="Lubrificador">Lubrificador</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tecnico@empresa.com"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Telefone / Ramal
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Valor Hora (R$/h)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="10"
                    value={hourlyRate}
                    onChange={e => setHourlyRate(parseFloat(e.target.value) || 40)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="disponivel">Disponível</option>
                    <option value="em_campo">Em Campo</option>
                    <option value="ausente">Ausente / Férias</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Especialidades (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={specialtiesText}
                  onChange={e => setSpecialtiesText(e.target.value)}
                  placeholder="Ex: Bombas, Alinhamento Laser, Inversores"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                {activeEditingTech ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Excluir técnico ${activeEditingTech.name}?`)) {
                        onDeleteTechnician(activeEditingTech.id);
                        setIsModalOpen(false);
                      }
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                  >
                    Excluir
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
