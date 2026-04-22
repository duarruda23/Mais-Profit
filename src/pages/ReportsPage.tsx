import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Share2, 
  Clock, 
  ArrowUpRight,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

const ReportsPage: React.FC = () => {
  const [activeView, setActiveView] = useState<'all' | 'shared' | 'favorites'>('all');

  const stats = [
    { label: 'Relatórios Gerados', value: '42', icon: FileSpreadsheet, color: 'text-blue-600' },
    { label: 'Dashboards Ativos', value: '18', icon: BarChart3, color: 'text-indigo-600' },
    { label: 'Exportações (Mês)', value: '124', icon: Download, color: 'text-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Relatórios Financeiros</h1>
          <p className="text-slate-500 text-[13px] mt-1">Gere e exporte demonstrativos detalhados para seus clientes</p>
        </div>
        
        <div className="flex gap-2">
          <button className="hd-btn-secondary bg-[#0F172A] text-white border-transparent hover:bg-slate-800">
            <TrendingUp size={16} className="mr-2" /> Analisar Performance
          </button>
          <button className="hd-btn-secondary bg-white text-slate-700">
            <Download size={16} className="mr-2" /> Exportar Massa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="hd-card bg-white flex items-center gap-4">
            <div className={cn("p-4 rounded-xl bg-slate-50", s.color)}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="hd-label whitespace-nowrap">{s.label}</p>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
        {/* Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-slate-100 bg-slate-50/30">
          <button 
            onClick={() => setActiveView('all')}
            className={cn(
              "py-4 px-1 mr-8 text-[12px] font-bold uppercase tracking-wider transition-all border-b-2",
              activeView === 'all' ? "border-[#38BDF8] text-[#0F172A]" : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            Todos os Relatórios
          </button>
          <button 
            onClick={() => setActiveView('shared')}
            className={cn(
              "py-4 px-1 mr-8 text-[12px] font-bold uppercase tracking-wider transition-all border-b-2",
              activeView === 'shared' ? "border-[#38BDF8] text-[#0F172A]" : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            Compartilhados
          </button>
        </div>

        {/* Empty State / Coming Soon */}
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-300 rounded-3xl flex items-center justify-center mb-6">
            <FileText size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Central de Documentos</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-sm">
            Aqui você visualizará DREs, Balancetes e Fluxos de Caixa consolidados de todos os seus clientes em um só lugar.
          </p>
          
          <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-xl max-w-md flex gap-4 items-start text-left">
            <AlertTriangle className="text-amber-600 shrink-0" size={20} />
            <div>
              <p className="text-[12px] font-bold text-amber-900 uppercase tracking-tight">Em Processamento</p>
              <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                O módulo de geração PDF/Excel automático está sendo integrado com as APIs das fontes de dados para fornecer relatórios em tempo real.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
