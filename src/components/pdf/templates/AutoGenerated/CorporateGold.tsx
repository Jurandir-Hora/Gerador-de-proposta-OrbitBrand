import { PdfPage } from '../../RenderPdfTemplate';
import { Proposal, AgencySettings } from '../../../../types';

interface TemplateProps {
    proposal: Proposal;
    settings?: AgencySettings;
}

/**
 * SAMPLE AUTO-GENERATED TEMPLATE (Corporate Gold)
 * SEGUINDO CONTRATO OBRIGATÓRIO (Stability Engine / Skill)
 */
export const CorporateGold: React.FC<TemplateProps> = ({ proposal, settings }) => {
    return (
        <div style={{ backgroundColor: '#e5e5e5', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* PÁGINA 1: CAPA CORPORATIVA */}
            <PdfPage
                darkTheme={true}
                style={{ backgroundColor: '#1a1c23', color: '#ffffff' }}
                footerText={`${settings?.agencyName || 'Orbit Brand'} • Proposta Corporativa`}
                pageNumber={1}
            >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', textAlign: 'center' }}>

                    {/* Header Branding */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '80px', paddingTop: '20px' }}>
                        {settings?.logoUrl ? (
                            <img src={settings.logoUrl} alt={settings.agencyName} style={{ height: '40px', objectFit: 'contain' }} />
                        ) : (
                            <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '0.1em', color: '#d4af37' }}>
                                {settings?.agencyName?.toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div style={{ width: '80px', height: '3px', backgroundColor: '#d4af37', marginBottom: '32px' }}></div>
                    <p style={{ letterSpacing: '0.4em', fontSize: '12px', textTransform: 'uppercase', color: '#d4af37', marginBottom: '16px', fontWeight: 'bold' }}>
                        Estratégia de Negócios & Planejamento
                    </p>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '48px', lineHeight: '1.1', marginBottom: '48px', fontWeight: 'bold', fontStyle: 'italic' }}>
                        {proposal.projectName || 'Business Growth Strategy'}
                    </h1>

                    <div style={{ marginTop: '32px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px', width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: '#a3a3a3' }}>Documento Preparado para:</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{proposal.clientName}</div>
                        <div style={{ color: '#a3a3a3', fontStyle: 'italic', fontSize: '14px' }}>{proposal.clientEmail}</div>
                    </div>
                </div>
            </PdfPage>

            {/* PÁGINA 2: INVESTIMENTO E CONDIÇÕES */}
            <PdfPage
                style={{ backgroundColor: '#ffffff', color: '#1a1c23' }}
                footerText={`Confidencial • Proposta Corporativa v1.0`}
                pageNumber={2}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #1a1c23', paddingBottom: '16px', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Investimento</h2>
                    <span style={{ fontSize: '10px', color: '#a3a3a3', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Orbit Brand • {new Date().toLocaleDateString('pt-BR')}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {proposal.services.map((service, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f5f5f5' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#1a1c23', textTransform: 'uppercase' }}>{service.name}</span>
                                <p style={{ color: '#737373', fontSize: '14px', maxWidth: '400px', lineHeight: '1.5', fontStyle: 'italic' }}>{service.description}</p>
                            </div>
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span style={{ fontSize: '20px', fontWeight: 900, color: '#1a1c23' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price * (service.quantity || 1))}</span>
                                {service.quantity > 1 && <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#a3a3a3' }}>({service.quantity} itens)</span>}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '40px', borderTop: '2px solid #d4af37', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#a3a3a3', marginBottom: '8px', letterSpacing: '0.1em' }}>Total Geral do Projeto</p>
                    <div style={{ backgroundColor: '#1a1c23', color: '#ffffff', padding: '16px 32px', borderRadius: '12px' }}>
                        <h3 style={{ fontSize: '30px', fontWeight: 900, fontStyle: 'italic', color: '#d4af37' }}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total)}
                        </h3>
                    </div>
                </div>
            </PdfPage>
        </div>
    );
};

