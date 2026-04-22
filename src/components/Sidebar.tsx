import React from 'react';
import { LogOut, LayoutDashboard, Users, FileText, Settings, RefreshCw, Upload } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { profile } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'collaborator', 'client'] },
    { id: 'clients', label: 'Clientes', icon: Users, roles: ['admin'] },
    { id: 'sync', label: 'Sincronização', icon: RefreshCw, roles: ['admin', 'collaborator'] },
    { id: 'reports', label: 'Relatórios', icon: FileText, roles: ['admin', 'collaborator', 'client'] },
    { id: 'upload', label: 'Upload Excel', icon: Upload, roles: ['admin', 'collaborator'] },
    { id: 'settings', label: 'Configurações', icon: Settings, roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter(item => profile && item.roles.includes(profile.role));

  return (
    <aside className="w-[220px] bg-[#0F172A] text-[#F8FAFC] h-screen flex flex-col fixed left-0 top-0 border-r border-[#E2E8F0]">
      <div className="p-6 font-bold text-lg tracking-wider text-[#38BDF8]">
        PROFIT <span className="text-white">BPO</span>
      </div>

      <nav className="flex-1 mt-4">
        <p className="px-5 pb-2 text-[11px] uppercase opacity-40 font-bold tracking-widest">Menu Principal</p>
        <div className="space-y-0.5">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-3 transition-all text-[13px] opacity-70 hover:opacity-100 hover:bg-white/5",
                activeTab === item.id 
                  ? "opacity-100 bg-white/5 border-l-4 border-[#38BDF8] font-semibold" 
                  : "border-l-4 border-transparent"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="p-5 border-t border-white/10">
        <div className="mb-4">
          <p className="text-[11px] opacity-40 uppercase font-bold tracking-widest leading-none mb-2">Usuário</p>
          <p className="text-[13px] font-semibold truncate leading-tight">{profile?.name}</p>
          <p className="text-[10px] opacity-40 uppercase font-bold mt-0.5">{profile?.role}</p>
        </div>
        <button
          onClick={() => auth.signOut()}
          className="w-full flex items-center gap-3 py-2 text-[13px] opacity-70 hover:opacity-100 hover:text-rose-400 transition-all font-medium"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
