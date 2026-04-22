import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { TrendingUp, ShieldCheck, PieChart, Loader2, Mail, Lock, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

const LoginPage: React.FC = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setErrorMsg(null);
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        console.log('Login cancelado pelo usuário.');
      } else {
        setErrorMsg('Falha ao autenticar com Google.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn || !email || !password) return;
    if (isRegistering && !name) return;
    
    setErrorMsg(null);
    setIsLoggingIn(true);
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        // Account created succesfully. AuthContext will detect and save profile.
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error('Auth error detailed:', error.code, error.message);
      
      const errorCode = error.code;

      if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
        setErrorMsg('Usuário ou senha inválidos. Se este é seu primeiro acesso, você deve usar a opção "CRIAR CONTA" abaixo primeiro.');
      } else if (errorCode === 'auth/email-already-in-use') {
        setErrorMsg('Este e-mail já está cadastrado. Tente entrar com sua senha.');
      } else if (errorCode === 'auth/operation-not-allowed') {
        setErrorMsg('O login com e-mail/senha ainda não foi ativado no Console do Firebase. Verifique se ativou o "Email/Password" em Authentication > Sign-in Method.');
      } else if (errorCode === 'auth/weak-password') {
        setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setErrorMsg(`Erro: ${error.message} (Código: ${errorCode})`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden min-h-[600px]">
        {/* Left Side: Branding */}
        <div className="bg-[#0F172A] p-12 text-white flex flex-col justify-between relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#38BDF8]/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
          
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-[#38BDF8] rounded-xl flex items-center justify-center font-bold text-2xl">P</div>
              <h1 className="text-2xl font-bold tracking-tight">PROFIT <span className="opacity-50">BPO</span></h1>
            </div>

            <h2 className="text-4xl font-bold leading-tight mb-6">
              Gestão financeira <span className="text-[#38BDF8]">inteligente</span> para o seu negócio.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Centralize seus dados do Omie, Conta Azul e Planilhas em um único lugar. 
              Decisões baseadas em dados reais.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-[#38BDF8]"><ShieldCheck size={20} /></div>
              <p className="text-sm font-medium opacity-80">Segurança e sigilo absoluto</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-[#38BDF8]"><TrendingUp size={20} /></div>
              <p className="text-sm font-medium opacity-80">Dashboards em tempo real</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login/Register */}
        <div className="p-10 flex flex-col justify-center bg-[#F8FAFC]">
          <div className="w-full max-w-sm mx-auto">
            <div className="text-center mb-8">
              <PieChart size={40} className="text-[#38BDF8] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900">{isRegistering ? 'Crie sua conta' : 'Acesse sua conta'}</h3>
              <p className="text-slate-500 text-sm mt-1 uppercase tracking-wider font-bold opacity-60">Profit BPO Financeiro</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4 mb-6">
              {isRegistering && (
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-bold text-slate-500 uppercase px-1 text-left block">Seu Nome</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: João Silva"
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/20 focus:border-[#38BDF8] transition-all text-[13px]"
                      required={isRegistering}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-slate-500 uppercase px-1 text-left block">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/20 focus:border-[#38BDF8] transition-all text-[13px]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-slate-500 uppercase px-1 text-left block">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/20 focus:border-[#38BDF8] transition-all text-[13px]"
                    required
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[11px] font-bold text-center">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-[#0F172A] text-white py-3.5 rounded-xl font-bold text-[13px] hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 disabled:opacity-70"
              >
                {isLoggingIn && !errorMsg ? <Loader2 className="animate-spin" size={18} /> : null}
                {isLoggingIn && !errorMsg ? 'Aguarde...' : (isRegistering ? 'Criar minha Conta' : 'Entrar na Plataforma')}
              </button>
            </form>

            <div className="text-center mb-6">
              <button 
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-[12px] font-bold text-[#38BDF8] hover:underline"
              >
                {isRegistering ? 'Já tenho uma conta. Fazer Login.' : 'Não tem conta? Solicite ou Crie seu acesso.'}
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400"><span className="bg-[#F8FAFC] px-3 tracking-widest">Ou use sua conta</span></div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleGoogleLogin}
              type="button"
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 px-6 py-3.5 rounded-xl text-slate-700 font-bold text-[12px] shadow-sm hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              Continuar com Google
            </motion.button>
            
            <p className="text-[10px] text-center text-slate-400 mt-10 uppercase tracking-widest font-bold">
              Profit BPO Financeiro &copy; 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
