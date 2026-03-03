import React from 'react';
import { PdfPage } from '../RenderPdfTemplate';
import { Proposal } from '../../../types'; // Adjust imports as necessary

interface TemplateProps {
    proposal: Proposal;
}

export const BlackEdition: React.FC<TemplateProps> = ({ proposal }) => {
    // Definimos a cor ouro padrão para reuso
    const GOLD = '#c6a85a';
    const BG_DARK = '#0b0b0c';
    const TEXT_LIGHT = '#f3f4f6';

    const sectionTitleStyle: React.CSSProperties = {
        fontSize: '12px',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: GOLD,
        marginTop: '20px',
        marginBottom: '25px',
        fontWeight: 600
    };

    return (
        <div style={{ backgroundColor: '#222', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* PÁGINA 1: CAPA */}
            <PdfPage
                className="bg-[#0b0b0c] text-[#f3f4f6]"
                style={{ backgroundColor: BG_DARK }}
                footerText={`Documento Confidencial • Página 1`}
                pageNumber={1}
            >
                <div className="flex flex-col h-full" style={{ color: TEXT_LIGHT }}>
                    <div style={{ color: GOLD, fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 800, marginBottom: '20px' }}>
                        Dossiê Executivo Confidencial
                    </div>

                    <h1 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '44px',
                        color: TEXT_LIGHT,
                        marginTop: '20px',
                        marginBottom: '40px',
                        lineHeight: '1.2',
                        fontWeight: 700
                    }}>
                        {proposal.projectName || 'Produção Cinematográfica de Alto Padrão'}
                    </h1>

                    <div style={{ marginTop: 'auto', marginBottom: '80px', fontSize: '14px', lineHeight: '2' }}>
                        <p style={{ margin: 0 }}><strong style={{ color: 'white', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.1em', display: 'inline-block', width: '80px' }}>Cliente:</strong> {proposal.clientName}</p>
                        <p style={{ margin: 0 }}><strong style={{ color: 'white', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.1em', display: 'inline-block', width: '80px' }}>Data:</strong> {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>
            </PdfPage>

            {/* PÁGINA 2: INVESTIMENTO */}
            <PdfPage
                className="bg-[#0b0b0c] text-[#f3f4f6]"
                style={{ backgroundColor: BG_DARK }}
                footerText={`Documento Confidencial • Página 2`}
                pageNumber={2}
            >
                <div className="flex flex-col h-full" style={{ color: TEXT_LIGHT }}>
                    <div style={sectionTitleStyle}>
                        Investimento
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                        <thead>
                            <tr>
                                <th style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9ca3af', paddingBottom: '15px', borderBottom: '1px solid #1f2937', textAlign: 'left' }}>
                                    Entrega
                                </th>
                                <th style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9ca3af', paddingBottom: '15px', borderBottom: '1px solid #1f2937', textAlign: 'right' }}>
                                    Valor
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {proposal.services.map((service, idx) => (
                                <tr key={idx}>
                                    <td style={{ padding: '25px 0', borderBottom: '1px solid #1f2937', fontSize: '14px' }}>
                                        <div style={{ fontWeight: 600 }}>{service.name}</div>
                                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{service.description}</div>
                                    </td>
                                    <td style={{ padding: '25px 0', borderBottom: '1px solid #1f2937', fontSize: '14px', textAlign: 'right', fontWeight: 600 }}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price * (service.quantity || 1))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ marginTop: 'auto', marginBottom: '40px', border: `1px solid ${GOLD}`, padding: '40px', position: 'relative' }}>
                        <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9ca3af', display: 'block', marginBottom: '10px' }}>
                            Investimento Total
                        </span>
                        <h2 style={{ color: GOLD, fontSize: '42px', fontWeight: 700, margin: 0, fontFamily: "'Playfair Display', serif" }}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total)}
                        </h2>
                    </div>
                </div>
            </PdfPage>
        </div>
    );
};
