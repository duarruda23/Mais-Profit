import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck, Clock, Key, Settings2, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, onSnapshot, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';

interface SyncPageProps {
  clientId?: string | null;
}

const SyncPage: React.FC<SyncPageProps> = ({ clientId }) => {
  const [syncing, setSyncing] = useState<string | null>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [omieKey, setOmieKey] = useState('');
  const [omieSecret, setOmieSecret] = useState('');
  const [niboToken, setNiboToken] = useState('');
  const [caClientId, setCaClientId] = useState('');
  const [caClientSecret, setCaClientSecret] = useState('');
  const [saving, setSaving] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

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
      if (!response.ok) throw new Error('Falha ao obter URL');
      const { url } = await response.json();
      
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      window.open(url, 'nibo_auth', `width=${width},height=${height},left=${left},top=${top}`);
    } catch (error) {
      console.error('Nibo Auth Error:', error);
      setIsAuthenticating(false);
      alert('Certifique-se de configurar as chaves da API do Nibo nas configurações.');
    }
  };

  useEffect(() => {
    if (!clientId) return;

    const unsub = onSnapshot(doc(db, 'clients', clientId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setClientData(data);
        setOmieKey(data.omieCreds?.appKey || '');
        setOmieSecret(data.omieCreds?.appSecret || '');
        setNiboToken(data.niboCreds?.apiToken || '');
        setCaClientId(data.contaAzulCreds?.clientId || '');
        setCaClientSecret(data.contaAzulCreds?.clientSecret || '');
      }
    });

    // Also fetch logs for this client
    const fetchLogs = async () => {
      const q = query(
        collection(db, 'clients', clientId, 'sync_logs'), 
        orderBy('timestamp', 'desc'), 
        limit(10)
      );
      const snapshot = await getDocs(q);
      setLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchLogs();

    return () => unsub();
  }, [clientId]);

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !clientData) return;

    setSaving(true);
    try {
      const updates: any = {};
      
      if (clientData.dataSource === 'omie') {
        updates.omieCreds = { appKey: omieKey, appSecret: omieSecret };
      } else if (clientData.dataSource === 'conta_azul') {
        updates.contaAzulCreds = { clientId: caClientId, clientSecret: caClientSecret };
      } else if (clientData.dataSource === 'nibo') {
        updates.niboCreds = { apiToken: niboToken };
      }

      await updateDoc(doc(db, 'clients', clientId), updates);
      alert('Credenciais atualizadas com sucesso!');
    } catch (error) {
      console.error('Error updating credentials:', error);
      alert('Erro ao atualizar credenciais.');
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async (provider: string) => {
    if (!clientId) return;
    setSyncing(provider);
    
    try {
      // Simulate API call for now since we don't have the backend controller yet
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newLog = {
        id: Date.now().toString(),
        provider,
        status: 'success',
        time: 'Agora',
        user: 'Eduardo Arruda',
        message: 'Sincronização manual completada com sucesso.'
      };
      
      setLogs(prev => [newLog, ...prev]);

    } catch (error) {
      console.error('Sync failed', error);
    } finally {
      setSyncing(null);
    }
  };

  if (!clientId) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
          <Settings2 size={40} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Nenhum cliente selecionado</h2>
        <p className="text-slate-500 mt-2 max-w-sm">
          Por favor, selecione um projeto ou cliente no Dashboard para configurar as integrações de API.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold bg-[#F1F5F9] text-slate-500 px-2 py-0.5 rounded uppercase border border-[#CBD5E1]">
              Configuração Ativa
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {clientData?.name || 'Carregando...'}
          </h2>
          <p className="text-slate-500 mt-1">Gestão de chaves de API e logs de sincronização.</p>
        </div>
        
        <div className="bg-emerald-50 px-4 py-2 rounded-xl flex items-center gap-3 border border-emerald-100">
          <Clock size={18} className="text-emerald-600" />
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Status: <span className="text-emerald-600">{clientData?.status || 'Ativo'}</span></p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Credentials Form Section */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  clientData?.dataSource === 'omie' && "bg-orange-100 text-orange-600",
                  clientData?.dataSource === 'conta_azul' && "bg-blue-100 text-blue-600",
                  clientData?.dataSource === 'nibo' && "bg-emerald-100 text-emerald-600",
                  clientData?.dataSource === 'excel' && "bg-slate-100 text-slate-600"
                )}>
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {clientData?.dataSource === 'omie' && 'Credenciais Omie'}
                    {clientData?.dataSource === 'conta_azul' && 'Credenciais Conta Azul'}
                    {clientData?.dataSource === 'nibo' && 'Credenciais Nibo'}
                    {clientData?.dataSource === 'excel' && 'Configuração Excel'}
                  </h3>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                    {clientData?.dataSource === 'excel' ? 'Importação via Planilha' : 'Integração REST API'}
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSaveCredentials} className="p-8 space-y-5">
              {clientData?.dataSource === 'omie' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase px-1">App Key</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <ShieldCheck size={18} />
                      </div>
                      <input 
                        type="text" 
                        value={omieKey}
                        onChange={(e) => setOmieKey(e.target.value)}
                        placeholder="Key fornecida pelo suporte Omie"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase px-1">App Secret</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Key size={18} />
                      </div>
                      <input 
                        type="password" 
                        value={omieSecret}
                        onChange={(e) => setOmieSecret(e.target.value)}
                        placeholder="Secret Key da aplicação"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {clientData?.dataSource === 'conta_azul' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase px-1">Client ID</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <ShieldCheck size={18} />
                      </div>
                      <input 
                        type="text" 
                        value={caClientId}
                        onChange={(e) => setCaClientId(e.target.value)}
                        placeholder="Client ID do App Conta Azul"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase px-1">Client Secret</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Key size={18} />
                      </div>
                      <input 
                        type="password" 
                        value={caClientSecret}
                        onChange={(e) => setCaClientSecret(e.target.value)}
                        placeholder="Client Secret do App"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {clientData?.dataSource === 'nibo' && (
                <div className="space-y-4">
                  <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-16 h-16 bg-white text-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                        <LogIn size={32} />
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-900">Integração via Token Nibo</h4>
                        <p className="text-xs text-emerald-700/70 max-w-xs mx-auto mt-1">
                          Siga as instruções abaixo para vincular os dados financeiros.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/50 p-4 rounded-xl border border-emerald-100 space-y-3">
                      <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                         Passo a Passo (Manual)
                      </p>
                      <ol className="text-[11px] text-emerald-700/80 space-y-2 list-decimal ml-4 font-medium leading-relaxed">
                        <li>Logue no <b>Nibo</b> e clique no nome da empresa.</li>
                        <li>Vá em <b>Mais opções</b> &gt; <b>Configurações</b>.</li>
                        <li>Acesse a aba <b>API</b> e copie o <b>apitoken</b>.</li>
                      </ol>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <label className="text-[11px] font-bold text-emerald-700 uppercase px-1">Insira o API Token aqui</label>
                      <div className="relative">
                        <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                        <input 
                          type="password" 
                          value={niboToken}
                          onChange={(e) => setNiboToken(e.target.value)}
                          placeholder="Cole o código do Nibo..."
                          className="w-full pl-12 pr-4 py-3 bg-white border border-emerald-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 font-mono"
                        />
                      </div>
                    </div>

                    {niboToken && (
                      <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-emerald-600 bg-white py-2 rounded-xl border border-emerald-100 shadow-sm">
                        <ShieldCheck size={16} />
                        Conexão Autorizada
                      </div>
                    )}
                  </div>
                </div>
              )}

              {clientData?.dataSource === 'excel' && (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                  <div className="p-4 bg-slate-100 rounded-full text-slate-400">
                    <RefreshCw size={32} />
                  </div>
                  <p className="text-sm text-slate-500 max-w-xs">
                    Para este cliente, o envio de dados é feito via upload de arquivos na aba **Upload Excel**.
                  </p>
                </div>
              )}

              {clientData?.dataSource !== 'excel' && (
                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={saving}
                    className={cn(
                      "w-full text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 group disabled:opacity-70",
                      clientData?.dataSource === 'omie' && "bg-orange-600",
                      clientData?.dataSource === 'conta_azul' && "bg-blue-600",
                      clientData?.dataSource === 'nibo' && "bg-emerald-600",
                      !clientData?.dataSource && "bg-slate-900"
                    )}
                  >
                    {saving ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                    {saving ? 'Salvando...' : `Atualizar Credenciais ${clientData?.dataSource?.replace('_', ' ').toUpperCase()}`}
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className={cn(
            "rounded-2xl p-6 flex gap-4 border",
            clientData?.dataSource === 'omie' && "bg-orange-50 border-orange-100",
            clientData?.dataSource === 'conta_azul' && "bg-blue-50 border-blue-100",
            clientData?.dataSource === 'nibo' && "bg-emerald-50 border-emerald-100",
            clientData?.dataSource === 'excel' && "bg-slate-50 border-slate-100"
          )}>
            <AlertCircle className={cn(
              "shrink-0",
              clientData?.dataSource === 'omie' && "text-orange-500",
              clientData?.dataSource === 'conta_azul' && "text-blue-500",
              clientData?.dataSource === 'nibo' && "text-emerald-500",
              clientData?.dataSource === 'excel' && "text-slate-500"
            )} />
            <div>
              <p className={cn(
                "text-[12px] font-bold uppercase",
                clientData?.dataSource === 'omie' && "text-orange-900",
                clientData?.dataSource === 'conta_azul' && "text-blue-900",
                clientData?.dataSource === 'nibo' && "text-emerald-900",
                clientData?.dataSource === 'excel' && "text-slate-900"
              )}>Atenção</p>
              <p className={cn(
                "text-[11px] font-medium leading-relaxed",
                clientData?.dataSource === 'omie' && "text-orange-700",
                clientData?.dataSource === 'conta_azul' && "text-blue-700",
                clientData?.dataSource === 'nibo' && "text-emerald-700",
                clientData?.dataSource === 'excel' && "text-slate-700"
              )}>
                As chaves de API permitem o acesso total aos dados financeiros do cliente. 
                Utilize apenas chaves de aplicações homologadas pela Profit BPO.
              </p>
            </div>
          </div>
        </div>

        {/* Sync Controls Side */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Ações de Sincronização</h3>
              
              <button 
                onClick={() => handleSync('Omie')}
                disabled={!!syncing}
                className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 group"
              >
                {syncing === 'Omie' ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />}
                {syncing === 'Omie' ? 'Processando...' : 'Forçar Sincronização'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Histórico Recente</h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
              {logs.length > 0 ? logs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-1.5 rounded-lg",
                      log.status === 'success' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {log.status === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold text-slate-900 uppercase tracking-tight">{log.provider}</span>
                      <p className="text-[10px] text-slate-400">{log.time || 'Ontem'}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-slate-300 text-[11px] font-bold uppercase italic">
                  Nenhum log disponível
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncPage;
