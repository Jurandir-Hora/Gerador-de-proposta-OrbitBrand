import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Plus, CheckCircle, Clock, FileText, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Dashboard: React.FC = () => {
  const { proposals } = useAppContext();

  const stats = [
    { label: 'Total de Propostas', value: proposals.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-100' },
    { label: 'Aprovadas', value: proposals.filter(p => p.status === 'approved').length, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
    { label: 'Enviadas', value: proposals.filter(p => p.status === 'sent').length, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  ];

  const recentProposals = proposals.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Aprovada</span>;
      case 'sent':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Enviada</span>;
      case 'draft':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Rascunho</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Recusada</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Visão Geral</h2>
          <p className="text-neutral-500 mt-1">Bem-vindo de volta! Aqui está o resumo das suas propostas.</p>
        </div>
        <Link 
          to="/templates" 
          className="flex items-center space-x-2 bg-black hover:bg-neutral-800 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Proposta</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-neutral-200 p-6 flex items-center space-x-4 shadow-sm">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">{stat.label}</p>
              <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-neutral-900">Propostas Recentes</h3>
          <Link to="/proposals" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center space-x-1">
            <span>Ver todas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-sm text-neutral-500 font-medium">
                <th className="px-6 py-4">Cliente / Projeto</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {recentProposals.length > 0 ? (
                recentProposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/editor/${proposal.id}`} className="block">
                        <p className="font-semibold text-neutral-900">{proposal.clientName}</p>
                        <p className="text-sm text-neutral-500">{proposal.projectName}</p>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(proposal.status)}
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total)}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500">
                      {format(new Date(proposal.updatedAt), 'dd MMM yyyy', { locale: ptBR })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                    Nenhuma proposta criada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
