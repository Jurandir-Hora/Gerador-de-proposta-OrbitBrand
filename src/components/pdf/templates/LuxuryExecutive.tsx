import React from 'react';
import { PdfPage } from '../RenderPdfTemplate';
import { Proposal } from '../../../types';

interface TemplateProps {
    proposal: Proposal;
}

export const LuxuryExecutive: React.FC<TemplateProps> = ({ proposal }) => {
    // Definimos o gradiente premium
    const goldGradient = 'linear-gradient(135deg, #f5e6b3 0%, #d4af37 40%, #b8962e 70%, #f0d878 100%)';

    const sectionTitleStyle: React.CSSProperties = {
        fontSize: '12px',
        letterSpacing: '0.35em',
        textTransform: 'uppercase',
        marginBottom: '30px',
        marginTop: '10px',
        color: '#111111'
    };

    return (
        <div style={{ backgroundColor: '#e5e5e5', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* PÁGINA 1: CAPA */}
            <PdfPage
                style={{ background: goldGradient, color: '#111111' }}
                footerText={`Documento Executivo • Página 1`}
                pageNumber={1}
            >
                <div className="flex flex-col h-full text-[#111111]">
                    <div style={{ fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '20px' }}>
                        Proposta Executiva Premium
                    </div>

                    <h1 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '46px',
                        lineHeight: '1.2',
                        margin: '0 0 40px 0',
                        fontWeight: 700
                    }}>
                        {proposal.projectName || 'Produção Cinematográfica de Luxo'}
                    </h1>

                    <div style={{ marginTop: '30px' }}>
                        <h4 style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px', margin: 0 }}>Cliente</h4>
                        <p style={{ fontSize: '18px', margin: 0, fontWeight: 600 }}>{proposal.clientName}</p>
                    </div>

                    <div style={{ marginTop: '30px' }}>
                        <h4 style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px', margin: 0 }}>Data</h4>
                        <p style={{ fontSize: '18px', margin: 0, fontWeight: 600 }}>{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>
            </PdfPage>

            {/* PÁGINA 2: INVESTIMENTO */}
            <PdfPage
                style={{ background: goldGradient, color: '#111111' }}
                footerText={`Documento Executivo • Página 2`}
                pageNumber={2}
            >
                <div className="flex flex-col h-full text-[#111111]">
                    <div style={sectionTitleStyle}>
                        Investimento Estratégico
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '30px' }}>
                        <thead>
                            <tr>
                                <th style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', paddingBottom: '15px', borderBottom: '1px solid rgba(0, 0, 0, 0.2)', textAlign: 'left' }}>
                                    Entrega
                                </th>
                                <th style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', paddingBottom: '15px', borderBottom: '1px solid rgba(0, 0, 0, 0.2)', textAlign: 'right' }}>
                                    Valor
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {proposal.services.map((service, idx) => (
                                <tr key={idx}>
                                    <td style={{ padding: '22px 0', borderBottom: '1px solid rgba(0, 0, 0, 0.15)', fontSize: '14px' }}>
                                        <div style={{ fontWeight: 600 }}>{service.name}</div>
                                        <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>{service.description}</div>
                                    </td>
                                    <td style={{ padding: '22px 0', borderBottom: '1px solid rgba(0, 0, 0, 0.15)', fontSize: '14px', textAlign: 'right', fontWeight: 600 }}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price * (service.quantity || 1))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ marginTop: 'auto', marginBottom: '40px', padding: '35px', border: '2px solid rgba(0, 0, 0, 0.4)', background: 'rgba(255, 255, 255, 0.25)' }}>
                        <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                            Investimento Total
                        </span>
                        <h2 style={{ fontSize: '32px', margin: '15px 0 0 0', fontWeight: 700 }}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total)}
                        </h2>
                    </div>
                </div>
            </PdfPage>
        </div>
    );
};
