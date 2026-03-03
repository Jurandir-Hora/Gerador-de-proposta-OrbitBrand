import React, { ReactNode } from 'react';

interface PdfPageProps {
    children: ReactNode;
    footerText?: string;
    pageNumber?: number;
    className?: string; // Permitir injeção de fundos escuros, etc.
    style?: React.CSSProperties; // Permitir override total de estilo
}

// STABILITY ENGINE RULES APPLIED
export const PdfPage: React.FC<PdfPageProps> = ({ children, footerText, pageNumber, className = 'bg-white text-black', style: customStyle }) => {
    return (
        <div
            data-proposal-preview="true"
            data-pdf-engine="stability"
            className={`pdf-page relative overflow-hidden box-border mx-auto mb-10 shadow-lg print:shadow-none print:mb-0 print:break-after-page ${className}`}
            style={{
                width: '794px',
                height: '1123px',       // Altura fixa A4
                paddingTop: '80px',     // Padding superior mínimo de 80px
                paddingBottom: '120px', // Padding inferior alinhado aos exemplos
                paddingLeft: '70px',
                paddingRight: '70px',
                fontFamily: "'Inter', sans-serif",
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
                backgroundColor: customStyle?.backgroundColor || 'white', // Garantir que o fundo base seja o do estilo
                ...customStyle
            }}
        >
            {/* Wrapper de conteúdo para consumir o espaço mas não estourar a div pai */}
            <div className="page-content flex flex-col h-full max-h-full">
                {children}
            </div>

            {/* Rodapé Absoluto fixo */}
            <div
                className="page-footer absolute bottom-[40px] left-[70px] right-[70px] flex justify-between items-center text-[11px] uppercase tracking-widest border-t pt-4 z-50 opacity-60"
                style={{
                    borderColor: (customStyle?.backgroundColor === '#0b0b0c') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    color: (customStyle?.backgroundColor === '#0b0b0c') ? '#9ca3af' : '#666'
                }}
            >
                <span>{footerText || 'Documento Confidencial'}</span>
                {pageNumber && <span className="font-bold">Página {pageNumber}</span>}
            </div>
        </div>
    );
};
