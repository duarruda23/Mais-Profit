import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Loader2, ShieldCheck, Key, LogIn } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const NewClientModal: React.FC<NewClientModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newSource, setNewSource] = useState<'omie' | 'conta_azul' | 'nibo' | 'excel'>('omie');
  
  // Credential States
  const [omieKey, setOmieKey] = useState('');
  const [omieSecret, setOmieSecret] = useState('');
  const [caClientId, setCaClientId] = useState('');
  const [caClientSecret, setCaClientSecret] = useState('');
  const [niboToken, setNiboToken] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NIBO_AUTH_SUCCESS') {
        setNiboToken(event.data.code);
        setIsAuthenticating(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleNiboConnect = async () => {
    setIsAuthenticating(true);
    try {
      const response = await fetch('/api/auth/nibo/url');
      if (!response.ok) throw new Error('Falha ao obter URL de autenticação');
      const { url } = await response.json();
      
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      window.open(url, 'nibo_auth', `width=${width},height=${height},left=${left},top=${top}`);
    } catch (error) {
      console.error('Erro Nibo:', error);
      setIsAuthenticating(false);
      alert('Certifique-se de configurar as chaves da API do Nibo nas configurações.');
    }
  };

  const resetForm = () => {
    setNewName('');
    setNewCompany('');
    setNewSource('omie');
    setOmieKey('');
    setOmieSecret('');
    setCaClientId('');
    setCaClientSecret('');
    setNiboToken('');
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCompany || isCreating) return;

    setIsCreating(true);
    try {
      const payload: any = {
        name: newName,
        company: newCompany,
        dataSource: newSource,
        status: 'Ativo',
        shared: false,
        views: 0,
        lastAccess: 'Nunca',
        createdAt: serverTimestamp()
      };

      if (newSource === 'omie') {
        payload.omieCreds = { appKey: omieKey, appSecret: omieSecret };
      } else if (newSource === 'conta_azul') {
        payload.contaAzulCreds = { clientId: caClientId, clientSecret: caClientSecret };
      } else if (newSource === 'nibo') {
        payload.niboCreds = { apiToken: niboToken };
      }

      await addDoc(collection(db, 'clients'), payload);
      resetForm();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating client:", error);
      alert("Erro ao criar cliente. Verifique o console.");
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
      >
        <div className="bg-[#0F172A] px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold tracking-tight text-[15px] uppercase tracking-widest">Cadastrar Novo Cliente</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Plus size={20} className="rotate-45" />
          </button>
        </div>

        <form onSubmit={handleCreateClient} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase px-1 tracking-wider">Nome do Dashboard / Projeto</label>
            <input 
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Gestão Financeira 2026"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase px-1 tracking-wider">Razão Social / Empresa</label>
            <input 
              type="text" 
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              placeholder="Ex: Minha Empresa LTDA"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium italic"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase px-1 tracking-wider">Fonte de Dados</label>
            <select 
              value={newSource}
              onChange={(e) => setNewSource(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700"
            >
              <option value="omie">Omie (API)</option>
              <option value="conta_azul">Conta Azul (App)</option>
              <option value="nibo">Nibo (Token)</option>
              <option value="excel">Arquivo Excel / CSV</option>
            </select>
          </div>

          {/* Dynamic Credentials Fields */}
          {newSource === 'omie' && (
            <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-orange-700 uppercase tracking-tight px-1">App Key</label>
                <input 
                  type="text" 
                  value={omieKey}
                  onChange={(e) => setOmieKey(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-xs focus:outline-none font-mono"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-orange-700 uppercase tracking-tight px-1">App Secret</label>
                <input 
                  type="password" 
                  value={omieSecret}
                  onChange={(e) => setOmieSecret(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-xs focus:outline-none font-mono"
                  required
                />
              </div>
            </div>
          )}

          {newSource === 'conta_azul' && (
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-blue-700 uppercase tracking-tight px-1">Client ID</label>
                <input 
                  type="text" 
                  value={caClientId}
                  onChange={(e) => setCaClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-xs focus:outline-none font-mono"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-blue-700 uppercase tracking-tight px-1">Client Secret</label>
                <input 
                  type="password" 
                  value={caClientSecret}
                  onChange={(e) => setCaClientSecret(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-xs focus:outline-none font-mono"
                  required
                />
              </div>
            </div>
          )}

          {newSource === 'nibo' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <LogIn size={16} />
                    <span className="text-[12px] font-bold uppercase tracking-tight">Como conseguir o Token?</span>
                  </div>
                  <ul className="text-[10px] text-emerald-700/80 space-y-1 ml-1 font-medium">
                    <li className="flex gap-2"><span>1.</span> <span>Acesse o <b>Nibo</b> do cliente e clique no nome da empresa.</span></li>
                    <li className="flex gap-2"><span>2.</span> <span>Vá em <b>Configurações</b> &gt; aba <b>API</b>.</span></li>
                    <li className="flex gap-2"><span>3.</span> <span>Copie o código <b>apitoken</b> e cole abaixo:</span></li>
                  </ul>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-emerald-100">
                  <label className="text-[10px] font-bold text-emerald-700 uppercase px-1">API Token (apitoken)</label>
                  <div className="relative">
                    <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                    <input 
                      type="password" 
                      value={niboToken}
                      onChange={(e) => setNiboToken(e.target.value)}
                      placeholder="Ex: 58524AE2..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                    />
                  </div>
                </div>

                {niboToken && (
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-600 font-bold bg-white px-3 py-1.5 rounded-full border border-emerald-100">
                    <ShieldCheck size={12} />
                    Token Configurado ✅
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-[12px] uppercase tracking-wider hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isCreating}
              className="flex-1 py-3 bg-[#0F172A] text-white rounded-xl font-bold text-[12px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isCreating ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              {isCreating ? 'PROCESSANDO...' : 'CADASTRAR CLIENTE'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default NewClientModal;
