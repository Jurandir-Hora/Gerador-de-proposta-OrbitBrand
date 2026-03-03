import { PdfPage } from '../RenderPdfTemplate';
import { Proposal, AgencySettings } from '../../../types';

interface TemplateProps {
    proposal: Proposal;
    settings?: AgencySettings;
}

export const ExecutiveClean: React.FC<TemplateProps> = ({ proposal, settings }) => {
    return (
        <div style={{ backgroundColor: '#e5e5e5', minHeight: '100%', padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* PÁGINA 1: CAPA SOBRIA E LIMPA */}
            <PdfPage
                style={{ backgroundColor: '#fafafa', color: '#171717' }}
                footerText={`${settings?.agencyName || 'Orbit Brand'} • Proposta Comercial`}
                pageNumber={1}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    {settings?.logoUrl ? (
                        <img src={settings.logoUrl} alt={settings.agencyName} style={{ height: '30px', objectFit: 'contain' }} />
                    ) : (
                        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{settings?.agencyName}</span>
                    )}
                    <span style={{ fontSize: '10px', color: '#a3a3a3' }}>{settings?.email}</span>
                </div>
                <div style={{ paddingTop: '80px', borderBottom: '1px solid #d4d4d4', paddingBottom: '48px', marginBottom: '80px' }}>
                    <p style={{ fontSize: '10px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: '24px', fontWeight: 'bold' }}>
                        Dossiê de Planejamento Estratégico
                    </p>
                    <h1 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.025em', color: '#171717', lineHeight: '1.2' }}>
                        {proposal.projectName || 'Digital Solution Plan'}
                    </h1>
                </div>

                <div style={{ display: 'flex', gap: '64px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '48px' }}>
                        <div>
                            <p style={{ fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: '8px' }}>Preparado para</p>
                            <h2 style={{ fontSize: '18px', fontWeight: 500, color: '#171717', lineHeight: '1.4' }}>
                                {proposal.clientName}<br />
                                <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#737373', fontStyle: 'italic' }}>{proposal.clientEmail}</span>
                            </h2>
                        </div>
                        <div>
                            <p style={{ fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: '8px' }}>Status do Documento</p>
                            <span style={{ display: 'inline-flex', padding: '4px 12px', borderRadius: '9999px', backgroundColor: '#dbeafe', color: '#1e40af', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {proposal.status === 'draft' ? 'Rascunho' : 'Documento Final'}
                            </span>
                        </div>
                    </div>

                    <div style={{ flex: 1, backgroundColor: '#ffffff', border: '1px solid #e5e5e5', padding: '32px', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', alignSelf: 'start', marginTop: '40px' }}>
                        <p style={{ fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: '8px' }}>Data de Emissão</p>
                        <p style={{ fontSize: '20px', fontWeight: 500, color: '#171717' }}>{new Date().toLocaleDateString('pt-BR')}</p>
                        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f5f5f5' }}>
                            <p style={{ fontSize: '10px', color: '#a3a3a3', lineHeight: '1.6', fontStyle: 'italic' }}>
                                Este documento contém informações proprietárias e confidenciais.
                                Qualquer reprodução parcial ou total é vedada.
                            </p>
                        </div>
                    </div>
                </div>
            </PdfPage>

            {/* PÁGINA 2: VALORES & CONTRATO */}
            <PdfPage
                style={{ backgroundColor: '#ffffff', color: '#171717' }}
                footerText={`${proposal.projectName} • Executive Clean`}
                pageNumber={2}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '64px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '-0.025em', borderBottom: '2px solid #171717', paddingBottom: '8px' }}>Investimento Consolidado</h2>
                    <span style={{ fontSize: '10px', color: '#a3a3a3', fontFamily: 'monospace', letterSpacing: '0.05em' }}>ID: {proposal.id.substring(0, 13)}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {proposal.services.map((service, idx) => (
                        <div key={idx} style={{ padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '48px', borderBottom: '1px solid #e5e5e5' }}>
                            <div style={{ maxWidth: '448px' }}>
                                <h3 style={{ fontWeight: 'bold', color: '#171717', marginBottom: '4px' }}>{service.name}</h3>
                                <p style={{ fontSize: '14px', color: '#737373', lineHeight: '1.6' }}>{service.description}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '18px', fontWeight: 500, color: '#171717' }}>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price * (service.quantity || 1))}
                                </span>
                                {service.quantity > 1 && <p style={{ fontSize: '10px', color: '#a3a3a3', textTransform: 'uppercase', marginTop: '4px' }}>Qtde: {service.quantity}</p>}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 'auto', backgroundColor: '#171717', color: '#ffffff', borderRadius: '16px', padding: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '128px', height: '128px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '9999px', marginRight: '-40px', marginTop: '-40px', filter: 'blur(32px)' }}></div>
                    <div>
                        <p style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.4em', color: '#a3a3a3', marginBottom: '4px' }}>Total Geral do Investimento</p>
                        <h4 style={{ fontSize: '30px', fontWeight: 'bold', letterSpacing: '-0.025em' }}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total)}
                        </h4>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '10px', color: '#737373', fontWeight: 500 }}>Condição Padrão: 50% Entrada + 50% Entrega</p>
                    </div>
                </div>
            </PdfPage>
        </div>
    );
};

