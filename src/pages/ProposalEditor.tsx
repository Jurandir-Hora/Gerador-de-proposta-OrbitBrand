import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Proposal, ServiceItem } from '../types';
import { Save, ArrowLeft, Trash2, Plus, Printer, Share2, FileDown, Image, Link as LinkIcon, Play, Upload, Type } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DynamicProposalRenderer, TEMPLATE_REGISTRY, getTemplateLabel, resolveTemplate } from '../components/pdf/TemplateManager';
import { Palette, Sparkles, BrainCircuit } from 'lucide-react';

export const ProposalEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProposal, updateProposal, loading: contextLoading, agencySettings } = useAppContext();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'services' | 'terms' | 'media' | 'design'>('details');
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

      const capturePdfPages = async (container: HTMLElement, startPage: number) => {
        const pages = container.querySelectorAll('.pdf-page');
        let currentPage = startPage;

        if (pages.length > 0) {
          // Nova lógica: captura cada página individualmente garantindo fidelidade total
          for (let i = 0; i < pages.length; i++) {
            if (currentPage > 1) pdf.addPage();

            const pageEl = pages[i] as HTMLElement;
            const originalBg = pageEl.style.backgroundColor || window.getComputedStyle(pageEl).backgroundColor;
            const isDark = originalBg === 'rgb(11, 11, 12)' || originalBg === '#0b0b0c' || pageEl.className.includes('bg-[#0b0b0c]');

            const canvas = await html2canvas(pageEl, {
              scale: 3, // Qualidade Retina
              useCORS: true,
              backgroundColor: isDark ? '#0b0b0c' : '#ffffff',
              logging: false,
              allowTaint: true,
              scrollX: 0,
              scrollY: 0,
              width: pageEl.offsetWidth,
              height: pageEl.offsetHeight
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);

            // Inserir imagem preenchendo a folha A4 completa
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

            // Adicionar informações extras sutilmente no topo para não quebrar o layout inferior
            pdf.setFontSize(6);
            pdf.setTextColor(isDark ? 100 : 180, isDark ? 100 : 180, isDark ? 100 : 180); // Cinza discreto que não queima
            pdf.text(`AUTENTICAÇÃO: ${proposalNumber}-${proposal.id.substring(0, 4)}`, margin, 5);
            pdf.text(today, pdfWidth - margin - 15, 5);

            currentPage++;
          }
          return currentPage;
        } else {
          // Fallback (lógica antiga fatiada para conteúdo sem motor stability, ex: mídia isolada)
          return await captureFallback(container, startPage);
        }
      };

      const captureFallback = async (element: HTMLElement, startPage: number) => {
        const isDark = element.innerHTML.includes('#0b0b0c');
        const canvas = await html2canvas(element, {
          scale: 3,
          useCORS: true,
          backgroundColor: isDark ? '#0b0b0c' : '#ffffff',
          logging: false
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const imgWidth = pdfWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let currentPage = startPage;
        let position = 0;

        while (heightLeft > 0) {
          if (currentPage > startPage) pdf.addPage();
          pdf.addImage(imgData, 'JPEG', margin, margin - position, imgWidth, imgHeight, undefined, 'FAST');
          position += pageContentHeight;
          heightLeft -= pageContentHeight;
          if (heightLeft > 5) currentPage++;
        }
        return currentPage;
      };

      // Parte 1: Conteúdo Principal usando a inteligência de paginação
      let lastPage = await capturePdfPages(mainContentRef.current, 1);

      // Parte 2: Mídia (Se existir) - não usa pdf-page, então falha para o slice
      if (proposal.media.length > 0 && mediaSectionRef.current) {
        lastPage = await captureFallback(mediaSectionRef.current, lastPage);
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
          <button
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'design' ? 'border-black text-black' : 'border-transparent text-neutral-500 hover:text-black'}`}
            onClick={() => setActiveTab('design')}
          >
            Design
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

          {activeTab === 'design' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-indigo-500 rounded-xl shadow-lg">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-indigo-900 uppercase text-sm tracking-tight">Identidade Visual da Proposta</h3>
                  <p className="text-indigo-600 text-xs">Escolha como o cliente verá sua proposta ou deixe a IA decidir.</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Modo de Seleção</label>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setProposal({ ...proposal!, templateId: '' })}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${!proposal?.templateId ? 'border-black bg-neutral-900 text-white shadow-xl' : 'border-neutral-100 bg-neutral-50 text-neutral-500'}`}
                  >
                    <div className="flex items-center gap-3">
                      <BrainCircuit className={`w-5 h-5 ${!proposal?.templateId ? 'text-indigo-400' : 'text-neutral-300'}`} />
                      <div className="text-left">
                        <p className="font-black uppercase text-xs">Automático (DLI)</p>
                        <p className="text-[10px] opacity-60">A inteligência decide baseada no ticket e projeto.</p>
                      </div>
                    </div>
                    {!proposal?.templateId && <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />}
                  </button>

                  <div className="pt-4 border-t border-neutral-100">
                    <label className="block text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-3 ml-1">Seleção Manual (Override)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.keys(TEMPLATE_REGISTRY).map(id => (
                        <button
                          key={id}
                          onClick={() => setProposal({ ...proposal!, templateId: id })}
                          className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left ${proposal?.templateId === id ? 'border-black bg-white ring-2 ring-black/5' : 'border-neutral-100 hover:border-neutral-200'}`}
                        >
                          <span className="font-black text-xs uppercase mb-1">{getTemplateLabel(id)}</span>
                          <span className="text-[9px] text-neutral-400">ID: {id}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {!proposal?.templateId && (
                <div className="bg-neutral-900 text-white p-6 rounded-2xl shadow-lg animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <p className="font-black uppercase text-[10px] tracking-widest text-indigo-400">Sugestão da Inteligência</p>
                  </div>
                  <p className="text-sm border-l-2 border-indigo-500 pl-4 py-1 italic text-neutral-300">
                    Com base no valor de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal?.total || 0)}, o template sugerido é <strong>{getTemplateLabel(resolveTemplate(proposal!, agencySettings))}</strong>.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview Side - Using the Stability Engine via DynamicProposalRenderer */}
      <div className="absolute -left-[9999px] opacity-0 lg:static lg:opacity-100 w-1/2 bg-neutral-200 border border-neutral-300 rounded-xl lg:rounded-r-xl lg:rounded-l-none p-4 lg:p-8 overflow-auto print:p-0 print:border-0 print:w-full">
        <div
          ref={mainContentRef}
          className="shadow-2xl mx-auto w-[794px] print:shadow-none print:w-full"
        >
          <DynamicProposalRenderer proposal={proposal} settings={agencySettings} />
        </div>
      </div>
    </div>
  );
};
