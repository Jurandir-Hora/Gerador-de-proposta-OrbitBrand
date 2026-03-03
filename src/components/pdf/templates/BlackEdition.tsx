import { PdfPage } from '../RenderPdfTemplate';
import { Proposal, AgencySettings } from '../../../types';

interface TemplateProps {
    proposal: Proposal;
    settings?: AgencySettings;
}

export const BlackEdition: React.FC<TemplateProps> = ({ proposal, settings }) => {
    return (
        <div style={{ backgroundColor: '#e5e5e5', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* PÁGINA 1: CAPA */}
            <PdfPage
                darkTheme={true}
                style={{ backgroundColor: '#0b0b0c', color: '#f3f4f6' }}
                footerText={`${settings?.agencyName || 'Orbit Brand'} • Black Edition`}
                pageNumber={1}
            >
                <div style={{ display: 'flex', flexDirection: 'column', color: '#ffffff', height: '100%' }}>
                    {/* Agencia Branding */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px', borderBottom: '1px solid #1f2937', paddingBottom: '20px' }}>
                        {settings?.logoUrl ? (
                            <img src={settings.logoUrl} alt={settings.agencyName} style={{ height: '35px', objectFit: 'contain' }} />
                        ) : (
                            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.05em' }}>{settings?.agencyName?.toUpperCase()}</span>
                        )}
                        <span style={{ fontSize: '10px', color: '#9ca3af' }}>{settings?.email}</span>
                    </div>
                    {/* Rótulo dourado */}
                    <div style={{ color: '#c6a85a', fontSize: '12px', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                        Dossiê Executivo Confidencial
                    </div>

                    {/* Título principal */}
                    <h1 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '44px',
                        margin: '20px 0',
                        lineHeight: '1.2',
                        fontWeight: 700,
                        color: '#f3f4f6'
                    }}>
                        {proposal.projectName || 'Produção Cinematográfica de Alto Padrão'}
                    </h1>

                    {/* Dados do cliente */}
                    <div style={{ marginTop: '40px', fontSize: '14px', lineHeight: '2' }}>
                        <div><strong style={{ color: '#f3f4f6' }}>Cliente:</strong> {proposal.clientName}</div>
                        <div><strong style={{ color: '#f3f4f6' }}>Data:</strong> {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</div>
                    </div>
                </div>
            </PdfPage>

            {/* PÁGINA 2: INVESTIMENTO */}
            <PdfPage
                darkTheme={true}
                className="!text-white"
                style={{ backgroundColor: '#0b0b0c', color: '#f3f4f6' }}
                footerText="Documento Confidencial • Página 2"
                pageNumber={2}
            >
                <div style={{ display: 'flex', flexDirection: 'column', color: '#ffffff' }}>
                    {/* Título da seção */}
                    <div style={{
                        fontSize: '12px',
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        color: '#c6a85a',
                        marginTop: '20px',
                        marginBottom: '25px'
                    }}>
                        Investimento
                    </div>

                    {/* Tabela */}
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{
                                    fontSize: '11px',
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    color: '#9ca3af',
                                    paddingBottom: '15px',
                                    borderBottom: '1px solid #1f2937',
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
                                    borderBottom: '1px solid #1f2937',
                                    textAlign: 'right'
                                }}>
                                    Valor
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {proposal.services.map((service, idx) => (
                                <tr key={idx}>
                                    <td style={{ padding: '25px 0', borderBottom: '1px solid #1f2937', fontSize: '14px', color: '#f3f4f6' }}>
                                        <span style={{ fontWeight: 600 }}>{service.name}</span>
                                        {service.description ? <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{service.description}</div> : null}
                                    </td>
                                    <td style={{ padding: '25px 0', borderBottom: '1px solid #1f2937', fontSize: '14px', textAlign: 'right', color: '#f3f4f6', fontWeight: 600 }}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price * (service.quantity || 1))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Total */}
                    <div style={{ marginTop: '50px', border: '1px solid #c6a85a', padding: '30px' }}>
                        <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9ca3af' }}>
                            Investimento Total
                        </span>
                        <h2 style={{
                            color: '#c6a85a',
                            marginTop: '15px',
                            marginBottom: 0,
                            fontSize: '32px',
                            fontWeight: 700,
                            fontFamily: "'Playfair Display', serif"
                        }}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total)}
                        </h2>
                    </div>
                </div>
            </PdfPage>
        </div>
    );
};
