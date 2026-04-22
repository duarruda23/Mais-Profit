import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { 
  ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp, 
  Calendar as CalendarIcon, Filter, Download, AlertCircle,
  BarChart3
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ClientDashboardProps {
  clientId: string;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ clientId }) => {
  const [period, setPeriod] = useState('month');
  const [clientData, setClientData] = useState<any>(null);

  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, 'clients', clientId), (doc) => {
      if (doc.exists()) {
        setClientData(doc.data());
      }
    });
    return () => unsub();
  }, [clientId]);

  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Saldo Disponível" value={0} icon={Wallet} />
        <MetricCard title="Receitas do Mês" value={0} icon={ArrowUpCircle} />
        <MetricCard title="Despesas do Mês" value={0} icon={ArrowDownCircle} />
        <MetricCard title="Resultado Líquido" value={0} icon={TrendingUp} variant="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Chart Card placeholder */}
          <div className="hd-card bg-white min-h-[300px] flex flex-col items-center justify-center opacity-50">
            <BarChart3 size={40} className="mb-4 text-slate-300" />
            <p className="font-bold text-slate-400">Sem dados de movimentação para este período</p>
          </div>

          {/* Table Card placeholder */}
          <div className="hd-card bg-white">
            <span className="hd-label block mb-4">Contas a Pagar/Receber Próximos 7 Dias</span>
            <div className="py-10 text-center text-slate-400 font-medium">
              Nenhum lançamento pendente
            </div>
          </div>
        </div>

        {/* Sidebar View Area placeholder */}
        <div className="space-y-4">
          <div className="hd-card bg-white flex flex-col min-h-[400px]">
            <span className="hd-label mb-4">DRE Simplificado</span>
            <div className="flex-1 flex items-center justify-center opacity-30">
              <BarChart3 size={24} />
            </div>
          </div>

          <div className="hd-card bg-emerald-50 border-emerald-100">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">Status</span>
            <p className="text-[12px] font-semibold text-emerald-700">Tudo em dia para este cliente</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
