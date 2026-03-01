import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Proposal } from '../types';
import { Check, X, ShieldCheck, Printer } from 'lucide-react';

export const ClientView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getProposal, updateProposal } = useAppContext();
  
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const p = getProposal(id);
      if (p) {
        setProposal(p);
        // Simulate recording a view (since we can't save directly back easily in mock w/o triggering loops, just local state update)
        if (p.status === 'sent') {
          updateProposal(id, { views: (p.views || 0) + 1 });
        }
      }
      setLoading(false);
    }
  }, [id, getProposal]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-neutral-50"><p className="text-xl font-medium animate-pulse">Carregando Proposta...</p></div>;
  if (!proposal) return <div className="min-h-screen flex items-center justify-center bg-neutral-50"><p className="text-xl text-neutral-500 font-medium">Proposta não encontrada.</p></div>;

  const handleAction = (status: 'approved' | 'rejected') => {
    updateProposal(proposal.id, { status });
    setProposal({ ...proposal, status });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32 font-sans text-neutral-900">
      
      {/* Header / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 print:hidden">
        <div>
          <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-1">Proposta para</p>
          <h1 className="text-3xl font-black">{proposal.clientName}</h1>
          <p className="text-neutral-500 text-lg">{proposal.projectName}</p>
        </div>
        
        {proposal.status === 'sent' && (
          <div className="flex gap-4">
            <button 
              onClick={() => handleAction('rejected')}
              className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-red-500 text-red-600 font-bold hover:bg-red-50 transition-colors"
            >
              <X className="w-5 h-5" />
              <span>Recusar</span>
            </button>
            <button 
              onClick={() => handleAction('approved')}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white font-bold hover:bg-neutral-800 transition-colors shadow-lg shadow-black/20 hover:shadow-black/30"
            >
              <Check className="w-5 h-5" />
              <span>Aprovar Proposta</span>
            </button>
          </div>
        )}

        {proposal.status === 'approved' && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-r-lg flex items-center gap-4 w-full sm:w-auto">
            <ShieldCheck className="w-8 h-8 text-green-600" />
            <div>
              <p className="font-bold text-green-900">Proposta Aprovada</p>
              <p className="text-sm text-green-800">Obrigado pela confiança!</p>
            </div>
          </div>
        )}

        {proposal.status === 'rejected' && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center gap-4 w-full sm:w-auto">
            <X className="w-8 h-8 text-red-600" />
            <div>
              <p className="font-bold text-red-900">Proposta Recusada</p>
              <p className="text-sm text-red-800">Entraremos em contato para mais detalhes.</p>
            </div>
          </div>
        )}
      </div>

      {/* Top Toolbar */}
      <div className="flex justify-end gap-2 mb-6 print:hidden">
        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 shadow-sm transition-all hover:shadow-md">
          <Printer className="w-4 h-4" />
          Imprimir / PDF
        </button>
      </div>

      {/* Actual Proposal Content */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:m-0 print:w-full border border-neutral-200">
        
        {/* Banner / Cover */}
        <div className="bg-black text-white p-12 md:p-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black to-neutral-800"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-12">
            <div>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">ORBIT</h2>
              <p className="text-xl font-bold tracking-widest text-neutral-400 uppercase">Proposta Comercial</p>
            </div>
            
            <div className="text-left md:text-right space-y-2 text-neutral-300">
              <p className="font-bold text-white text-lg">Orbit Brand Agência</p>
              <p>Rua Exemplo, 123 - SP</p>
              <p>contato@orbitbrand.com</p>
              <p>CNPJ: 00.000.000/0001-00</p>
            </div>
          </div>
          
          <div className="relative z-10 mt-20 pt-10 border-t border-neutral-700 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-2">Preparado para</p>
              <p className="text-2xl font-bold text-white">{proposal.clientName}</p>
              <p className="text-neutral-300">{proposal.clientEmail}</p>
            </div>
            <div className="md:text-right">
              <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-2">Data da Proposta</p>
              <p className="text-xl font-bold text-white">{new Date(proposal.updatedAt).toLocaleDateString('pt-BR')}</p>
              <p className="text-sm text-neutral-400 mt-2">Válida por 15 dias</p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-16 space-y-16">
          {/* Services Section */}
          <section>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-8 flex items-center gap-4">
              <span className="w-8 h-1 bg-black block"></span>
              Investimento
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-black text-sm uppercase tracking-widest text-neutral-500 font-bold">
                    <th className="py-4 px-4 w-1/2">Serviço / Descrição</th>
                    <th className="py-4 px-4 text-center">Qtd</th>
                    <th className="py-4 px-4 text-right">Valor Un.</th>
                    <th className="py-4 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {proposal.services.map((service, index) => (
                    <tr key={index} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-6 px-4">
                        <p className="font-bold text-lg text-black mb-1">{service.name}</p>
                        <p className="text-neutral-600 text-sm leading-relaxed">{service.description}</p>
                      </td>
                      <td className="py-6 px-4 text-center font-medium text-neutral-800">{service.quantity}</td>
                      <td className="py-6 px-4 text-right font-medium text-neutral-800">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                      </td>
                      <td className="py-6 px-4 text-right font-bold text-lg text-black">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price * service.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex justify-end">
              <div className="w-full md:w-1/2 bg-neutral-100 rounded-2xl p-8 border border-neutral-200">
                <div className="flex justify-between items-center text-sm font-bold text-neutral-500 uppercase tracking-widest mb-2">
                  <span>Total do Projeto</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-4xl font-black tracking-tight text-black">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total)}
                  </span>
                </div>
                {proposal.status === 'approved' && (
                  <button className="w-full mt-6 bg-[#0070ba] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#005ea6] transition-colors print:hidden shadow-lg shadow-blue-500/30">
                    Pagar com PayPal
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Terms Section */}
          {proposal.terms && (
            <section className="pt-8 border-t border-neutral-200">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-8 flex items-center gap-4">
                <span className="w-8 h-1 bg-black block"></span>
                Termos e Condições
              </h3>
              <div className="prose prose-neutral max-w-none prose-p:leading-relaxed text-neutral-600 bg-neutral-50 p-8 rounded-2xl border border-neutral-100 font-mono text-sm whitespace-pre-wrap">
                {proposal.terms}
              </div>
            </section>
          )}

          {/* Footer */}
          <footer className="pt-16 border-t border-neutral-200 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-black text-white flex items-center justify-center rounded-2xl font-black text-2xl mb-6">
              OB
            </div>
            <p className="font-bold text-black mb-2">Agradecemos a oportunidade de apresentar nossa proposta.</p>
            <p className="text-neutral-500 text-sm">Em caso de dúvidas, entre em contato através do e-mail contato@orbitbrand.com</p>
          </footer>
        </div>
      </div>
    </div>
  );
};
