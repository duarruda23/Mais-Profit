import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Plus, 
  Search, 
  MoreVertical, 
  Mail, 
  Building2, 
  Calendar,
  ExternalLink,
  Loader2,
  Trash2,
  UserPlus
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import NewClientModal from '../components/NewClientModal';

interface Client {
  id: string;
  name: string;
  company: string;
  dataSource: string;
  createdAt?: any;
}

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'clients'), orderBy('name', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Client[];
      setClients(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${name}"? Esta ação não pode ser desfeita.`)) {
      try {
        await deleteDoc(doc(db, 'clients', id));
      } catch (error) {
        console.error("Error deleting client:", error);
      }
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#38BDF8] mb-4" size={32} />
        <p className="text-slate-400 font-medium">Carregando lista de clientes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Gestão de Clientes</h1>
          <p className="text-slate-500 text-[13px] mt-1">Visualize e gerencie as empresas atendidas pela Profit BPO</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="hd-btn-secondary bg-[#0F172A] text-white border-transparent hover:bg-slate-800"
        >
          <UserPlus size={16} className="mr-2" /> Adicionar Novo Cliente
        </button>
      </div>

      <NewClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou empresa..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 text-slate-500 text-[12px] font-bold">
            <UsersIcon size={14} />
            Total: {clients.length} Clientes Ativos
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Empresa / Dashboard</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Razão Social</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Integração</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.map((client) => (
                <tr key={client.id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                        {client.company.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-slate-800">{client.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium">ID: {client.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400" />
                      <span className="text-[13px] font-semibold text-slate-600 uppercase italic">{client.company}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                      client.dataSource === 'omie' && "bg-orange-50 text-orange-600 border border-orange-100",
                      client.dataSource === 'conta_azul' && "bg-blue-50 text-blue-600 border border-blue-100",
                      client.dataSource === 'nibo' && "bg-emerald-50 text-emerald-600 border border-emerald-100",
                      client.dataSource === 'excel' && "bg-slate-100 text-slate-600 border border-slate-200"
                    )}>
                      {client.dataSource}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors border border-transparent hover:border-blue-100">
                        <ExternalLink size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(client.id, client.name)}
                        className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <p className="text-slate-400 font-medium">Nenhum cliente encontrado para sua pesquisa.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;
