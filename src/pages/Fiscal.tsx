import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Receipt as ReceiptType } from '../types';
import {
    Plus,
    Search,
    Download,
    Trash2,
    FileText,
    Calendar,
    User,
    DollarSign,
    CheckCircle2,
    X,
    CreditCard,
    Smartphone,
    Banknote,
    ArrowRightLeft
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QRCodeCanvas } from 'qrcode.react';

export const Fiscal: React.FC = () => {
    const { receipts, addReceipt, deleteReceipt, agencySettings } = useAppContext();
    const { user } = useAuth();
    const location = useLocation();
    const [isAddingReceipt, setIsAddingReceipt] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [exporting, setExporting] = useState<string | null>(null);
    const receiptPreviewRef = useRef<HTMLDivElement>(null);
    const [selectedReceipt, setSelectedReceipt] = useState<ReceiptType | null>(null);

    const [newReceipt, setNewReceipt] = useState<Omit<ReceiptType, 'id' | 'createdAt' | 'receiptNumber'>>({
        clientName: '',
        clientDocument: '',
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'pix',
        createdBy: user?.id || 'anonymous',
        proposalId: '',
        bankName: agencySettings.bankName || '',
        bankAgency: agencySettings.bankAgency || '',
        bankAccount: agencySettings.bankAccount || '',
        pixKey: agencySettings.pixKey || ''
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const client = params.get('client');
        const email = params.get('doc');
        const docPre = params.get('docPre');
        const amount = params.get('amount');
        const desc = params.get('desc');
        const proposalId = params.get('id');

        if (client || amount || desc) {
            setNewReceipt(prev => ({
                ...prev,
                clientName: client || '',
                clientDocument: docPre || '',
                amount: amount ? parseFloat(amount) : 0,
                description: desc || '',
                proposalId: proposalId || ''
            }));
            setIsAddingReceipt(true);
        }
    }, [location]);

    const filteredReceipts = receipts.filter(r =>
        r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.receiptNumber.includes(searchTerm)
    );

    const handleAddReceipt = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addReceipt(newReceipt);
            setIsAddingReceipt(false);
            setNewReceipt({
                clientName: '',
                clientDocument: '',
                amount: 0,
                description: '',
                date: new Date().toISOString().split('T')[0],
                paymentMethod: 'pix',
                createdBy: user?.id || 'anonymous',
                bankName: agencySettings.bankName || '',
                bankAgency: agencySettings.bankAgency || '',
                bankAccount: agencySettings.bankAccount || '',
                pixKey: agencySettings.pixKey || ''
            });
        } catch (error) {
            alert("Erro ao gerar recibo.");
        }
    };

    const deleteReceiptWithConfirm = async (id: string) => {
        if (window.confirm("Deseja realmente excluir este recibo?")) {
            await deleteReceipt(id);
        }
    };

    const generatePDF = async (receipt: ReceiptType) => {
        setExporting(receipt.id);
        setSelectedReceipt(receipt);

        // Pequeno delay para garantir que o componente de preview seja renderizado com os dados corretos
        setTimeout(async () => {
            if (receiptPreviewRef.current) {
                try {
                    const canvas = await html2canvas(receiptPreviewRef.current, {
                        scale: 2, // Reduzido de 3 para 2 para diminuir o tamanho sem perder tanta nitidez
                        useCORS: true,
                        backgroundColor: '#ffffff',
                        windowWidth: 800
                    });

                    // Mudado para JPEG com compressão de 0.7 (70% de qualidade) - PNG é muito pesado para PDFs com imagens
                    const imgData = canvas.toDataURL('image/jpeg', 0.7);
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const margin = 20;
                    const imgWidth = pdfWidth - (margin * 2);
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;

                    pdf.addImage(imgData, 'JPEG', margin, 20, imgWidth, imgHeight, undefined, 'FAST');

                    // Rodapé decorativo do PDF
                    pdf.setFontSize(8);
                    pdf.setTextColor(150, 150, 150);
                    pdf.text(`Recibo Eletrônico - Gerado por Orbit Brand em ${new Date().toLocaleDateString('pt-BR')}`, margin, pdfHeight - 10);
                    pdf.text(`Autenticação: ${receipt.id.substring(0, 12).toUpperCase()}`, pdfWidth - margin - 50, pdfHeight - 10);

                    pdf.save(`Recibo_${receipt.receiptNumber}_${receipt.clientName.replace(/\s+/g, '_')}.pdf`);
                } catch (error) {
                    console.error("Erro ao gerar PDF:", error);
                    alert("Erro ao gerar PDF.");
                }
            }
            setExporting(null);
            setSelectedReceipt(null);
        }, 500);
    };

    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'pix': return <Smartphone className="w-4 h-4" />;
            case 'credit': return <CreditCard className="w-4 h-4" />;
            case 'cash': return <Banknote className="w-4 h-4" />;
            case 'transfer': return <ArrowRightLeft className="w-4 h-4" />;
            default: return <Smartphone className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-black uppercase tracking-tighter italic">Gestão Fiscal</h1>
                    <p className="text-neutral-500 text-sm mt-1">Gere recibos e comprovantes profissionais para seus clientes.</p>
                </div>
                <button
                    onClick={() => setIsAddingReceipt(true)}
                    className="bg-black text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10"
                >
                    <Plus className="w-4 h-4" /> Novo Recibo
                </button>
            </div>

            {/* Search & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente ou número do recibo..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-neutral-200 rounded-3xl text-sm focus:ring-2 focus:ring-black outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="bg-green-50 border border-green-100 p-4 rounded-3xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-green-600 opacity-70">Total Emitido</p>
                        <p className="text-xl font-black text-green-700">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receipts.reduce((acc, curr) => acc + curr.amount, 0))}
                        </p>
                    </div>
                </div>
            </div>

            {/* Receipts Table */}
            <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Nº Recibo</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Cliente</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Data</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Valor</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Método</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {filteredReceipts.map((receipt) => (
                                <tr key={receipt.id} className="hover:bg-neutral-50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <span className="font-mono text-xs font-bold bg-neutral-100 px-2 py-1 rounded text-neutral-600">
                                            #{receipt.receiptNumber}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div>
                                            <p className="font-black text-sm text-black uppercase tracking-tight">{receipt.clientName}</p>
                                            <p className="text-[10px] text-neutral-500 font-medium">{receipt.clientDocument}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-neutral-500 text-xs">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(receipt.date).toLocaleDateString('pt-BR')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="font-black text-sm text-black">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receipt.amount)}
                                        </p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                                            {getMethodIcon(receipt.paymentMethod)}
                                            {receipt.paymentMethod}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => generatePDF(receipt)}
                                                disabled={exporting === receipt.id}
                                                className="p-2 bg-black text-white rounded-xl hover:scale-110 transition-transform disabled:opacity-50"
                                                title="Baixar PDF"
                                            >
                                                <Download className={`w-4 h-4 ${exporting === receipt.id ? 'animate-bounce' : ''}`} />
                                            </button>
                                            <button
                                                onClick={() => deleteReceiptWithConfirm(receipt.id)}
                                                className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredReceipts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="max-w-xs mx-auto space-y-3">
                                            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
                                                <FileText className="w-8 h-8" />
                                            </div>
                                            <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Nenhum recibo encontrado</p>
                                            <button
                                                onClick={() => setIsAddingReceipt(true)}
                                                className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline"
                                            >
                                                Emitir meu primeiro recibo
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal - Novo Recibo */}
            {isAddingReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-black p-8 flex justify-between items-center text-white">
                            <div>
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Emitir Novo Recibo</h2>
                                <p className="text-neutral-400 text-xs mt-1 uppercase tracking-widest">Preencha os dados do pagamento abaixo</p>
                            </div>
                            <button
                                onClick={() => setIsAddingReceipt(false)}
                                className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddReceipt} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                        <User className="w-3 h-3" /> Nome do Cliente
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all"
                                        placeholder="Ex: João Silva"
                                        value={newReceipt.clientName}
                                        onChange={(e) => setNewReceipt({ ...newReceipt, clientName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                        <FileText className="w-3 h-3" /> CPF ou CNPJ
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all"
                                        placeholder="000.000.000-00"
                                        value={newReceipt.clientDocument}
                                        onChange={(e) => setNewReceipt({ ...newReceipt, clientDocument: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                        <DollarSign className="w-3 h-3" /> Valor do Recebimento (R$)
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold text-lg"
                                        placeholder="R$ 0,00"
                                        value={newReceipt.amount || ''}
                                        onChange={(e) => setNewReceipt({ ...newReceipt, amount: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                        <Calendar className="w-3 h-3" /> Data do Pagamento
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all"
                                        value={newReceipt.date}
                                        onChange={(e) => setNewReceipt({ ...newReceipt, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Método de Pagamento</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {(['pix', 'transfer', 'credit', 'cash'] as const).map((method) => (
                                        <button
                                            key={method}
                                            type="button"
                                            onClick={() => setNewReceipt({ ...newReceipt, paymentMethod: method })}
                                            className={`py-3 px-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${newReceipt.paymentMethod === method
                                                ? 'border-black bg-black text-white shadow-lg'
                                                : 'border-neutral-100 bg-neutral-50 text-neutral-400 hover:border-neutral-300'
                                                }`}
                                        >
                                            {getMethodIcon(method)}
                                            <span className="text-[10px] font-black uppercase tracking-widest">{method}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Referente a (Descrição)</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                                    placeholder="Ex: Pagamento referente à produção de vídeo institucional..."
                                    value={newReceipt.description}
                                    onChange={(e) => setNewReceipt({ ...newReceipt, description: e.target.value })}
                                />
                            </div>

                            <div className="pt-6 border-t border-neutral-100 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddingReceipt(false)}
                                    className="flex-1 py-4 border-2 border-neutral-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-neutral-50 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-green-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-xl shadow-green-200 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Confirmar e Emitir
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Preview Oculto para Impressão */}
            <div className="fixed -left-[9999px] top-0 pointer-events-none">
                {selectedReceipt && (
                    <div
                        ref={receiptPreviewRef}
                        className="w-[800px] bg-white p-16 space-y-12 text-neutral-800 font-sans"
                    >
                        {/* Header Impressão */}
                        <div className="flex justify-between items-start border-b-4 border-black pb-10">
                            <div>
                                {agencySettings.logoUrl ? (
                                    <img src={agencySettings.logoUrl} alt={agencySettings.agencyName} className="h-20 object-contain mb-4" />
                                ) : (
                                    <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-4">{agencySettings.agencyName.split(' ')[0]}</h1>
                                )}
                                <div className="mt-4">
                                    <p className="text-sm font-bold tracking-[0.4em] text-neutral-400 uppercase">Comprovante de Pagamento</p>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <div className="inline-block bg-black text-white px-4 py-2 rounded-lg font-mono text-xl font-bold mb-4">
                                    RECIBO #{selectedReceipt.receiptNumber}
                                </div>
                                <div className="text-xs text-neutral-500 space-y-1 uppercase tracking-widest font-medium">
                                    <p className="font-black text-black">{agencySettings.agencyName}</p>
                                    <p>CNPJ: {agencySettings.cnpj}</p>
                                    <p>{agencySettings.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Corpo do Recibo */}
                        <div className="space-y-10 py-10 bg-neutral-50 px-10 rounded-[40px] border border-neutral-100 italic">
                            <p className="text-2xl leading-relaxed text-black font-medium">
                                Declaramos para os devidos fins que recebemos de <span className="font-black uppercase not-italic underline">{selectedReceipt.clientName}</span>, CPF/CNPJ <span className="font-black not-italic underline">{selectedReceipt.clientDocument}</span>, a importância de:
                            </p>

                            <div className="bg-white p-8 rounded-3xl border-4 border-black inline-block min-w-[300px] shadow-2xl">
                                <span className="text-4xl font-black text-black not-italic">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedReceipt.amount)}
                                </span>
                            </div>

                            <p className="text-xl leading-loose text-neutral-600 border-l-8 border-neutral-200 pl-8">
                                Referente a: <br />
                                <span className="font-black text-black not-italic uppercase tracking-tight">{selectedReceipt.description}</span>
                            </p>
                        </div>

                        {/* Detalhes Técnicos */}
                        <div className="grid grid-cols-2 gap-8 text-sm">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Método de Pagamento</p>
                                <div className="flex items-center gap-3 font-black text-black uppercase">
                                    <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center">
                                        {getMethodIcon(selectedReceipt.paymentMethod)}
                                    </div>
                                    {selectedReceipt.paymentMethod}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Data da Transação</p>
                                <div className="flex items-center gap-3 font-black text-black text-lg">
                                    <div className="w-10 h-10 bg-neutral-100 text-neutral-400 rounded-xl flex items-center justify-center">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    {new Date(selectedReceipt.date).toLocaleDateString('pt-BR')}
                                </div>
                            </div>
                        </div>

                        {/* Dados Bancários e QR Code */}
                        {(selectedReceipt.pixKey || selectedReceipt.bankAccount) && (
                            <div className="pt-10 border-t border-neutral-100 grid grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Instruções de Pagamento</p>
                                    <div className="space-y-3">
                                        {selectedReceipt.bankName && (
                                            <div className="flex justify-between border-b border-neutral-100 pb-2">
                                                <span className="text-xs text-neutral-400 uppercase font-bold">Banco</span>
                                                <span className="text-sm font-black text-black">{selectedReceipt.bankName}</span>
                                            </div>
                                        )}
                                        {selectedReceipt.bankAgency && (
                                            <div className="flex justify-between border-b border-neutral-100 pb-2">
                                                <span className="text-xs text-neutral-400 uppercase font-bold">Agência</span>
                                                <span className="text-sm font-black text-black">{selectedReceipt.bankAgency}</span>
                                            </div>
                                        )}
                                        {selectedReceipt.bankAccount && (
                                            <div className="flex justify-between border-b border-neutral-100 pb-2">
                                                <span className="text-xs text-neutral-400 uppercase font-bold">Conta</span>
                                                <span className="text-sm font-black text-black">{selectedReceipt.bankAccount}</span>
                                            </div>
                                        )}
                                        {selectedReceipt.pixKey && (
                                            <div className="mt-4 p-4 bg-black text-white rounded-2xl">
                                                <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Chave PIX</p>
                                                <p className="text-xs font-mono font-bold break-all">{selectedReceipt.pixKey}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedReceipt.pixKey && (
                                    <div className="flex flex-col items-center justify-center space-y-4 bg-neutral-50 rounded-[40px] p-8 border border-neutral-100">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Escaneie para Pagar</p>
                                        <div className="p-4 bg-white rounded-3xl shadow-xl border-4 border-black">
                                            <QRCodeCanvas
                                                value={selectedReceipt.pixKey}
                                                size={120}
                                                level="H"
                                                includeMargin={false}
                                            />
                                        </div>
                                        <p className="text-[9px] font-black uppercase text-neutral-400">PIX Instantâneo</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Assinatura */}
                        <div className="pt-24 flex flex-col items-center space-y-4">
                            <div className="w-80 h-px bg-black opacity-20"></div>
                            <div className="text-center">
                                <p className="font-black uppercase tracking-widest text-sm">{agencySettings.agencyName}</p>
                                <p className="text-xs text-neutral-400 font-medium">Comprovante gerado eletronicamente em conformidade</p>
                            </div>
                            <div className="pt-8">
                                <CheckCircle2 className="w-12 h-12 text-green-500 opacity-20" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
