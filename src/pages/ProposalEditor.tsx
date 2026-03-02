import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Proposal, ServiceItem } from '../types';
import { Save, ArrowLeft, Trash2, Plus, Printer, Share2, FileDown, Image, Link as LinkIcon, Play, Upload, Type } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const ProposalEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProposal, updateProposal, loading: contextLoading, agencySettings } = useAppContext();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'services' | 'terms' | 'media'>('details');
  const previewRef = useRef<HTMLDivElement | null>(null);
  const mainContentRef = useRef<HTMLDivElement | null>(null);
  const mediaSectionRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [exporting, setExporting] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isAddingUrl, setIsAddingUrl] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const type = file.type.startsWith('video') ? 'video' : 'image';

      if (proposal) {
        setProposal({
          ...proposal,
          media: [
            ...proposal.media,
            { id: uuidv4(), url, type, caption: file.name }
          ]
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddUrlMedia = (type: 'image' | 'video') => {
    if (!urlInput.trim()) return;

    if (proposal) {
      setProposal({
        ...proposal,
        media: [
          ...proposal.media,
          { id: uuidv4(), url: urlInput, type, caption: 'Link Externo' }
        ]
      });
      setUrlInput('');
      setIsAddingUrl(false);
    }
  };

  useEffect(() => {
    if (id && !contextLoading) {
      const p = getProposal(id);
      if (p) setProposal({ ...p });
    }
  }, [id, getProposal, contextLoading]);

  if (contextLoading || !proposal) return (
    <div className="flex flex-col items-center justify-center h-screen bg-neutral-50 gap-4">
      <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xl font-bold animate-pulse">Carregando Editor de Proposta...</p>
    </div>
  );

  const handleSave = async () => {
    try {
      await updateProposal(proposal.id, proposal);
      navigate('/proposals');
    } catch (error) {
      alert("Erro ao salvar alterações.");
    }
  };

  const handlePrint = () => {
    handleExportPDF(true);
  };

  const handleExportPDF = async (forceDownload = false) => {
    if (!mainContentRef.current) return;
    try {
      setExporting(true);

      const sanitizeFilename = (text: string) => {
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
      };

      const today = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      const proposalNumber = proposal.id.split('-').pop()?.toUpperCase() || '001';
      const rawFileName = `Orbit Brand - Proposta ${proposalNumber} - ${proposal.clientName} - ${today}`;
      const fileName = `${sanitizeFilename(rawFileName)}.pdf`;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const footerHeight = 15;
      const pageContentHeight = pdfHeight - (footerHeight + margin * 2 + 10); // Aumentado o respiro de segurança

      const addDecorations = (pdfObj: any, pageNum: number, totalPages?: number) => {
        pdfObj.setFontSize(8);
        pdfObj.setTextColor(140, 140, 140);
        const footerText = `${agencySettings.footerText} | Página ${pageNum}`;
        const textWidth = pdfObj.getTextWidth(footerText);
        // Posicionado com uma margem mais segura do fundo
        pdfObj.text(footerText, (pdfWidth - textWidth) / 2, pdfHeight - 10);
        pdfObj.setFontSize(7);
        pdfObj.text(`AUTENTICAÇÃO: ${proposalNumber}-${proposal.id.substring(0, 4)}`, margin, pdfHeight - 10);
        pdfObj.text(new Date().toLocaleDateString('pt-BR'), pdfWidth - margin - 15, pdfHeight - 10);
      };

      const drawFooterMask = (pdfObj: any) => {
        pdfObj.setFillColor(255, 255, 255);
        // Máscara um pouco maior para garantir que o conteúdo não encoste no texto do rodapé
        pdfObj.rect(0, pdfHeight - (footerHeight + margin + 5), pdfWidth, footerHeight + margin + 5, 'F');
      };

      const captureAndAddPart = async (element: HTMLElement, startPage: number) => {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          windowWidth: 1000,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        const imgWidth = pdfWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let currentPage = startPage;
        let position = 0;

        while (heightLeft > 0) {
          if (currentPage > startPage) pdf.addPage();

          pdf.addImage(imgData, 'JPEG', margin, margin - position, imgWidth, imgHeight, undefined, 'FAST');

          // Mascarar topo e rodapé para limpeza
          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, pdfWidth, margin, 'F');
          drawFooterMask(pdf);

          addDecorations(pdf, currentPage);

          position += pageContentHeight;
          heightLeft -= pageContentHeight;
          if (heightLeft > 5) currentPage++;
        }
        return currentPage;
      };

      // Parte 1: Conteúdo Principal
      let lastPage = await captureAndAddPart(mainContentRef.current, 1);

      // Parte 2: Mídia (Se existir)
      if (proposal.media.length > 0 && mediaSectionRef.current) {
        pdf.addPage();
        lastPage = await captureAndAddPart(mediaSectionRef.current, lastPage + 1);
      }

      // Exportação
      const blob = pdf.output('blob');
      const navAny = navigator as any;

      if (!forceDownload && navAny.share && navAny.canShare) {
        const file = new File([blob], fileName, { type: 'application/pdf' });
        if (navAny.canShare({ files: [file] })) {
          try {
            await navAny.share({ title: rawFileName, files: [file] });
            setExporting(false);
            return;
          } catch (e) {
            console.warn('Share cancelado, salvando localmente.');
          }
        }
      }

      pdf.save(fileName);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Não foi possível gerar o PDF.');
    } finally {
      setExporting(false);
    }
  };

  const handleCopyClientLink = async () => {
    try {
      const base = window.location.origin;
      const url = `${base}/client/${proposal.id}`;
      await navigator.clipboard.writeText(url);
      alert('Link da proposta copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar link', error);
      alert('Não foi possível copiar o link. Copie diretamente da barra de endereços.');
    }
  };

  const calculateTotal = (services: ServiceItem[]) => {
    return services.reduce((acc, s) => acc + s.price * s.quantity, 0);
  };

  const updateService = (index: number, field: keyof ServiceItem, value: any) => {
    const newServices = [...proposal.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setProposal({
      ...proposal,
      services: newServices,
      total: calculateTotal(newServices)
    });
  };

  const addService = () => {
    const newServices = [...proposal.services, { id: uuidv4(), name: 'Novo Serviço', description: '', price: 0, quantity: 1 }];
    setProposal({
      ...proposal,
      services: newServices,
      total: calculateTotal(newServices)
    });
  };

  const removeService = (index: number) => {
    const newServices = proposal.services.filter((_, i) => i !== index);
    setProposal({
      ...proposal,
      services: newServices,
      total: calculateTotal(newServices)
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full lg:h-[calc(100vh-8rem)]">
      {/* Editor Side */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white border border-neutral-200 rounded-xl lg:rounded-l-xl lg:rounded-r-none shadow-sm overflow-hidden print:hidden">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center space-x-2">
            <button onClick={() => navigate('/proposals')} className="p-2 text-neutral-500 hover:text-black transition-colors rounded-lg hover:bg-neutral-200">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-neutral-900">Editar Proposta</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handlePrint()}
              className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:border-black hover:text-black bg-white text-xs font-medium transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportPDF(false)}
              disabled={exporting}
              className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FileDown className="w-4 h-4" />
              <span>{exporting ? 'Gerando PDF...' : 'Exportar PDF'}</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center space-x-2 bg-black hover:bg-neutral-800 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
            >
              <Save className="w-4 h-4" />
              <span>Salvar</span>
            </button>
          </div>
        </div>

        <div className="flex border-b border-neutral-200 bg-white">
          <button
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'details' ? 'border-black text-black' : 'border-transparent text-neutral-500 hover:text-black'}`}
            onClick={() => setActiveTab('details')}
          >
            Detalhes
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'services' ? 'border-black text-black' : 'border-transparent text-neutral-500 hover:text-black'}`}
            onClick={() => setActiveTab('services')}
          >
            Serviços
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'terms' ? 'border-black text-black' : 'border-transparent text-neutral-500 hover:text-black'}`}
            onClick={() => setActiveTab('terms')}
          >
            Termos
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'media' ? 'border-black text-black' : 'border-transparent text-neutral-500 hover:text-black'}`}
            onClick={() => setActiveTab('media')}
          >
            Mídia
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-neutral-50">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nome do Projeto</label>
                <input
                  type="text"
                  value={proposal.projectName}
                  onChange={e => setProposal({ ...proposal, projectName: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black transition-shadow"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Nome do Cliente</label>
                  <input
                    type="text"
                    value={proposal.clientName}
                    onChange={e => setProposal({ ...proposal, clientName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">E-mail do Cliente</label>
                  <input
                    type="email"
                    value={proposal.clientEmail}
                    onChange={e => setProposal({ ...proposal, clientEmail: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">CPF / CNPJ do Cliente</label>
                  <input
                    type="text"
                    value={proposal.clientDocument || ''}
                    onChange={e => setProposal({ ...proposal, clientDocument: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black transition-shadow"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                <select
                  value={proposal.status}
                  onChange={e => setProposal({ ...proposal, status: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black transition-shadow"
                >
                  <option value="draft">Rascunho</option>
                  <option value="sent">Enviada</option>
                  <option value="approved">Aprovada</option>
                  <option value="rejected">Recusada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Notas Internas</label>
                <textarea
                  value={proposal.notes}
                  onChange={e => setProposal({ ...proposal, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black transition-shadow"
                />
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-6">
              {proposal.services.map((service, index) => (
                <div key={service.id} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm relative group">
                  <button
                    onClick={() => removeService(index)}
                    className="absolute -top-3 -right-3 p-1.5 bg-red-100 text-red-600 rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={service.name}
                      onChange={e => updateService(index, 'name', e.target.value)}
                      placeholder="Nome do Serviço"
                      className="w-full px-3 py-2 text-lg font-bold border-b border-transparent hover:border-neutral-300 focus:border-black focus:outline-none transition-colors"
                    />
                    <textarea
                      value={service.description}
                      onChange={e => updateService(index, 'description', e.target.value)}
                      placeholder="Descrição detalhada..."
                      rows={2}
                      className="w-full px-3 py-2 text-sm text-neutral-600 border border-transparent hover:border-neutral-300 focus:border-black focus:outline-none transition-colors rounded-lg resize-none"
                    />
                    <div className="flex items-center space-x-4 px-3">
                      <div className="flex-1">
                        <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1">Preço (R$)</label>
                        <input
                          type="number"
                          value={service.price}
                          onChange={e => updateService(index, 'price', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:border-black focus:ring-1 focus:ring-black transition-colors"
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1">Qtd</label>
                        <input
                          type="number"
                          value={service.quantity}
                          onChange={e => updateService(index, 'quantity', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:border-black focus:ring-1 focus:ring-black transition-colors"
                        />
                      </div>
                      <div className="flex-1 text-right">
                        <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1">Subtotal</label>
                        <div className="py-2 font-bold text-neutral-900">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price * service.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addService}
                className="w-full py-4 border-2 border-dashed border-neutral-300 rounded-xl text-neutral-500 font-medium hover:border-black hover:text-black transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Adicionar Serviço</span>
              </button>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Termos e Condições</label>
                <textarea
                  value={proposal.terms}
                  onChange={e => setProposal({ ...proposal, terms: e.target.value })}
                  rows={15}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black transition-shadow font-mono text-sm"
                  placeholder="Defina os termos de pagamento, prazos de entrega e condições gerais..."
                />
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,video/*"
                className="hidden"
              />

              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm text-center">
                <div className="mx-auto w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mb-6 border border-neutral-100 italic">
                  <Image className="w-8 h-8 text-neutral-300" />
                </div>
                <h3 className="text-xl font-black text-neutral-900 mb-2 uppercase tracking-tight">Biblioteca de Mídia</h3>
                <p className="text-sm text-neutral-500 mb-8 font-medium italic">Enriqueça sua proposta com provas sociais, portfólio e referências visuais.</p>

                {!isAddingUrl ? (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto px-8 py-3 bg-black text-white rounded-xl transition-all font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-neutral-800"
                    >
                      <Upload className="w-4 h-4" /> Upload de Arquivo
                    </button>
                    <button
                      onClick={() => setIsAddingUrl(true)}
                      className="w-full sm:w-auto px-8 py-3 bg-white border border-neutral-200 text-neutral-700 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:border-black hover:text-black"
                    >
                      <LinkIcon className="w-4 h-4" /> Adicionar Link
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-2 bg-neutral-50 p-1 rounded-xl border border-neutral-200">
                      <input
                        type="url"
                        placeholder="Cole a URL da imagem ou vídeo (YouTube/Vimeo)..."
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="flex-1 bg-transparent px-4 py-3 outline-none text-sm font-medium"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleAddUrlMedia('image')}
                        className="px-6 py-2.5 bg-neutral-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                      >
                        <Image className="w-4 h-4" /> É Imagem
                      </button>
                      <button
                        onClick={() => handleAddUrlMedia('video')}
                        className="px-6 py-2.5 bg-neutral-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" /> É Vídeo
                      </button>
                      <button
                        onClick={() => { setIsAddingUrl(false); setUrlInput(''); }}
                        className="px-6 py-2.5 bg-neutral-100 text-neutral-500 rounded-lg text-[10px] font-black uppercase tracking-widest"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-20">
                {proposal.media.map((m) => (
                  <div key={m.id} className="relative group aspect-video bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-xl transition-all hover:border-black">
                    {m.type === 'image' ? (
                      <img src={m.url} alt={m.caption} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-neutral-900 flex flex-col items-center justify-center p-4">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-[9px] text-white/50 font-black uppercase tracking-[0.2em]">{m.caption || 'Link de Vídeo'}</p>
                        {m.url.startsWith('http') && (
                          <p className="text-[10px] text-indigo-400 font-bold truncate max-w-full px-4 mt-1">{m.url}</p>
                        )}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button
                        onClick={() => setProposal({ ...proposal, media: proposal.media.filter(media => media.id !== m.id) })}
                        className="p-3 bg-red-500 text-white rounded-2xl hover:scale-110 transition-transform flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl"
                      >
                        <Trash2 className="w-4 h-4" /> Remover
                      </button>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 flex items-center gap-2">
                        {m.type === 'image' ? <Image className="w-3.5 h-3.5 text-neutral-400" /> : <Play className="w-3.5 h-3.5 text-neutral-400" />}
                        <p className="text-[10px] font-black uppercase tracking-wider text-neutral-900 truncate">
                          {m.caption || 'Sem título'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {proposal.media.length === 0 && (
                  <div className="col-span-full py-20 border-2 border-dashed border-neutral-200 rounded-[40px] flex flex-col items-center justify-center text-neutral-300">
                    <Image className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-xs font-black uppercase tracking-widest text-neutral-400">Nenhuma mídia adicionada</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Side */}
      <div className="absolute -left-[9999px] opacity-0 lg:static lg:opacity-100 w-[800px] lg:w-1/2 bg-neutral-200 border border-neutral-300 rounded-xl lg:rounded-r-xl lg:rounded-l-none p-4 lg:p-8 overflow-auto print:w-full print:border-0 print:rounded-none print:p-0">
        <div
          ref={previewRef}
          data-proposal-preview="true"
          className="shadow-2xl mx-auto w-full max-w-[800px] print:shadow-none print:w-full overflow-hidden"
          style={{ background: 'white', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
        >
          <div ref={mainContentRef}>

            {/* ── COVER HEADER ── */}
            <div style={{ background: '#0c0c0c', padding: '48px 52px', position: 'relative', overflow: 'hidden' }}>
              {/* Purple accent stripe */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '5px', height: '100%', background: 'linear-gradient(180deg, #7c3aed, #4f46e5)' }} />
              {/* Decorative rings */}
              <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '260px', height: '260px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)' }} />
              <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '160px', height: '160px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }} />
              {/* Diagonal gradient overlay */}
              <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: 'linear-gradient(135deg, transparent 30%, rgba(79,70,229,0.06) 100%)' }} />

              {/* Logo / Agency Name */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                {agencySettings.logoUrl ? (
                  <img src={agencySettings.logoUrl} alt={agencySettings.agencyName} style={{ height: '60px', objectFit: 'contain', marginBottom: '10px' }} />
                ) : (
                  <h1 style={{ fontSize: '54px', fontWeight: 900, color: 'white', letterSpacing: '-3px', lineHeight: 1, marginBottom: '10px', fontStyle: 'italic', margin: '0 0 10px 0' }}>
                    {agencySettings.agencyName.split(' ')[0].toUpperCase()}
                  </h1>
                )}
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '5px', textTransform: 'uppercase', margin: 0 }}>
                  {agencySettings.proposalTitle}
                </p>
              </div>

              {/* Top-right doc info */}
              <div style={{ position: 'absolute', top: '48px', right: '52px', textAlign: 'right', zIndex: 2 }}>
                <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 6px 0' }}>Proposta Comercial</p>
                <p style={{ fontSize: '14px', fontWeight: 800, color: 'rgba(255,255,255,0.7)', margin: '0 0 4px 0' }}>#{proposal.id.split('-').pop()?.toUpperCase()}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            {/* ── CLIENT & PROJECT INFO ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ padding: '32px 40px', borderRight: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: '9px', fontWeight: 700, color: '#9ca3af', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 10px 0' }}>Destinado A</p>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0c0c0c', margin: '0 0 4px 0', lineHeight: 1.2 }}>{proposal.clientName || 'Nome do Cliente'}</h2>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px 0' }}>{proposal.clientEmail}</p>
                {proposal.clientDocument && <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>CPF/CNPJ: {proposal.clientDocument}</p>}
              </div>
              <div style={{ padding: '32px 40px' }}>
                <p style={{ fontSize: '9px', fontWeight: 700, color: '#9ca3af', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 10px 0' }}>Projeto</p>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0c0c0c', margin: '0 0 4px 0', lineHeight: 1.2 }}>{proposal.projectName || 'Nome do Projeto'}</h2>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 14px 0' }}>{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', padding: '4px 12px', borderRadius: '20px', border: '1px solid #bbf7d0' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '1px' }}>Válido por 15 dias</span>
                </div>
              </div>
            </div>

            {/* ── SERVICES TABLE ── */}
            <div style={{ padding: '40px 40px 0' }}>
              <p style={{ fontSize: '9px', fontWeight: 700, color: '#9ca3af', letterSpacing: '4px', textTransform: 'uppercase', margin: '0 0 20px 0' }}>Escopo de Serviços</p>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0c0c0c' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '2px', textTransform: 'uppercase' }}>Serviço / Descrição</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '2px', textTransform: 'uppercase', width: '60px' }}>Qtd</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '2px', textTransform: 'uppercase', width: '130px' }}>Valor Un.</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '2px', textTransform: 'uppercase', width: '130px' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.services.map((service, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ padding: '20px 16px', verticalAlign: 'top' }}>
                        <p style={{ fontWeight: 800, fontSize: '13px', color: '#0c0c0c', textTransform: 'uppercase', letterSpacing: '-0.2px', lineHeight: 1.2, margin: '0 0 6px 0' }}>{service.name}</p>
                        {service.description && <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: 1.7, margin: 0 }}>{service.description}</p>}
                      </td>
                      <td style={{ padding: '20px 16px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#374151', verticalAlign: 'top' }}>{service.quantity}</td>
                      <td style={{ padding: '20px 16px', textAlign: 'right', fontSize: '13px', color: '#374151', verticalAlign: 'top' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}</td>
                      <td style={{ padding: '20px 16px', textAlign: 'right', fontSize: '14px', fontWeight: 800, color: '#0c0c0c', verticalAlign: 'top' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price * service.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── TOTAL BLOCK ── */}
            <div style={{ padding: '28px 40px 40px', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ background: '#ffffff', border: '1.5px solid #d1d5db', padding: '28px 36px', borderRadius: '18px', minWidth: '300px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, width: '4px', height: '100%', background: 'linear-gradient(180deg, #7c3aed, #4f46e5)' }} />
                <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', width: '140px', height: '140px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.04)' }} />
                <p style={{ fontSize: '9px', fontWeight: 700, color: '#9ca3af', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 10px 0' }}>Total do Investimento</p>
                <p style={{ fontSize: '34px', fontWeight: 900, color: '#0c0c0c', letterSpacing: '-2px', lineHeight: 1, margin: 0 }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total)}
                </p>
              </div>
            </div>

            {/* ── TERMS ── */}
            {proposal.terms && (
              <div style={{ padding: '60px 40px 40px' }}>
                <div style={{ background: '#f9fafb', borderRadius: '16px', padding: '28px 32px', borderLeft: '4px solid #0c0c0c', border: '1px solid #f3f4f6', borderLeftWidth: '4px', borderLeftColor: '#0c0c0c' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, color: '#9ca3af', letterSpacing: '4px', textTransform: 'uppercase', margin: '0 0 14px 0' }}>Termos e Condições</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'pre-wrap', lineHeight: 1.9, margin: 0 }}>{proposal.terms}</p>
                </div>
              </div>
            )}

            {/* ── SIGNATURE BLOCK ── */}
            <div style={{ padding: '0 40px 48px', marginTop: '350px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', pageBreakInside: 'avoid' }}>
              <div>
                <div style={{ height: '60px' }} />
                <div style={{ borderTop: '2px solid #0c0c0c', paddingTop: '12px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 800, color: '#0c0c0c', margin: '0 0 2px 0' }}>{agencySettings.agencyName}</p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>Prestador de Serviços</p>
                </div>
              </div>
              <div>
                <div style={{ height: '60px' }} />
                <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '12px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 800, color: '#0c0c0c', margin: '0 0 2px 0' }}>{proposal.clientName || 'Nome do Cliente'}</p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>Contratante</p>
                </div>
              </div>
            </div>

            {/* ── FOOTER ── */}
            <div style={{ background: '#0c0c0c', padding: '18px 52px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>
                {agencySettings.agencyName} © {new Date().getFullYear()}
              </p>
              <div style={{ textAlign: 'right' }}>
                {agencySettings.email && <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', margin: '0 0 2px 0' }}>{agencySettings.email}</p>}
                {agencySettings.cnpj && <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', margin: 0 }}>CNPJ: {agencySettings.cnpj}</p>}
              </div>
            </div>

          </div>

          {/* ── MEDIA SECTION ── */}
          {proposal.media.length > 0 && (
            <div ref={mediaSectionRef} style={{ padding: '48px 40px', background: 'white' }}>
              <p style={{ fontSize: '9px', fontWeight: 700, color: '#9ca3af', letterSpacing: '4px', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Referências & Mídia</p>
              <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '32px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {proposal.media.map((m, idx) => (
                  <div key={idx}>
                    <div style={{ aspectRatio: '3/2', width: '100%', maxHeight: '260px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f3f4f6', background: '#f9fafb', marginBottom: '10px' }}>
                      {m.type === 'image' ? (
                        <img src={m.url} alt={m.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#0c0c0c', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', textAlign: 'center' }}>
                          <Play style={{ width: '28px', height: '28px', color: 'white', opacity: 0.15, marginBottom: '8px' }} />
                          <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 6px 0' }}>Conteúdo em Vídeo</p>
                          <p style={{ fontSize: '9px', color: '#818cf8', fontWeight: 600, wordBreak: 'break-all', margin: 0 }}>{m.url}</p>
                        </div>
                      )}
                    </div>
                    {m.caption && (
                      <p style={{ fontSize: '9px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px', lineHeight: 1.4, margin: 0 }}>{m.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
