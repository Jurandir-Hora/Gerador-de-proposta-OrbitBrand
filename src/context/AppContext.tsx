import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Proposal, Template } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AppContextType {
  proposals: Proposal[];
  templates: Template[];
  addProposal: (proposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'views'>) => void;
  updateProposal: (id: string, proposal: Partial<Proposal>) => void;
  deleteProposal: (id: string) => void;
  getProposal: (id: string) => Proposal | undefined;
}

const defaultTemplates: Template[] = [
  {
    id: 't-filmmaking',
    name: 'Produção Audiovisual',
    category: 'Filmmaking',
    description: 'Proposta completa para produção de vídeos institucionais, comerciais ou documentários.',
    defaultServices: [
      { id: '1', name: 'Diária de Gravação', description: 'Gravação com equipe completa (Câmera, Áudio, Iluminação)', price: 3500, quantity: 1 },
      { id: '2', name: 'Edição de Vídeo', description: 'Edição, color grading e mixagem de áudio (por minuto final)', price: 1200, quantity: 1 }
    ],
    defaultTerms: '1. O pagamento deve ser realizado com 50% de sinal e 50% na entrega.\n2. Inclusas 2 rodadas de alterações gratuitas.'
  },
  {
    id: 't-mobile',
    name: 'Mobile Filmmaking',
    category: 'Mobile',
    description: 'Vídeos dinâmicos gravados em formato vertical focados para Reels e TikTok.',
    defaultServices: [
      { id: '1', name: 'Captação Mobile', description: 'Gravação com smartphone de última geração e estabilizador', price: 1500, quantity: 1 },
      { id: '2', name: 'Edição para Reels/TikTok', description: 'Cortes dinâmicos, legendas animadas e trilhas em alta', price: 400, quantity: 4 }
    ],
    defaultTerms: '1. Os arquivos brutos não serão enviados a menos que acordado previamente.\n2. Pagamento integral antecipado.'
  },
  {
    id: 't-social',
    name: 'Gestão de Redes Sociais',
    category: 'Social Media',
    description: 'Plano mensal de gestão, criação de conteúdo e agendamento de postagens.',
    defaultServices: [
      { id: '1', name: 'Planejamento Mensal', description: 'Reunião de alinhamento e criação do calendário editorial', price: 800, quantity: 1 },
      { id: '2', name: 'Criação de Posts', description: 'Artes e copys para feed e stories (por post)', price: 150, quantity: 12 }
    ],
    defaultTerms: '1. Contrato de fidelidade mínima de 3 meses.\n2. Reunião de alinhamento todo dia 10.'
  },
  {
    id: 't-photo',
    name: 'Ensaio Fotográfico',
    category: 'Photography',
    description: 'Cobertura fotográfica para produtos, retratos corporativos ou lifestyle.',
    defaultServices: [
      { id: '1', name: 'Sessão de Fotos', description: 'Até 4 horas de sessão em locação externa ou estúdio', price: 1200, quantity: 1 },
      { id: '2', name: 'Tratamento de Imagens', description: 'Retoque avançado (por foto)', price: 50, quantity: 20 }
    ],
    defaultTerms: '1. Prazo de entrega das fotos tratadas: 15 dias úteis.\n2. Deslocamento não incluso.'
  },
  {
    id: 't-event',
    name: 'Cobertura de Evento',
    category: 'Eventos',
    description: 'Foto e vídeo para eventos corporativos, lançamentos e confraternizações.',
    defaultServices: [
      { id: '1', name: 'Cobertura Fotográfica', description: 'Por hora de evento', price: 400, quantity: 4 },
      { id: '2', name: 'Vídeo Summary (Aftermovie)', description: 'Vídeo de 1 minuto resumindo o evento', price: 2000, quantity: 1 }
    ],
    defaultTerms: '1. Alimentação da equipe por conta do contratante.\n2. Entrega de prévia (10 fotos) em 24h.'
  }
];

const mockProposals: Proposal[] = [
  {
    id: 'p-1',
    clientName: 'Tech StartUp Brasil',
    clientEmail: 'contato@techstartup.com.br',
    projectName: 'Campanha de Lançamento App',
    status: 'approved',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    services: [
      { id: 's-1', name: 'Diária de Gravação', description: 'Estúdio com chroma key', price: 3500, quantity: 2 },
      { id: 's-2', name: 'Edição e Motion Graphics', description: 'Vídeo de 2 min com animações', price: 4500, quantity: 1 }
    ],
    total: 11500,
    templateId: 't-filmmaking',
    terms: 'Pagamento 50/50. 3 rodadas de alteração.',
    notes: 'Cliente quer o vídeo em 4K e versão para IGTV.',
    media: [
      { id: 'm-1', url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&q=80&w=1000', type: 'image', caption: 'Referência de Iluminação' }
    ],
    timeline: [
      { id: 'tl-1', title: 'Reunião de Pré-produção', date: '2023-10-01', description: 'Definição do roteiro' },
      { id: 'tl-2', title: 'Gravação', date: '2023-10-10', description: 'Gravação no estúdio A' }
    ],
    views: 8
  },
  {
    id: 'p-2',
    clientName: 'Restaurante Sabor & Arte',
    clientEmail: 'marketing@saborearte.com',
    projectName: 'Reels para Novo Cardápio',
    status: 'sent',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    services: [
      { id: 's-1', name: 'Captação Mobile', description: '1 tarde no restaurante', price: 1500, quantity: 1 },
      { id: 's-2', name: 'Edição Reels', description: 'Vídeos de 15s', price: 400, quantity: 5 }
    ],
    total: 3500,
    templateId: 't-mobile',
    terms: '100% antecipado',
    notes: 'Focar nas sobremesas novas.',
    media: [],
    timeline: [],
    views: 3
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [proposals, setProposals] = useState<Proposal[]>(() => {
    const saved = localStorage.getItem('@orbit-proposals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return mockProposals;
      }
    }
    return mockProposals;
  });

  const [templates] = useState<Template[]>(defaultTemplates);

  useEffect(() => {
    localStorage.setItem('@orbit-proposals', JSON.stringify(proposals));
  }, [proposals]);

  const addProposal = (proposalData: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'views'>) => {
    const newProposal: Proposal = {
      ...proposalData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0
    };
    setProposals([newProposal, ...proposals]);
  };

  const updateProposal = (id: string, proposalData: Partial<Proposal>) => {
    setProposals(proposals.map(p => 
      p.id === id 
        ? { ...p, ...proposalData, updatedAt: new Date().toISOString() } 
        : p
    ));
  };

  const deleteProposal = (id: string) => {
    setProposals(proposals.filter(p => p.id !== id));
  };

  const getProposal = (id: string) => {
    return proposals.find(p => p.id === id);
  };

  return (
    <AppContext.Provider value={{
      proposals,
      templates,
      addProposal,
      updateProposal,
      deleteProposal,
      getProposal
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
