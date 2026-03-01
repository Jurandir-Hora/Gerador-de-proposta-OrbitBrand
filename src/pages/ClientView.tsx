import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Proposal } from '../types';
import { Check, X, ShieldCheck, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRef } from 'react';

export const ClientView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getProposal, updateProposal, loading: contextLoading, agencySettings } = useAppContext();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Só tenta buscar se o contexto terminou de sincronizar com o Firebase
    if (!contextLoading && id) {
      const p = getProposal(id);
      if (p) {
        setProposal({ ...p });
        // Simular visualização
        if (p.status === 'sent') {
          updateProposal(id, { views: (p.views || 0) + 1 });
        }
      }
      setLoading(false);
    }
  }, [id, getProposal, contextLoading]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-neutral-50"><p className="text-xl font-medium animate-pulse">Carregando Proposta...</p></div>;
  if (!proposal) return <div className="min-h-screen flex items-center justify-center bg-neutral-50"><p className="text-xl text-neutral-500 font-medium">Proposta não encontrada.</p></div>;

  const handleAction = (status: 'approved' | 'rejected') => {
    updateProposal(proposal.id, { status });
    setProposal({ ...proposal, status });
  };

  const handlePrint = async (forceDownload = false) => {
    if (!previewRef.current) return;
    try {
      setExporting(true);
      const element = previewRef.current;

      const sanitizeFilename = (text: string) => {
        return text
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9\s-]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      };

      const today = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      const proposalNumber = proposal.id.split('-').pop()?.toUpperCase() || '001';
      const rawFileName = `${agencySettings.agencyName} - Proposta ${proposalNumber} - ${proposal.clientName} - ${today}`;
      const fileName = `${sanitizeFilename(rawFileName)}.pdf`;

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: 1000,
        onclone: (clonedDoc) => {
          const capturedElement = clonedDoc.querySelector('[data-proposal-preview="true"]');
          if (capturedElement instanceof HTMLElement) {
            capturedElement.style.width = '1000px';
            capturedElement.style.boxShadow = 'none';
            capturedElement.style.margin = '0';
            capturedElement.style.padding = '20px 60px';

            const allElements = capturedElement.querySelectorAll('*');
            allElements.forEach(el => {
              if (el instanceof HTMLElement) {
                const style = window.getComputedStyle(el);
                if (style.borderColor.includes('oklch')) el.style.borderColor = '#000000';
                if (el.tagName === 'P' || el.tagName === 'SPAN') {
                  el.style.wordBreak = 'keep-all';
                }

                // Oculta o rodapé interno do HTML (que continha © e válidade) para evitar duplicidade
                if (el.tagName === 'FOOTER' || el.className.includes('border-t')) {
                  if (el.innerText.includes('©') || el.innerText.includes('válido por')) {
                    el.style.display = 'none';
                  }
                }
              }
            });
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const footerHeight = 15;

      const imgWidth = pdfWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageContentHeight = pdfHeight - (footerHeight + margin * 2 + 5); // Seguranca de 5mm

      let heightLeft = imgHeight;
      let pageNumber = 1;

      const addDecorations = (pdfObj: any, pageNum: number) => {
        pdfObj.setFontSize(8);
        pdfObj.setTextColor(150, 150, 150);
        const footerText = `${agencySettings.footerText} | Página ${pageNum}`;
        const textWidth = pdfObj.getTextWidth(footerText);
        pdfObj.text(footerText, (pdfWidth - textWidth) / 2, pdfHeight - 8);
        pdfObj.setFontSize(7);
        pdfObj.text(`ID: ${proposalNumber}-${proposal.id.substring(0, 6)}`, margin, pdfHeight - 8);
        pdfObj.text(new Date().toLocaleDateString('pt-BR'), pdfWidth - margin - 20, pdfHeight - 8);
      };

      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight, undefined, 'FAST');
      addDecorations(pdf, pageNumber);
      heightLeft -= pageContentHeight;

      while (heightLeft > 7) {
        pageNumber++;
        pdf.addPage();
        const position = (pageNumber - 1) * pageContentHeight;
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
        pdf.addImage(imgData, 'PNG', margin, margin - position, imgWidth, imgHeight, undefined, 'FAST');
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdfWidth, margin, 'F');
        pdf.rect(0, pdfHeight - (footerHeight + margin), pdfWidth, footerHeight + margin, 'F');
        addDecorations(pdf, pageNumber);
        heightLeft -= pageContentHeight;
      }

      const blob = pdf.output('blob');
      const navAny = navigator as any;

      if (!forceDownload && navAny.share && navAny.canShare) {
        const file = new File([blob], fileName, { type: 'application/pdf' });
        if (navAny.canShare({ files: [file] })) {
          try {
            await navAny.share({
              title: `${agencySettings.agencyName} - Proposta ${proposalNumber}`,
              files: [file],
            });
            setExporting(false);
            return;
          } catch (e) {
            console.warn('Share cancelado, salvando arquivo localmente.');
          }
        }
      }

      pdf.save(fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Não foi possível gerar o PDF Profissional.');
    } finally {
      setExporting(false);
    }
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
        <button
          onClick={() => handlePrint(true)}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 shadow-sm transition-all hover:shadow-md disabled:opacity-50"
        >
          <Printer className="w-4 h-4" />
          {exporting ? 'Gerando...' : 'Imprimir / PDF'}
        </button>
      </div>

      {/* Actual Proposal Content */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:m-0 print:w-full border border-neutral-200">

        {/* Banner / Cover */}
        <div className="bg-black text-white p-12 md:p-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black to-neutral-800"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-12">
            <div>
              {agencySettings.logoUrl ? (
                <img src={agencySettings.logoUrl} alt={agencySettings.agencyName} className="h-20 object-contain mb-4" />
              ) : (
                <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
                  {agencySettings.agencyName.split(' ')[0].toUpperCase()}
                </h2>
              )}
              <p className="text-xl font-bold tracking-widest text-neutral-400 uppercase">{agencySettings.proposalTitle}</p>
            </div>

            <div className="text-left md:text-right space-y-2 text-neutral-300">
              <p className="font-bold text-white text-lg">{agencySettings.agencyName}</p>
              <p>{agencySettings.address}</p>
              <p>{agencySettings.email}</p>
              {agencySettings.cnpj && <p>CNPJ / CPF: {agencySettings.cnpj}</p>}
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
            <div className="w-16 h-16 bg-black text-white flex items-center justify-center rounded-2xl font-black text-2xl mb-6 uppercase">
              {agencySettings.agencyName.substring(0, 2)}
            </div>
            <p className="font-bold text-black mb-2">Agradecemos a oportunidade de apresentar nossa proposta.</p>
            <p className="text-neutral-500 text-sm">Em caso de dúvidas, entre em contato através do e-mail {agencySettings.email}</p>
          </footer>
        </div>
      </div>

      {/* Versão Profissional para Impressão (Oculta na tela) */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none">
        <div
          ref={previewRef}
          data-proposal-preview="true"
          className="bg-white min-h-[1100px] w-[800px] p-12 space-y-10 text-neutral-800 font-sans overflow-hidden"
        >
          <header className="flex justify-between items-start border-b-4 border-black pb-10">
            <div>
              {agencySettings.logoUrl ? (
                <img src={agencySettings.logoUrl} alt={agencySettings.agencyName} className="h-16 object-contain mb-2" />
              ) : (
                <h1 className="text-5xl font-black tracking-tighter mb-2 italic">
                  {agencySettings.agencyName.split(' ')[0].toUpperCase()}
                </h1>
              )}
              <p className="text-sm font-bold tracking-[0.2em] text-neutral-400 uppercase">{agencySettings.proposalTitle}</p>
            </div>
            <div className="text-right text-xs text-neutral-500 space-y-1 uppercase tracking-widest">
              <p className="font-black text-black">{agencySettings.agencyName}</p>
              <p>{agencySettings.email}</p>
              {agencySettings.cnpj && <p>CNPJ / CPF: {agencySettings.cnpj}</p>}
            </div>
          </header>

          <section className="flex justify-between py-6">
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Para</p>
              <h2 className="text-xl font-bold text-black">{proposal!.clientName}</h2>
              <p className="text-neutral-600">{proposal!.clientEmail}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Projeto</p>
              <h2 className="text-xl font-bold text-black">{proposal!.projectName}</h2>
              <p className="text-neutral-600">{new Date(proposal!.updatedAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold border-b border-neutral-200 pb-2 uppercase tracking-wide">Serviços Propostos</h3>
            <table className="w-full text-left table-fixed border-collapse">
              <thead>
                <tr className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-200">
                  <th className="py-4 font-bold w-[45%]">Descrição do Serviço</th>
                  <th className="py-4 font-bold text-center w-[10%]">Qtd</th>
                  <th className="py-4 font-bold text-right w-[22%]">Preço Un.</th>
                  <th className="py-4 font-bold text-right w-[23%]">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {proposal!.services.map((service, idx) => (
                  <tr key={idx}>
                    <td className="py-6 pr-4 align-top break-words">
                      <p className="font-bold text-base text-black leading-tight uppercase tracking-tight">{service.name}</p>
                      <p className="text-sm text-neutral-500 mt-2 leading-relaxed">{service.description}</p>
                    </td>
                    <td className="py-4 text-center text-sm">{service.quantity}</td>
                    <td className="py-4 text-right text-sm">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}</td>
                    <td className="py-4 text-right font-bold text-sm text-black">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price * service.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end pt-10">
              <div className="w-full max-w-[350px] bg-black p-8 rounded-2xl text-white">
                <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest mb-2 opacity-70">
                  <span>Total Investimento</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-black tracking-tight text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal!.total)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {proposal.terms && (
            <section className="pt-8">
              <h3 className="text-lg font-bold border-b border-neutral-200 pb-2 uppercase tracking-wide mb-4">Termos e Condições</h3>
              <div className="text-sm text-neutral-600 whitespace-pre-wrap leading-relaxed break-words">
                {proposal!.terms}
              </div>
            </section>
          )}

          <footer className="pt-16 pb-8 border-t border-neutral-200 mt-16 text-center text-sm text-neutral-400">
            <p>Este documento é válido por 15 dias a partir da data de emissão.</p>
            <p className="mt-2 font-bold text-neutral-800">{agencySettings.agencyName} &copy; {new Date().getFullYear()}</p>
          </footer>
        </div>
      </div>
    </div>
  );
};
