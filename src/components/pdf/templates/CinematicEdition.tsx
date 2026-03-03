import React from 'react';
import { PdfPage } from '../RenderPdfTemplate';
import { Proposal } from '../../../types';

interface TemplateProps {
    proposal: Proposal;
}

export const CinematicEdition: React.FC<TemplateProps> = ({ proposal }) => {
    return (
        <div className="bg-[#e5e5e5] min-h-screen py-10 flex flex-col items-center">
            {/* PÁGINA 1: CAPA */}
            <PdfPage
                className="bg-white text-[#111111]"
                footerText={`Documento Executivo • Página 1`}
                pageNumber={1}
            >
                <div className="flex-1 flex flex-col pt-10">
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '42px', color: '#111', marginBottom: '20px', lineHeight: '1.2' }}>
                        {proposal.projectName || 'Produção Cinematográfica & Estratégia Social'}
                    </h1>

                    <div style={{ marginTop: '40px', fontSize: '14px', lineHeight: '1.8' }}>
                        <p><strong>Cliente:</strong> {proposal.clientName}</p>
                        <p><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>
            </PdfPage>

            {/* PÁGINA 2: INVESTIMENTO */}
            <PdfPage
                className="bg-white text-[#111111]"
                footerText={`Documento Executivo • Página 2`}
                pageNumber={2}
            >
                <div style={{ color: '#6b7280', fontSize: '12px', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '25px' }}>
                    Investimento
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9ca3af', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                                Entrega
                            </th>
                            <th style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9ca3af', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
                                Valor
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {proposal.services.map((service, idx) => (
                            <tr key={idx}>
                                <td style={{ padding: '25px 0', borderBottom: '1px solid #e5e7eb', fontSize: '14px' }}>
                                    <span style={{ fontWeight: 600 }}>{service.name}</span>
                                    {service.quantity > 1 && <span className="text-[#9ca3af] ml-2">({service.quantity}x)</span>}
                                </td>
                                <td style={{ padding: '25px 0', borderBottom: '1px solid #e5e7eb', fontSize: '14px', textAlign: 'right' }}>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price * (service.quantity || 1))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ marginTop: '50px', border: '1px solid #111', padding: '30px', borderRadius: '2px' }}>
                    <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6b7280' }}>
                        Investimento Total
                    </span>
                    <h2 style={{ fontSize: '32px', fontWeight: 700, marginTop: '15px', fontFamily: "'Playfair Display', serif" }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total)}
                    </h2>
                </div>
            </PdfPage>
        </div>
    );
};
