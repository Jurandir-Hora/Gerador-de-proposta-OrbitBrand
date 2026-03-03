import { PdfPage } from '../RenderPdfTemplate';
import { Proposal, AgencySettings } from '../../../types';

interface TemplateProps {
    proposal: Proposal;
    settings?: AgencySettings;
}

export const ObsidianGradientEdition: React.FC<TemplateProps> = ({ proposal, settings }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* PÁGINA 1 */}
            <PdfPage
                darkTheme={true}
                style={{
                    background: 'linear-gradient(135deg, #0f0f10 0%, #1c1c1f 40%, #0a0a0b 100%)',
                    color: '#ffffff'
                }}
                footerText={`${settings?.agencyName || 'Orbit Brand'} • Obsidian Gradient`}
                pageNumber={1}
            >
                <div style={{ display: 'flex', flexDirection: 'column', color: '#ffffff' }}>

                    {/* Branding Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px' }}>
                        {settings?.logoUrl ? (
                            <img src={settings.logoUrl} alt={settings.agencyName} style={{ height: '35px', objectFit: 'contain' }} />
                        ) : (
                            <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '0.05em' }}>{settings?.agencyName?.toUpperCase()}</span>
                        )}
                        <span style={{ fontSize: '10px', color: '#9ca3af' }}>{settings?.email}</span>
                    </div>

                    <div style={{
                        fontSize: '12px',
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        color: '#9ca3af'
                    }}>
                        Proposta Executiva
                    </div>

                    <h1 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '44px',
                        margin: '20px 0',
                        lineHeight: '1.2',
                        fontWeight: 700,
                        color: '#ffffff'
                    }}>
                        {proposal.projectName || 'Produção Cinematográfica Premium'}
                    </h1>

                    <div style={{
                        marginTop: '40px',
                        fontSize: '14px',
                        lineHeight: '2',
                        color: '#d1d5db'
                    }}>
                        <div><strong style={{ color: '#ffffff' }}>Cliente:</strong> {proposal.clientName}</div>
                        <div><strong style={{ color: '#ffffff' }}>Data:</strong> {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</div>
                    </div>

                </div>
            </PdfPage>

            {/* PÁGINA 2 */}
            <PdfPage
                darkTheme={true}
                style={{
                    background: 'linear-gradient(135deg, #0f0f10 0%, #1c1c1f 40%, #0a0a0b 100%)',
                    color: '#ffffff'
                }}
                footerText="Documento Confidencial • Página 2"
                pageNumber={2}
            >
                <div style={{ display: 'flex', flexDirection: 'column', color: '#ffffff' }}>

                    <div style={{
                        fontSize: '12px',
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        color: '#9ca3af',
                        marginBottom: '25px'
                    }}>
                        Investimento
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{
                                    fontSize: '11px',
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    color: '#9ca3af',
                                    paddingBottom: '15px',
                                    borderBottom: '1px solid rgba(255,255,255,0.15)',
                                    textAlign: 'left'
                                }}>
                                    Entrega
                                </th>
                                <th style={{
                                    fontSize: '11px',
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    color: '#9ca3af',
                                    paddingBottom: '15px',
                                    borderBottom: '1px solid rgba(255,255,255,0.15)',
                                    textAlign: 'right'
                                }}>
                                    Valor
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {proposal.services.map((service, idx) => (
                                <tr key={idx}>
                                    <td style={{
                                        padding: '25px 0',
                                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                                        fontSize: '14px',
                                        color: '#f5f5f5'
                                    }}>
                                        <span style={{ fontWeight: 600 }}>{service.name}</span>
                                        {service.description &&
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#9ca3af',
                                                marginTop: '4px'
                                            }}>
                                                {service.description}
                                            </div>
                                        }
                                    </td>
                                    <td style={{
                                        padding: '25px 0',
                                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                                        fontSize: '14px',
                                        textAlign: 'right',
                                        fontWeight: 600,
                                        color: '#f5f5f5'
                                    }}>
                                        {new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL'
                                        }).format(service.price * (service.quantity || 1))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{
                        marginTop: '50px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '30px'
                    }}>
                        <span style={{
                            fontSize: '11px',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: '#9ca3af'
                        }}>
                            Investimento Total
                        </span>

                        <h2 style={{
                            marginTop: '15px',
                            marginBottom: 0,
                            fontSize: '32px',
                            fontWeight: 700,
                            fontFamily: "'Playfair Display', serif",
                            color: '#ffffff'
                        }}>
                            {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            }).format(proposal.total)}
                        </h2>
                    </div>

                </div>
            </PdfPage>

        </div>
    );
};
