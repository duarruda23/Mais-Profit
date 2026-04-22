import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit3, 
  Share2, 
  Clock, 
  BarChart3,
  Plus,
  RefreshCw,
  FilePlus,
  FileUp,
  FileJson,
  Loader2,
  FolderOpen,
  ShieldCheck
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';
import NewClientModal from '../components/NewClientModal';

interface ClientProject {
  id: string;
  name: string;
  company: string;
  status: string;
  shared: boolean;
  views: number;
  lastAccess: string;
  dataSource: 'omie' | 'conta_azul' | 'nibo' | 'excel';
  createdAt?: any;
}

const ProjectsOverview: React.FC<{ onSelectProject: (id: string) => void }> = ({ onSelectProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'clients'), orderBy('name', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ClientProject[];
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#38BDF8] mb-4" size={32} />
        <p className="text-slate-400 font-medium tracking-tight">Buscando projetos...</p>
      </div>
    );
  }

  const SourceIcon = ({ source }: { source: string }) => {
    const sources = {
      omie: { label: 'Omie', color: 'bg-orange-500' },
      conta_azul: { label: 'Conta Azul', color: 'bg-blue-600' },
      nibo: { label: 'Nibo', color: 'bg-emerald-600' },
      excel: { label: 'Excel', color: 'bg-emerald-500' }
    };
    const config = sources[source as keyof typeof sources] || sources.excel;
    return (
      <span className={cn("text-[8px] font-bold text-white px-1.5 py-0.5 rounded uppercase tracking-tighter", config.color)}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Projetos Financeiros</h1>
          <p className="text-slate-500 text-[13px] mt-1">Gerencie todos os relatórios e dashboards dos seus clientes</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button className="hd-btn-secondary bg-[#0F172A] text-white border-transparent hover:bg-slate-800">
            <RefreshCw size={14} className="mr-2" /> Nova Sincronização
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="hd-btn-secondary bg-[#0F172A] text-white border-transparent hover:bg-slate-800 transition-transform active:scale-95"
          >
            <Plus size={14} className="mr-2" /> Novo Projeto
          </button>
          <button className="hd-btn-secondary bg-[#0F172A] text-white border-transparent hover:bg-slate-800">
            <FileJson size={14} className="mr-2" /> Novo Agrupamento
          </button>
          <button className="hd-btn-secondary bg-[#0F172A] text-white border-transparent hover:bg-slate-800">
            <FileUp size={14} className="mr-2" /> Exportação de PDF
          </button>
        </div>
      </div>

      {/* Tabs / Filters Row */}
      <div className="flex items-center gap-8 border-b border-slate-200 pb-0 pt-2 h-[40px]">
        <button className="px-4 border-b-2 border-[#38BDF8] pb-2 text-[12px] font-bold text-slate-800 flex items-center gap-2">
          <Clock size={14} /> Sincronizações (0)
        </button>
        <button className="px-4 pb-2 text-[12px] font-bold text-slate-400 flex items-center gap-2">
          <BarChart3 size={14} /> Relatórios ({projects.length})
        </button>
        <button className="px-4 pb-2 text-[12px] font-bold text-slate-400 flex items-center gap-2">
          <Users size={14} /> Agrupamento de relatórios (0)
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="hd-card bg-white flex items-center justify-between">
          <div>
            <p className="hd-label">Total de Projetos</p>
            <p className="text-2xl font-bold text-[#6366F1]">{projects.length}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-400 rounded-lg">
            <BarChart3 size={20} />
          </div>
        </div>
        <div className="hd-card bg-white flex items-center justify-between">
          <div>
            <p className="hd-label">Relatórios Compartilhados</p>
            <p className="text-2xl font-bold text-[#38BDF8]">{projects.filter(p => p.shared).length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-400 rounded-lg">
            <Share2 size={20} />
          </div>
        </div>
        <div className="hd-card bg-white flex items-center justify-between">
          <div>
            <p className="hd-label">Acessados Recentemente</p>
            <p className="text-2xl font-bold text-[#10B981]">0</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-400 rounded-lg">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="flex items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-slate-400" />
          <h2 className="text-lg font-bold text-slate-800">Meus Projetos</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Buscar projeto..."
              className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-md text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="hd-btn-secondary py-1.5 px-3 bg-white text-slate-600 flex items-center gap-2">
            Todos <MoreVertical size={12} />
          </button>
          <button className="hd-btn-secondary py-1.5 px-3 bg-white text-slate-600 flex items-center gap-2">
            Todos <MoreVertical size={12} />
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-slate-200 rounded-xl">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
            <FolderOpen size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">Nenhum projeto encontrado</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-xs text-center">
            Comece criando seu primeiro projeto financeiro para gerenciar os dados dos seus clientes.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-6 hd-btn-secondary bg-[#0F172A] text-white border-transparent px-6 py-2.5 transition-transform active:scale-95"
          >
            <Plus size={16} className="mr-2" /> Criar Primeiro Projeto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-8">
          {filteredProjects.map((project) => (
            <div key={project.id} className="hd-card bg-white group hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2 flex-1">
                  <h3 className="text-[14px] font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                    {project.name}
                  </h3>
                  <SourceIcon source={project.dataSource} />
                </div>
                <button className="text-slate-300 hover:text-slate-600 shrink-0">
                  <MoreVertical size={16} />
                </button>
              </div>
              <p className="text-[11px] text-slate-400 font-bold uppercase mb-4 line-clamp-1">{project.company}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-slate-50 text-slate-500 text-[10px] px-2 py-0.5 rounded font-bold uppercase border border-slate-100 italic">
                  {project.status || 'Ativo'}
                </span>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded font-bold uppercase border",
                  project.shared 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : "bg-amber-50 text-amber-600 border-amber-100"
                )}>
                  {project.shared ? 'Compartilhado' : 'Não Compartilhado'}
                </span>
              </div>

              <div className="space-y-1.5 mb-6 opacity-60">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                  <Clock size={12} /> 
                  Acesso em {project.lastAccess || 'Nunca'}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                  <Eye size={12} /> 
                  {project.views || 0} visualizações
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => onSelectProject(project.id)}
                  className="flex flex-col items-center justify-center p-2 rounded border border-blue-100 text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Eye size={14} />
                  <span className="text-[9px] font-bold mt-1 uppercase tracking-tighter">Visualizar</span>
                </button>
                <button className="flex flex-col items-center justify-center p-2 rounded border border-slate-100 text-slate-700 hover:bg-slate-50 transition-colors">
                  <Edit3 size={14} />
                  <span className="text-[9px] font-bold mt-1 uppercase tracking-tighter">Editar</span>
                </button>
                <button className="flex flex-col items-center justify-center p-2 rounded border border-emerald-100 text-emerald-600 hover:bg-emerald-50 transition-colors">
                  <Share2 size={14} />
                  <span className="text-[9px] font-bold mt-1 uppercase tracking-tighter">Partilhar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      <NewClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default ProjectsOverview;
