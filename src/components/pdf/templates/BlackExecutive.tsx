import React from 'react';
import { PdfPage } from '../RenderPdfTemplate';
import { Proposal, AgencySettings } from '../../../types';

interface TemplateProps {
    proposal: Proposal;
    settings?: AgencySettings;
}

export const BlackExecutive: React.FC<TemplateProps> = ({ proposal, settings }) => {
    // Gradiente premium extraído do HTML fornecido
    const blackGradient = 'linear-gradient(135deg, #0f0f10 0%, #1a1a1d 40%, #0a0a0c 70%, #141416 100%)';

    const sectionTitleStyle: React.CSSProperties = {
        fontSize: '12px',
        letterSpacing: '0.35em',
        textTransform: 'uppercase',
        marginBottom: '30px',
        marginTop: '10px',
        color: '#d1d5db'
    };

    return (
        <div style={{ backgroundColor: '#e5e5e5', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* PÁGINA 1: CAPA */}
            <PdfPage
                darkTheme={true}
                style={{ background: blackGradient, color: '#f5f5f5' }}
                footerText={`${settings?.agencyName || 'Orbit Brand'} • Black Edition`}
                pageNumber={1}
            >
                <div className="flex flex-col h-full text-[#f5f5f5]">

                    {/* Agencia Branding */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px' }}>
                        {settings?.logoUrl ? (
                            <img src={settings.logoUrl} alt={settings.agencyName} style={{ height: '35px', objectFit: 'contain' }} />
                        ) : (
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                                {settings?.agencyName?.toUpperCase() || 'ORBIT BRAND'}
                            </div>
                        )}
                        <div style={{ fontSize: '10px', color: '#9ca3af', textAlign: 'right' }}>
                            {settings?.email}<br />
                            {settings?.phone || settings?.cnpj}
                        </div>
                    </div>

                    <div style={{
                        fontSize: '11px',
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        marginBottom: '20px',
                        color: '#9ca3af'
                    }}>
                        Proposta Executiva Black
                    </div>

                    <h1 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '46px',
                        lineHeight: '1.2',
                        margin: '0 0 40px 0',
                        fontWeight: 700,
                        color: '#ffffff'
                    }}>
                        {proposal.projectName || 'Produção Cinematográfica Premium'}
                    </h1>

                    <div style={{ marginTop: '30px' }}>
                        <div style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px', color: '#9ca3af' }}>
                            Cliente
                        </div>
                        <p style={{ fontSize: '18px', margin: 0, fontWeight: 600, color: '#ffffff' }}>
                            {proposal.clientName}
                        </p>
                    </div>

                    <div style={{ marginTop: '30px' }}>
                        <div style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px', color: '#9ca3af' }}>
                            Data
                        </div>
                        <p style={{ fontSize: '18px', margin: 0, fontWeight: 600, color: '#ffffff' }}>
                            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                </div>
            </PdfPage>

            {/* PÁGINA 2: INVESTIMENTO */}
            <PdfPage
                darkTheme={true}
                style={{ background: blackGradient, color: '#f5f5f5' }}
                footerText={`Documento Executivo • Página 2`}
                pageNumber={2}
            >
                <div className="flex flex-col h-full text-[#f5f5f5]">

                    <div style={sectionTitleStyle}>
                        Investimento Estratégico
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '30px' }}>
                        <thead>
                            <tr>
                                <th style={{
                                    fontSize: '11px',
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    paddingBottom: '15px',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                                    textAlign: 'left',
                                    color: '#9ca3af'
                                }}>
                                    Entrega
                                </th>
                                <th style={{
                                    fontSize: '11px',
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    paddingBottom: '15px',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                                    textAlign: 'right',
                                    color: '#9ca3af'
                                }}>
                                    Valor
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {proposal.services.map((service, idx) => (
                                <tr key={idx}>
                                    <td style={{
                                        padding: '22px 0',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                                        fontSize: '14px',
                                        color: '#f5f5f5'
                                    }}>
                                        <div style={{ fontWeight: 600 }}>{service.name}</div>
                                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                                            {service.description}
                                        </div>
                                    </td>
                                    <td style={{
                                        padding: '22px 0',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                                        fontSize: '14px',
                                        textAlign: 'right',
                                        fontWeight: 600,
                                        color: '#ffffff'
                                    }}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                                            .format(service.price * (service.quantity || 1))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{
                        marginTop: 'auto',
                        marginBottom: '40px',
                        padding: '35px',
                        border: '2px solid rgba(255, 255, 255, 0.25)',
                        background: 'rgba(255, 255, 255, 0.05)'
                    }}>
                        <div style={{
                            fontSize: '11px',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: '#9ca3af'
                        }}>
                            Investimento Total
                        </div>
                        <div style={{
                            fontSize: '32px',
                            marginTop: '15px',
                            fontWeight: 700,
                            color: '#ffffff',
                            fontFamily: "'Playfair Display', serif"
                        }}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                                .format(proposal.total)}
                        </div>
                    </div>

                </div>
            </PdfPage>
        </div>
    );
};
