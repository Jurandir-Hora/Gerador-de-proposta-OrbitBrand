import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocorreu um erro. Tente novamente.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-4">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Branding */}
        <div className="space-y-8">
          <div>
            <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 mb-4">
              <span className="w-6 h-6 rounded-full flex items-center justify-center bg-white text-black font-black text-xs">OB</span>
              <span className="text-xs tracking-[0.25em] uppercase text-neutral-400">Orbit Brand</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
              Gerencie propostas cinematográficas
              <span className="block text-neutral-400 text-lg mt-3 font-normal">
                Filmes, mobile filmmaking, social media, fotografia e eventos em um só painel.
              </span>
            </h1>
          </div>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li>• Biblioteca de templates para cada tipo de serviço.</li>
            <li>• Propostas em tempo real com valores em Real brasileiro (BRL).</li>
            <li>• Visualização do cliente, aprovação online e pagamentos.</li>
          </ul>
          <p className="text-xs text-neutral-500">Ao continuar você concorda com os termos de uso da Orbit Brand.</p>
        </div>

        {/* Auth card */}
        <div className="bg-black/60 border border-neutral-800 rounded-2xl p-8 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.6)]">
          <div className="flex mb-6 bg-neutral-900 rounded-full p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 text-sm font-medium py-2 rounded-full transition-colors ${
                mode === 'login' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 text-sm font-medium py-2 rounded-full transition-colors ${
                mode === 'register' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Criar conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Nome completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm focus:outline-none focus:border-white"
                  placeholder="Ex: Ana da Silva"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm focus:outline-none focus:border-white"
                placeholder="voce@orbitbrand.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm focus:outline-none focus:border-white"
                placeholder="Min. 6 caracteres"
              />
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-neutral-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{mode === 'login' ? 'Acessar painel' : 'Criar minha conta'}</span>
            </button>
          </form>

          <p className="mt-4 text-[11px] text-neutral-500">
            Dica: use um e-mail simples e senha fácil de lembrar durante os testes. A autenticação é gerenciada pelo Firebase Auth.
          </p>
        </div>
      </div>
    </div>
  );
};
