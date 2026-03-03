import React from 'react';
import { PdfPage } from '../RenderPdfTemplate';
import { Proposal } from '../../../types';

interface TemplateProps {
    proposal: Proposal;
}

export const ExecutiveClean: React.FC<TemplateProps> = ({ proposal }) => {
    return (
        <div className="bg-[#e5e5e5] min-h-screen py-10 flex flex-col items-center">
            {/* PÁGINA 1: CAPA SOBRIA E LIMPA */}
            <PdfPage
                className="bg-neutral-50 text-neutral-900"
                footerText={`${proposal.projectName} • Proposta Comercial`}
                pageNumber={1}
            >
                <div className="pt-20 border-b border-neutral-300 pb-12 mb-20">
                    <p className="text-[10px] tracking-[0.5em] uppercase text-neutral-400 mb-6 font-bold">
                        Dossiê de Planejamento Estratégico
                    </p>
                    <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 leading-tight">
                        {proposal.projectName || 'Digital Solution Plan'}
                    </h1>
                </div>

                <div className="grid grid-cols-2 gap-16">
                    <div className="space-y-12">
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-neutral-400 mb-2">Preparado para</p>
                            <h2 className="text-lg font-medium text-neutral-900 leading-snug">
                                {proposal.clientName}<br />
                                <span className="text-sm font-normal text-neutral-500 italic">{proposal.clientEmail}</span>
                            </h2>
                        </div>
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-neutral-400 mb-2">Status do Documento</p>
                            <span className="inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                                {proposal.status === 'draft' ? 'Rascunho' : 'Documento Final'}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white border border-neutral-200 p-8 rounded-xl shadow-sm self-start mt-10">
                        <p className="text-[9px] uppercase tracking-widest text-neutral-400 mb-2">Data de Emissão</p>
                        <p className="text-xl font-medium text-neutral-900">{new Date().toLocaleDateString('pt-BR')}</p>
                        <div className="mt-8 pt-6 border-t border-neutral-100">
                            <p className="text-[10px] text-neutral-400 leading-relaxed font-italic">
                                Este documento contém informações proprietárias e confidenciais.
                                Qualquer reprodução parcial ou total é vedada.
                            </p>
                        </div>
                    </div>
                </div>
            </PdfPage>

            {/* PÁGINA 2: VALORES & CONTRATO */}
            <PdfPage
                className="bg-white text-neutral-900"
                footerText={`${proposal.projectName} • Executive Clean`}
                pageNumber={2}
            >
                <div className="flex justify-between items-end mb-16">
                    <h2 className="text-2xl font-bold tracking-tight border-b-2 border-neutral-900 pb-2">Investimento Consolidado</h2>
                    <span className="text-[10px] text-neutral-400 font-mono tracking-wider">ID: {proposal.id.substring(0, 13)}</span>
                </div>

                <div className="divide-y divide-neutral-200">
                    {proposal.services.map((service, idx) => (
                        <div key={idx} className="py-6 flex justify-between items-start gap-12 group hover:bg-neutral-50 transition-colors">
                            <div className="max-w-md">
                                <h3 className="font-bold text-neutral-900 mb-1">{service.name}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed">{service.description}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-medium text-neutral-900">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price * service.quantity)}
                                </span>
                                {service.quantity > 1 && <p className="text-[10px] text-neutral-400 uppercase mt-1">Qtde: {service.quantity}</p>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-auto bg-neutral-900 text-white rounded-2xl p-10 flex flex-col sm:flex-row justify-between items-center overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-400 mb-1">Total Geral do Investimento</p>
                        <h4 className="text-3xl font-bold tracking-tight">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total)}
                        </h4>
                    </div>
                    <div className="mt-4 sm:mt-0 text-right">
                        <p className="text-[10px] text-neutral-500 font-medium">Condição Padrão: 50% Entrada + 50% Entrega</p>
                    </div>
                </div>
            </PdfPage>
        </div>
    );
};
