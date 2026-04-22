import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import ClientDashboard from './pages/ClientDashboard';
import UploadPage from './pages/UploadPage';
import SyncPage from './pages/SyncPage';
import ProjectsOverview from './pages/ProjectsOverview';
import ClientsPage from './pages/ClientsPage';
import ReportsPage from './pages/ReportsPage';
import { Loader2, Users, BarChart3 } from 'lucide-react';

import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';

const AppContent: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currentClientName, setCurrentClientName] = useState<string>('');

  React.useEffect(() => {
    if (!selectedProjectId) {
      setCurrentClientName('');
      return;
    }
    const unsub = onSnapshot(doc(db, 'clients', selectedProjectId), (doc) => {
      if (doc.exists()) {
        setCurrentClientName(doc.data().name);
      }
    });
    return () => unsub();
  }, [selectedProjectId]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#38BDF8] mb-4" size={48} />
        <p className="text-slate-400 font-medium animate-pulse">Carregando Profit BPO...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'dashboard') setSelectedProjectId(null);
        }} 
      />
      
      <main className="flex-1 ml-[220px] overflow-y-auto h-screen flex flex-col no-scrollbar">
        <header className="h-[60px] bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            {selectedProjectId ? (
              <>
                <button 
                  onClick={() => setSelectedProjectId(null)}
                  className="p-1.5 hover:bg-slate-50 rounded-md text-slate-400 transition-colors"
                >
                  <Users size={16} />
                </button>
                <div className="h-6 w-px bg-slate-200 h-4 mx-1"></div>
                <div className="bg-[#F1F5F9] px-3 py-1.5 rounded-full border border-[#CBD5E1] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span>
                  <span className="text-[12px] font-bold text-slate-800 uppercase">
                    {currentClientName || 'Projeto Selecionado'} • ID {selectedProjectId.padStart(4, '0')}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <BarChart3 className="text-[#38BDF8]" size={20} />
                <span className="text-[14px] font-bold text-slate-800 uppercase tracking-tight">Visão Geral dos Projetos</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {selectedProjectId && (
              <div className="hidden md:flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-md">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">Sync Omie: Hoje 08:34</span>
              </div>
            )}
            
            <div className="w-8 h-8 rounded-full bg-[#CBD5E1] border border-slate-300 flex items-center justify-center font-bold text-[12px] text-slate-600">
              {profile?.name?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
          </div>
        </header>

        <div className="p-5 flex-1 overflow-y-auto no-scrollbar">
          {activeTab === 'dashboard' && (
            selectedProjectId ? <ClientDashboard clientId={selectedProjectId} /> : <ProjectsOverview onSelectProject={setSelectedProjectId} />
          )}
          {activeTab === 'clients' && <ClientsPage />}
          {activeTab === 'reports' && <ReportsPage />}
          {activeTab === 'upload' && <UploadPage />}
          {activeTab === 'sync' && <SyncPage clientId={selectedProjectId} />}
          
          {!['dashboard', 'upload', 'sync', 'clients', 'reports'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] opacity-50 px-8 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 text-slate-300">
                <Loader2 size={40} />
              </div>
              <p className="text-xl font-bold text-slate-400 tracking-tight">Página em desenvolvimento</p>
              <p className="text-sm text-slate-400 mt-2 max-w-sm">
                Esta funcionalidade está em fila para implementação pela equipe Profit BPO.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
