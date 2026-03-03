import React from 'react';
import { PdfPage } from '../RenderPdfTemplate';
import { Proposal, AgencySettings } from '../../../types';

interface TemplateProps {
    proposal: Proposal;
    settings?: AgencySettings;
}

export const SapphireExecutive: React.FC<TemplateProps> = ({ proposal, settings }) => {
    // Gradiente Safira Profundo com toque de modernidade
    const sapphireGradient = 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #020617 70%, #1e3a8a 100%)';
    const accentBlue = '#38bdf8'; // Azul Celeste vibrante para detalhes

    return (
        <div style={{ backgroundColor: '#e5e5e5', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* PÁGINA 1: CAPA TECNOLÓGICA E PREMIUM */}
            <PdfPage
                darkTheme={true}
                style={{ background: sapphireGradient, color: '#f0f9ff' }}
                footerText={`${settings?.agencyName || 'Orbit Brand'} • Sapphire Protocol`}
                pageNumber={1}
            >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>

                    {/* Header: Identity */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
                        {settings?.logoUrl ? (
                            <img src={settings.logoUrl} alt={settings.agencyName} style={{ height: '40px', objectFit: 'contain' }} />
                        ) : (
                            <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '0.1em', color: '#ffffff' }}>
                                {settings?.agencyName?.toUpperCase() || 'ORBIT BRAND'}
                            </div>
                        )}
                        <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'right', fontWeight: 500 }}>
                            {settings?.email || 'contato@agencia.com'}<br />
                            {settings?.phone || '(00) 00000-0000'}
                        </div>
                    </div>

                    {/* Elemento Decorativo Lateral */}
                    <div style={{ position: 'absolute', top: '0', left: '-70px', width: '4px', height: '100%', background: `linear-gradient(to bottom, transparent, ${accentBlue}, transparent)` }}></div>

                    <div style={{ marginBottom: '40px' }}>
                        <div style={{ color: accentBlue, fontSize: '10px', letterSpacing: '0.5em', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 800 }}>
                            Strategic Transformation
                        </div>
                        <h1 style={{
                            fontFamily: "'Outfit', 'Inter', sans-serif",
                            fontSize: '56px',
                            lineHeight: '1',
                            fontWeight: 900,
                            letterSpacing: '-0.04em',
                            color: '#ffffff',
                            margin: 0,
                            maxWidth: '500px'
                        }}>
                            {proposal.projectName || 'Next Gen Business Scaling'}
                        </h1>
                    </div>

                    <div style={{ height: '1px', width: '100%', backgroundColor: 'rgba(56, 189, 248, 0.2)', margin: '40px 0' }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '8px' }}>Partner Client</p>
                            <p style={{ fontSize: '22px', fontWeight: 600, color: '#ffffff' }}>{proposal.clientName}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '8px' }}>Security ID</p>
                            <p style={{ fontSize: '14px', fontFamily: 'monospace', color: accentBlue }}>{proposal.id.substring(0, 12).toUpperCase()}</p>
                        </div>
                    </div>

                </div>
            </PdfPage>

            {/* PÁGINA 2: ESTRUTURA DE INVESTIMENTO */}
            <PdfPage
                darkTheme={true}
                style={{ background: sapphireGradient, color: '#f0f9ff' }}
                footerText={`Sapphire Protocol • Strategic Investment`}
                pageNumber={2}
            >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

                    <div style={{ marginBottom: '50px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', margin: 0 }}>Investment Roadmap</h2>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(56, 189, 248, 0.15)' }}></div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {proposal.services.map((service, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '24px',
                                backgroundColor: 'rgba(255,255,255,0.02)',
                                borderRadius: '12px',
                                border: '1px solid rgba(56, 189, 248, 0.08)'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#ffffff', marginBottom: '6px' }}>{service.name}</h3>
                                    <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>{service.description}</p>
                                </div>
                                <div style={{ textAlign: 'right', marginLeft: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: accentBlue }}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price * (service.quantity || 1))}
                                    </div>
                                    <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#64748b', marginTop: '4px', letterSpacing: '0.1em' }}>
                                        Validated Service
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', padding: '40px', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '20px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                        <div>
                            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94a3b8', marginBottom: '4px' }}>Total Project Value</p>
                            <h3 style={{ fontSize: '38px', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total)}
                            </h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '12px', color: accentBlue, fontWeight: 600, marginBottom: '4px' }}>Strategic Terms Applied</p>
                                <p style={{ fontSize: '10px', color: '#64748b' }}>Custom payment conditions included</p>
                            </div>
                        </div>
                    </div>

                </div>
            </PdfPage>
        </div>
    );
};
