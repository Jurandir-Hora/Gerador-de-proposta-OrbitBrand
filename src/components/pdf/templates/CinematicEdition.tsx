import { PdfPage } from '../RenderPdfTemplate';
import { Proposal, AgencySettings } from '../../../types';

interface TemplateProps {
    proposal: Proposal;
    settings?: AgencySettings;
}

export const CinematicEdition: React.FC<TemplateProps> = ({ proposal, settings }) => {
    return (
        <div style={{ backgroundColor: '#e5e5e5', minHeight: '100%', padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* PÁGINA 1: CAPA */}
            <PdfPage
                style={{ backgroundColor: '#ffffff', color: '#111111' }}
                footerText={`${settings?.agencyName || 'Orbit Brand'} • Cinematic Edition`}
                pageNumber={1}
            >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Header Branding */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px' }}>
                        {settings?.logoUrl ? (
                            <img src={settings.logoUrl} alt={settings.agencyName} style={{ height: '35px', objectFit: 'contain' }} />
                        ) : (
                            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.05em' }}>{settings?.agencyName?.toUpperCase()}</span>
                        )}
                        <span style={{ fontSize: '10px', color: '#6b7280' }}>{settings?.email}</span>
                    </div>
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
                style={{ backgroundColor: '#ffffff', color: '#111111' }}
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
                                    {service.quantity > 1 && <span style={{ color: '#9ca3af', marginLeft: '8px' }}>({service.quantity}x)</span>}
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
