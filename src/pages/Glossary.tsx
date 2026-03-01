import React, { useState } from 'react';
import {
    Video,
    TrendingUp,
    Users,
    Search,
    Wind,
    Radio,
    Zap,
    Diamond,
    Camera,
    Mic,
    Home,
    PenTool,
    Type,
    Star,
    Info,
    BookOpen
} from 'lucide-react';

const glossaryItems = [
    {
        category: 'Filmmaking',
        icon: Video,
        color: 'text-indigo-500',
        title: 'Produção Audiovisual (Vídeo)',
        description: 'Focado na criação de conteúdo em vídeo de alto impacto. Ideal para filmes institucionais, vídeos de marca, e produções narrativas.',
        details: [
            'Captação em alta resolução (4K/6K)',
            'Edição e Finalização Profissional',
            'Color Grading avançado',
            'Sound Design'
        ]
    },
    {
        category: 'Tráfego Pago (Ads)',
        icon: TrendingUp,
        color: 'text-green-500',
        title: 'Ads & Performance',
        description: 'Gestão estratégica de anúncios em plataformas como Meta (Instagram/Facebook), Google e TikTok Ads para gerar conversão e visibilidade.',
        details: [
            'Planejamento de Campanha',
            'Segmentação de Público-alvo',
            'Otimização de ROAS (Retorno sobre Gasto)',
            'Relatórios de Performance'
        ]
    },
    {
        category: 'Consultoria de Conteúdo',
        icon: Users,
        color: 'text-blue-500',
        title: 'Estratégia & Criação',
        description: 'Orientação estratégica para posicionamento de marca nas redes sociais, com foco em retenção e engajamento da comunidade.',
        details: [
            'Curadoria de Conteúdo',
            'Linha Editorial',
            'Análise de Métricas',
            'Workshops Criativos'
        ]
    },
    {
        category: 'SEO',
        icon: Search,
        color: 'text-orange-500',
        title: 'Otimização de Redes e Busca',
        description: 'Focado em tornar seu conteúdo encontrável. Aplicado tanto em websites quanto em descrições e títulos de vídeos nas plataformas sociais.',
        details: [
            'Keyword Research',
            'Otimização de Metadados',
            'Análise de Algoritmo',
            'Estratégia de Hashtags'
        ]
    },
    {
        category: 'Captação com Drone',
        icon: Wind,
        color: 'text-sky-500',
        title: 'Imagens Aéreas',
        description: 'Perspectivas únicas capturadas do alto, ideais para eventos, imobiliário, e grandes produções de cinema.',
        details: [
            'Pilotos Certificados',
            'Captação 4K Dinâmica',
            'Vídeos em FPV',
            'Fotos de Alta Resolução'
        ]
    },
    {
        category: 'Transmissão ao Vivo',
        icon: Radio,
        color: 'text-rose-500',
        title: 'Live Streaming',
        description: 'Transmissão profissional de eventos, podcasts ou lançamentos em tempo real para YouTube, Instagram ou plataformas exclusivas.',
        details: [
            'Múltiplas Câmeras',
            'Corte de Switcher ao vivo',
            'Microfonia dedicada',
            'Link de alta estabilidade'
        ]
    },
    {
        category: 'Motion Graphics',
        icon: Zap,
        color: 'text-amber-500',
        title: 'Animação & Motion',
        description: 'Criação de elementos gráficos animados, vinhetas e infográficos dinâmicos que dão vida à identidade visual em vídeos.',
        details: [
            'Animação 2D e 3D',
            'Logos Animados',
            'Explainer Videos',
            'Effects (VFX)'
        ]
    },
    {
        category: 'Conteúdo para Branding',
        icon: Diamond,
        color: 'text-purple-500',
        title: 'Identidade de Marca',
        description: 'Produção focada nos valores e estética da marca, visando construir autoridade e conexão emocional com o público.',
        details: [
            'Moodboarding',
            'Storytelling de Marca',
            'Fotografia de Style',
            'Direção de Arte'
        ]
    },
    {
        category: 'Ativações',
        icon: Camera,
        color: 'text-red-500',
        title: 'Live Experiences',
        description: 'Cobertura de eventos e ativações de marca com entrega rápida de conteúdo (Instant Delivery) para redes sociais.',
        details: [
            'Short-form (Reels/TikTok)',
            'Entrega no mesmo dia',
            'Edição In-loco',
            'Cobertura de Eventos'
        ]
    },
    {
        category: 'Event Tech',
        icon: Mic,
        color: 'text-neutral-500',
        title: 'Soluções Técnicas',
        description: 'Infraestrutura de som, luz e tecnologia para suporte a eventos de diversos portes.',
        details: [
            'Sonorização Profissional',
            'Iluminação Cênica',
            'Painéis de LED',
            'Produção Técnica'
        ]
    },
    {
        category: 'Cenografia',
        icon: Home,
        color: 'text-emerald-500',
        title: 'Ambiente & Set',
        description: 'Desenvolvimento e montagem de cenários para sets de gravação, estúdios ou eventos presenciais.',
        details: [
            'Design de Set',
            'Decoração Estratégica',
            'Montagem e Desmontagem',
            'Estúdios Personalizados'
        ]
    },
    {
        category: 'Identidade Visual',
        icon: PenTool,
        color: 'text-indigo-500',
        title: 'Design Gráfico',
        description: 'Construção da linguagem visual da marca, desde o logo até o manual de identidade e aplicações gráficas.',
        details: [
            'Criação de Logo',
            'Paleta de Cores',
            'Tipografia',
            'Templates para Social'
        ]
    },
    {
        category: 'Redação (Copywriting)',
        icon: Type,
        color: 'text-neutral-400',
        title: 'Texto & Narrativa',
        description: 'Escrita persuasiva e estratégica para anúncios, legendas, roteiros e comunicação interna da marca.',
        details: [
            'Roteirização',
            'Legendas Criativas',
            'Copy para Ads',
            'Ghostwriting'
        ]
    },
    {
        category: 'Influência',
        icon: Star,
        color: 'text-yellow-500',
        title: 'Gestão de Criadores',
        description: 'Consultoria e curadoria de perfis de influência que se conectam com o público-alvo da sua marca.',
        details: [
            'Mapeamento de Perfis',
            'Intermediação',
            'Gestão de Campanhas',
            'Análise de Fit'
        ]
    }
];

