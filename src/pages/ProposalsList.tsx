import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { FileText, Edit2, Trash2, Eye, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ProposalsList: React.FC = () => {
  const { proposals, deleteProposal, loading } = useAppContext();

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a proposta "${name}"?`)) {
      try {
        await deleteProposal(id);
      } catch (error) {
        alert("Erro ao excluir proposta.");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'sent': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft': return 'bg-neutral-100 text-neutral-800 border-neutral-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovada';
      case 'sent': return 'Enviada';
      case 'draft': return 'Rascunho';
      case 'rejected': return 'Recusada';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Propostas</h2>
          <p className="text-neutral-500 mt-1">Gerencie todas as suas propostas enviadas e em rascunho.</p>
        </div>
        <Link
          to="/templates"
          className="flex items-center space-x-2 bg-black hover:bg-neutral-800 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
        >
          <FileText className="w-5 h-5" />
          <span>Criar Proposta</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-xs uppercase tracking-wider text-neutral-500 font-semibold">
                <th className="px-6 py-4">Detalhes do Projeto</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Valor Total</th>
                <th className="px-6 py-4">Última Atualização</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {proposals.length > 0 ? (
                proposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-neutral-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center border border-neutral-200">
                          <FileText className="w-5 h-5 text-neutral-500" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900">{proposal.projectName}</p>
                          <p className="text-sm text-neutral-500">{proposal.clientName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(proposal.status)}`}>
                        {getStatusText(proposal.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-neutral-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total)}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500 font-medium">
                      {format(new Date(proposal.updatedAt), "dd 'de' MMM, yyyy", { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <Link to={`/client/${proposal.id}`} target="_blank" className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Visualizar como Cliente">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {(proposal.status === 'approved' || proposal.status === 'sent') && (
                          <Link
                            to={`/fiscal?client=${encodeURIComponent(proposal.clientName)}&doc=${encodeURIComponent(proposal.clientEmail)}&docPre=${encodeURIComponent(proposal.clientDocument || '')}&amount=${proposal.total}&desc=${encodeURIComponent(`Pagamento referente ao projeto ${proposal.projectName}`)}&id=${proposal.id}`}
                            className="p-2 text-neutral-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Gerar Recibo"
                          >
                            <Receipt className="w-4 h-4" />
                          </Link>
                        )}
                        <Link to={`/editor/${proposal.id}`} className="p-2 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Editar">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(proposal.id, proposal.projectName)} className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-400 uppercase tracking-widest text-xs font-bold animate-pulse">
                    Sincronizando com Banco de Dados...
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-neutral-400">
                      <FileText className="w-12 h-12 mb-4 text-neutral-300" />
                      <p className="text-lg font-medium text-neutral-900 mb-1">Nenhuma proposta encontrada</p>
                      <p className="text-sm mb-4">Você ainda não criou nenhuma proposta.</p>
                      <Link to="/templates" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        Criar sua primeira proposta
                      </Link>
                    </div>
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
