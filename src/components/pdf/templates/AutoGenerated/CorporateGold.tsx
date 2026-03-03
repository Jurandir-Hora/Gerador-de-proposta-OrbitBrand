import React from 'react';
import { PdfPage } from '../../RenderPdfTemplate';
import { Proposal } from '../../../../types';

interface TemplateProps {
    proposal: Proposal;
}

/**
 * SAMPLE AUTO-GENERATED TEMPLATE (Corporate Gold)
 * SEGUINDO CONTRATO OBRIGATÓRIO (Stability Engine / Skill)
 */
export const CorporateGold: React.FC<TemplateProps> = ({ proposal }) => {
    return (
        <div className="bg-[#e5e5e5] min-h-screen py-10 flex flex-col items-center">
            {/* PÁGINA 1: CAPA CORPORATIVA - IMPACTO E SOBRIEDADE */}
            <PdfPage
                className="bg-[#1a1c23] text-white"
                footerText={`Confidencial • Proposta Corporativa v1.0`}
                pageNumber={1}
            >
                <div className="flex-1 flex flex-col justify-center items-center text-center">
                    <div className="w-[80px] h-[3px] bg-[#d4af37] mb-8"></div>
                    <p style={{ letterSpacing: '0.4em', fontSize: '12px' }} className="uppercase text-[#d4af37] mb-4 font-bold tracking-widest opacity-80">
                        Estratégia de Negócios & Planejamento
                    </p>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '48px', lineHeight: '1.1' }} className="mb-12 font-bold max-w-lg italic">
                        {proposal.projectName || 'Business Growth Strategy'}
                    </h1>

                    <div className="mt-8 border-t border-white/10 pt-8 w-full max-w-xs flex flex-col gap-2">
                        <div className="text-[10px] uppercase font-bold text-neutral-500">Documento Preparado para:</div>
                        <div className="text-lg font-bold">{proposal.clientName}</div>
                        <div className="text-neutral-400 italic text-sm">{proposal.clientEmail}</div>
                    </div>
                </div>
            </PdfPage>

            {/* PÁGINA 2: INVESTIMENTO E CONDIÇÕES */}
            <PdfPage
                className="bg-white text-[#1a1c23]"
                footerText={`Confidencial • Proposta Corporativa v1.0`}
                pageNumber={2}
            >
                <div className="flex justify-between items-end border-b-2 border-[#1a1c23] pb-4 mb-10">
                    <h2 className="text-2xl font-black uppercase tracking-tight">Investimento</h2>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Orbit Brand • {new Date().toLocaleDateString('pt-BR')}</span>
                </div>

                <div className="space-y-6">
                    {proposal.services.map((service, idx) => (
                        <div key={idx} className="flex justify-between items-center py-4 border-b border-neutral-100 group">
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-lg text-[#1a1c23] tracking-tighter uppercase">{service.name}</span>
                                <p className="text-neutral-500 text-sm max-w-[400px] leading-relaxed italic">{service.description}</p>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <span className="text-xl font-black text-[#1a1c23]">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price * service.quantity)}</span>
                                {service.quantity > 1 && <span className="text-[10px] font-bold text-neutral-400">({service.quantity} itens)</span>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-10 border-t-2 border-[#d4af37] flex flex-col items-end">
                    <p className="text-[10px] font-black uppercase text-neutral-400 mb-2 tracking-widest">Total Geral do Projeto</p>
                    <div className="bg-[#1a1c23] text-white px-8 py-4 rounded-xl shadow-2xl">
                        <h3 className="text-3xl font-black italic tracking-tighter text-[#d4af37]">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total)}
                        </h3>
                    </div>
                    <p className="mt-4 text-[10px] font-bold text-neutral-400 italic">Este orçamento tem validade de 15 dias corridos.</p>
                </div>
            </PdfPage>
        </div>
    );
};
