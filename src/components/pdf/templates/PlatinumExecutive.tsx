import { PdfPage } from '../RenderPdfTemplate';
import { Proposal, AgencySettings } from '../../../types';

interface TemplateProps {
    proposal: Proposal;
    settings?: AgencySettings;
}

export const PlatinumExecutive: React.FC<TemplateProps> = ({ proposal, settings }) => {
    // Gradiente prata/platina — cópia fiel do LuxuryExecutive com paleta de prata
    const silverGradient = 'linear-gradient(135deg, #f0f0f0 0%, #c0c0c0 40%, #a0a0a0 70%, #e8e8e8 100%)';

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
                style={{ background: silverGradient, color: '#111111' }}
                footerText={`${settings?.agencyName || 'Orbit Brand'} • Platinum Protocol`}
                pageNumber={1}
            >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Branding Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '15px' }}>
                        {settings?.logoUrl ? (
                            <img src={settings.logoUrl} alt={settings.agencyName} style={{ height: '35px', objectFit: 'contain' }} />
                        ) : (
                            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.05em' }}>{settings?.agencyName?.toUpperCase()}</span>
                        )}
                        <span style={{ fontSize: '10px', color: '#555555' }}>{settings?.email}</span>
                    </div>
                    <div style={{ fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '20px', color: '#333333' }}>
                        Proposta Executiva Platinum
                    </div>

                    <h1 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '46px',
                        lineHeight: '1.2',
                        margin: '0 0 40px 0',
                        fontWeight: 700,
                        color: '#111111'
                    }}>
                        {proposal.projectName || 'Produção Cinematográfica de Luxo'}
                    </h1>

                    <div style={{ marginTop: '30px' }}>
                        <h4 style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px', margin: 0, color: '#555555' }}>Cliente</h4>
                        <p style={{ fontSize: '18px', margin: 0, fontWeight: 600, color: '#111111' }}>{proposal.clientName}</p>
                    </div>

                    <div style={{ marginTop: '30px' }}>
                        <h4 style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px', margin: 0, color: '#555555' }}>Data</h4>
                        <p style={{ fontSize: '18px', margin: 0, fontWeight: 600, color: '#111111' }}>{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>
            </PdfPage>

            {/* PÁGINA 2: INVESTIMENTO */}
            <PdfPage
                style={{ background: silverGradient, color: '#111111' }}
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
                                <th style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', paddingBottom: '15px', borderBottom: '1px solid rgba(0, 0, 0, 0.2)', textAlign: 'left', color: '#333333' }}>
                                    Entrega
                                </th>
                                <th style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', paddingBottom: '15px', borderBottom: '1px solid rgba(0, 0, 0, 0.2)', textAlign: 'right', color: '#333333' }}>
                                    Valor
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {proposal.services.map((service, idx) => (
                                <tr key={idx}>
                                    <td style={{ padding: '22px 0', borderBottom: '1px solid rgba(0, 0, 0, 0.15)', fontSize: '14px', color: '#111111' }}>
                                        <div style={{ fontWeight: 600 }}>{service.name}</div>
                                        <div style={{ fontSize: '12px', color: '#555555', marginTop: '4px' }}>{service.description}</div>
                                    </td>
                                    <td style={{ padding: '22px 0', borderBottom: '1px solid rgba(0, 0, 0, 0.15)', fontSize: '14px', textAlign: 'right', fontWeight: 600, color: '#111111' }}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price * (service.quantity || 1))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ marginTop: 'auto', marginBottom: '40px', padding: '35px', border: '2px solid rgba(0, 0, 0, 0.3)', background: 'rgba(255, 255, 255, 0.3)' }}>
                        <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555555' }}>
                            Investimento Total
                        </span>
                        <h2 style={{ fontSize: '32px', margin: '15px 0 0 0', fontWeight: 700, color: '#111111' }}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total)}
                        </h2>
                    </div>
                </div>
            </PdfPage>
        </div>
    );
};