export const Glossary: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = glossaryItems.filter(item =>
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-black text-white rounded-lg">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-black text-neutral-900 tracking-tight uppercase">Glossário de Templates</h2>
                    </div>
                    <p className="text-neutral-500 font-medium italic">Entenda os conceitos e o que está incluso em cada categoria da biblioteca Orbit Brand.</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Buscar categoria ou conceito..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-black focus:border-black transition-all outline-none text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item, index) => (
                    <div
                        key={item.category}
                        className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden hover:shadow-2xl hover:border-black transition-all group flex flex-col"
                    >
                        <div className="p-8 flex-1">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-4 bg-neutral-50 rounded-2xl group-hover:bg-neutral-900 transition-colors`}>
                                    <item.icon className={`w-8 h-8 ${item.color} group-hover:text-white transition-colors`} />
                                </div>
                                <span className="px-3 py-1 bg-neutral-100 text-[10px] font-black uppercase tracking-widest text-neutral-500 rounded-full">
                                    Conceito
                                </span>
                            </div>

                            <h3 className="text-xl font-black text-neutral-900 mb-2 uppercase tracking-tight">{item.title}</h3>
                            <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest mb-4">{item.category}</p>

                            <p className="text-neutral-600 text-sm leading-relaxed mb-6 font-medium">
                                {item.description}
                            </p>

                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3 ml-1">O que engloba:</p>
                                {item.details.map((detail, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 group-hover:border-neutral-200 transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-black/20 group-hover:bg-black transition-colors" />
                                        <span className="text-[11px] font-bold text-neutral-700">{detail}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="px-8 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between group-hover:bg-black transition-colors">
                            <div className="flex items-center gap-2">
                                <Info className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white/50" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-white/50">Base de Proposta</span>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-white border border-neutral-200 flex items-center justify-center group-hover:border-white/20 transition-all">
                                <div className="w-1 h-1 rounded-full bg-black" />
                            </div>
                        </div>
                    </div>
                ))}

                {filteredItems.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white border border-dashed border-neutral-200 rounded-[40px]">
                        <BookOpen className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                        <p className="text-neutral-400 font-black uppercase text-xs tracking-widest">Nenhum conceito encontrado</p>
                    </div>
                )}
            </div>

            <div className="bg-neutral-900 rounded-[40px] p-12 text-white overflow-hidden relative">
                <div className="max-w-2xl relative z-10">
                    <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Precisa de um modelo diferente?</h3>
                    <p className="text-neutral-400 leading-relaxed text-sm font-medium">
                        Você pode criar, editar ou excluir estes modelos a qualquer momento no painel de <strong>Configurações</strong> (Acesso Master). O Glossário serve como seu guia técnico para manter a qualidade Orbit Brand em todas as pontas.
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            </div>
        </div>
    );
};
