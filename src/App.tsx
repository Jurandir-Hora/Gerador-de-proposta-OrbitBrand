import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Templates } from './pages/Templates';
import { ProposalEditor } from './pages/ProposalEditor';
import { ProposalsList } from './pages/ProposalsList';
import { ClientView } from './pages/ClientView';
import { Analytics } from './pages/Analytics';
import { AuthPage } from './pages/AuthPage';

const ProtectedRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-700">
        <p className="text-sm font-medium animate-pulse">Carregando painel Orbit Brand...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="templates" element={<Templates />} />
        <Route path="editor/new" element={<ProposalEditor />} />
        <Route path="editor/:id" element={<ProposalEditor />} />
        <Route path="proposals" element={<ProposalsList />} />
        <Route path="analytics" element={<Analytics />} />
        <Route
          path="settings"
          element={
            <div className="p-8 space-y-4">
              <h1 className="text-2xl font-bold mb-2">Configurações da Conta</h1>
              <p className="text-neutral-600 text-sm max-w-xl">
                Em uma versão completa, aqui você poderia configurar integrações de pagamento, identidade visual das propostas,
                domínios personalizados e notificações automáticas.
              </p>
            </div>
          }
        />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            {/* Rotas protegidas para o painel interno */}
            <Route path="/*" element={<ProtectedRoutes />} />
            {/* Visualização pública do cliente não exige login */}
            <Route path="/client/:id" element={<div className="min-h-screen bg-gray-50 pt-8"><ClientView /></div>} />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export { App };
