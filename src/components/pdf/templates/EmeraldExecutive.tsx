import React from 'react';
import { PdfPage } from '../RenderPdfTemplate';
import { Proposal, AgencySettings } from '../../../types';

interface TemplateProps {
    proposal: Proposal;
    settings?: AgencySettings;
}

export const EmeraldExecutive: React.FC<TemplateProps> = ({ proposal, settings }) => {
    // Gradiente Esmeralda profundo para fundo premium
    const emeraldGradient = 'linear-gradient(135deg, #062016 0%, #0a2e20 40%, #041a12 70%, #0d3d2a 100%)';
    const accentGreen = '#10b981'; // Esmeralda vibrante para detalhes

    return (
        <div style={{ backgroundColor: '#e5e5e5', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* PÁGINA 1: CAPA IMPACTANTE */}
            <PdfPage
                darkTheme={true}
                style={{ background: emeraldGradient, color: '#f0fdf4' }}
                footerText={`${settings?.agencyName || 'Orbit Brand'} • Emerald Edition`}
                pageNumber={1}
            >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

                    {/* Branding Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px', borderBottom: '1px solid rgba(16, 185, 129, 0.15)', paddingBottom: '20px' }}>
                        {settings?.logoUrl ? (
                            <img src={settings.logoUrl} alt={settings.agencyName} style={{ height: '35px', objectFit: 'contain' }} />
                        ) : (
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em' }}>
                                {settings?.agencyName?.toUpperCase() || 'ORBIT BRAND'}
                            </div>
                        )}
                        <div style={{ fontSize: '10px', color: '#6ee7b7', textAlign: 'right', fontWeight: 500 }}>
                            {settings?.email}<br />
                            {settings?.phone}
                        </div>
                    </div>

                    <div style={{ borderLeft: `4px solid ${accentGreen}`, paddingLeft: '24px', marginTop: '40px' }}>
                        <div style={{ color: accentGreen, fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>
                            Design & Estratégia Digital
                        </div>
                        <h1 style={{
                            fontFamily: "'Outfit', 'Inter', sans-serif",
                            fontSize: '52px',
                            lineHeight: '1.1',
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            color: '#ffffff',
                            margin: 0
                        }}>
                            {proposal.projectName || 'Luxury Brand Evolution'}
                        </h1>
                    </div>

                    <div style={{ marginBottom: '60px' }}>
                        <div style={{ display: 'flex', gap: '40px' }}>
                            <div>
                                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6ee7b7', marginBottom: '8px' }}>Cliente</p>
                                <p style={{ fontSize: '20px', fontWeight: 600 }}>{proposal.clientName}</p>
                            </div>
                            <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                            <div>
                                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6ee7b7', marginBottom: '8px' }}>Emissão</p>
                                <p style={{ fontSize: '20px', fontWeight: 600 }}>{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </PdfPage>

            {/* PÁGINA 2: INVESTIMENTO DETALHADO */}
            <PdfPage
                darkTheme={true}
                style={{ background: emeraldGradient, color: '#f0fdf4' }}
                footerText={`Proposta Emerald • Página 2`}
                pageNumber={2}
            >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '12px', letterSpacing: '0.3em', textTransform: 'uppercase', color: accentGreen, fontWeight: 'bold' }}>
                            Detalhamento do Investimento
                        </h2>
                        <div style={{ height: '2px', width: '60px', backgroundColor: accentGreen, marginTop: '12px' }}></div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {proposal.services.map((service, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '24px',
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(16, 185, 129, 0.1)',
                                borderRadius: '8px'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', marginBottom: '4px' }}>{service.name}</h3>
                                    <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>{service.description}</p>
                                </div>
                                <div style={{ textAlign: 'right', marginLeft: '32px' }}>
                                    <span style={{ fontSize: '18px', fontWeight: 700, color: accentGreen }}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price * (service.quantity || 1))}
                                    </span>
                                    {service.quantity > 1 && <p style={{ fontSize: '10px', opacity: 0.5 }}>QTDE: {service.quantity}</p>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: 'auto', padding: '40px', background: 'rgba(16, 185, 129, 0.05)', border: `1px dashed ${accentGreen}`, borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6ee7b7' }}>Total do Investimento</p>
                            <h3 style={{ fontSize: '36px', fontWeight: 800, color: '#ffffff', marginTop: '8px' }}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total)}
                            </h3>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: accentGreen, color: '#062016', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                APROVAÇÃO IMEDIATA
                            </div>
                        </div>
                    </div>

                </div>
            </PdfPage>
        </div>
    );
};
