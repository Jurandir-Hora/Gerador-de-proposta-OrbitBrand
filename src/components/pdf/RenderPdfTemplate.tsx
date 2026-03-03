import React, { ReactNode } from 'react';

interface PdfPageProps {
    children: ReactNode;
    footerText?: string;
    pageNumber?: number;
    className?: string;
    style?: React.CSSProperties;
    darkTheme?: boolean; // Flag explícita - fonte única de verdade para o tema
}

// STABILITY ENGINE RULES APPLIED
export const PdfPage: React.FC<PdfPageProps> = ({
    children,
    footerText,
    pageNumber,
    className = '',          // Sem bg-white default — fundo é controlado via darkTheme
    style: customStyle,
    darkTheme = false
}) => {
    return (
        <div
            data-proposal-preview="true"
            data-pdf-engine="stability"
            data-dark-theme={darkTheme ? 'true' : 'false'}
            className={`pdf-page relative overflow-hidden box-border mx-auto mb-10 shadow-lg print:shadow-none print:mb-0 print:break-after-page ${className}`}
            style={{
                width: '794px',
                height: '1123px',
                paddingTop: '80px',
                paddingBottom: '120px',
                paddingLeft: '70px',
                paddingRight: '70px',
                fontFamily: "'Inter', sans-serif",
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
                // O template decide 100% do fundo via style prop
                ...customStyle
            }}
        >
            {/* Conteúdo */}
            <div className="page-content flex flex-col h-full max-h-full">
                {children}
            </div>

            {/* Rodapé Absoluto — usa darkTheme diretamente */}
            <div
                className="page-footer absolute bottom-[40px] left-[70px] right-[70px] flex justify-between items-center text-[11px] uppercase tracking-widest border-t pt-4 z-50 opacity-60"
                style={{
                    borderColor: darkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                    color: darkTheme ? '#9ca3af' : '#555'
                }}
            >
                <span>{footerText || 'Documento Confidencial'}</span>
                {pageNumber && <span className="font-bold">Página {pageNumber}</span>}
            </div>
        </div>
    );
};
