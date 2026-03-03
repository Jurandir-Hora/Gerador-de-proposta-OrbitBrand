import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Proposal, Template, AgencySettings, Receipt } from '../types';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

interface AppContextType {
  proposals: Proposal[];
  templates: Template[];
  loading: boolean;
  isSyncingTemplates: boolean;
  addProposal: (proposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'views'>) => Promise<string>;
  updateProposal: (id: string, proposal: Partial<Proposal>) => Promise<void>;
  deleteProposal: (id: string) => Promise<void>;
  getProposal: (id: string) => Proposal | undefined;
  // Template CRUD
  addTemplate: (template: Omit<Template, 'id'>) => Promise<void>;
  updateTemplate: (id: string, template: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  reorderTemplates: (reorderedTemplates: Template[]) => Promise<void>;
  deduplicateTemplates: () => Promise<void>;
  restoreTemplates: () => Promise<void>;
  agencySettings: AgencySettings;
  updateAgencySettings: (settings: Partial<AgencySettings>) => Promise<void>;
  // Receipt management
  receipts: Receipt[];
  addReceipt: (receipt: Omit<Receipt, 'id' | 'createdAt' | 'receiptNumber'>) => Promise<string>;
  deleteReceipt: (id: string) => Promise<void>;
}

const initialTemplates: Template[] = [
  {
    id: 't-audiovisual',
    name: 'Produção Audiovisual',
    category: 'Filmmaking',
    description: 'Proposta completa para produção de vídeos institucionais e comerciais.',
    defaultServices: [
      { id: '1', name: 'Diária de Gravação', description: 'Equipe e Equipamento', price: 3500, quantity: 1 },
      { id: '2', name: 'Edição', description: 'Pós-produção completa', price: 1500, quantity: 1 }
    ],
    defaultTerms: '50% sinal / 50% entrega.'
  },
  {
    id: 't-ads',
    name: 'Gestão de Tráfego Pago',
    category: 'Tráfego Pago (Ads)',
    description: 'Gestão estratégica de anúncios no Meta Ads e Google Ads.',
    defaultServices: [
      { id: '1', name: 'Setup de Conta', description: 'Configuração de Business Manager e Pixels', price: 1000, quantity: 1 },
      { id: '2', name: 'Gestão Mensal', description: 'Otimização e relatórios', price: 2500, quantity: 1 }
    ],
    defaultTerms: 'Investimento em mídia pago diretamente pelo cliente.'
  },
  {
    id: 't-consulting',
    name: 'Consultoria de Conteúdo',
    category: 'Consultoria de Conteúdo',
    description: 'Direcionamento estratégico para posicionamento de marca e autoridade.',
    defaultServices: [
      { id: '1', name: 'Análise de Perfil', description: 'Diagnóstico completo', price: 800, quantity: 1 },
      { id: '2', name: 'Encontros de Mentoria', description: 'Sessões de 1h via Meet', price: 500, quantity: 4 }
    ],
    defaultTerms: 'Pagamento antecipado ao ciclo de consultoria.'
  },
  {
    id: 't-seo',
    name: 'SEO para Vídeos e Imagem',
    category: 'SEO',
    description: 'Otimização para busca orgânica em YouTube, Google e Social.',
    defaultServices: [
      { id: '1', name: 'Otimização de Canal', description: 'Palavras-chave e tags', price: 1500, quantity: 1 },
      { id: '2', name: 'Copy de Alt Text', description: 'Otimização de acessibilidade/SEO', price: 400, quantity: 1 }
    ],
    defaultTerms: 'Resultados orgânicos de médio/longo prazo.'
  },
  {
    id: 't-drone',
    name: 'Captação com Drone',
    category: 'Captação com Drone',
    description: 'Imagens aéreas cinematográficas em 4K.',
    defaultServices: [
      { id: '1', name: 'Diária Drone', description: 'Piloto certificado + Drone 4K', price: 1800, quantity: 1 }
    ],
    defaultTerms: 'Sujeito a condições climáticas e autorização de voo.'
  },
  {
    id: 't-live',
    name: 'Transmissão ao Vivo',
    category: 'Transmissão ao Vivo',
    description: 'Live Streaming profissional para eventos e lançamentos.',
    defaultServices: [
      { id: '1', name: 'Equipe de Transmissão', description: 'Operador + Mesa de Corte', price: 2500, quantity: 1 },
      { id: '2', name: 'Link de Internet', description: 'Backup 4G/5G', price: 500, quantity: 1 }
    ],
    defaultTerms: 'Necessita de internet estável no local ou contratação extra.'
  },
  {
    id: 't-motion',
    name: 'Motion Graphics & Animação',
    category: 'Motion Graphics',
    description: 'Animações 2D/3D e efeitos visuais avançados.',
    defaultServices: [
      { id: '1', name: 'Vinheta Animada', description: 'Até 5 segundos', price: 1200, quantity: 1 },
      { id: '2', name: 'Vídeo Explainer', description: 'Animação por minuto', price: 2500, quantity: 1 }
    ],
    defaultTerms: 'Roteiro e locução inclusos.'
  },
  {
    id: 't-branding',
    name: 'Conteúdo para Branding',
    category: 'Conteúdo para Branding',
    description: 'Criação de narrativa e ativos de marca.',
    defaultServices: [
      { id: '1', name: 'Brand Book Visual', description: 'Guia de estilo', price: 3500, quantity: 1 }
    ],
    defaultTerms: 'Entrega em formato digital editável.'
  },
  {
    id: 't-activation',
    name: 'Ativações Photo/Video',
    category: 'Ativações',
    description: 'Cobertura dinâmica de eventos com entrega rápida.',
    defaultServices: [
      { id: '1', name: 'Equipe de Ativação', description: 'Cobertura em tempo real', price: 2000, quantity: 1 }
    ],
    defaultTerms: 'Entrega de editados no mesmo dia.'
  },
  {
    id: 't-sound',
    name: 'Sonorização e Iluminação',
    category: 'Event Tech',
    description: 'Infraestrutura técnica para eventos presenciais.',
    defaultServices: [
      { id: '1', name: 'Kit Som Básico', description: 'Caixas + Microfone', price: 1200, quantity: 1 },
      { id: '2', name: 'Setup Iluminação', description: 'LEDs decorativos', price: 800, quantity: 1 }
    ],
    defaultTerms: 'Montagem 2h antes do evento.'
  },
  {
    id: 't-sceno',
    name: 'Cenografia',
    category: 'Cenografia',
    description: 'Projeto e execução de cenários e stands.',
    defaultServices: [
      { id: '1', name: 'Projeto 3D', description: 'Visualização do cenário', price: 2000, quantity: 1 }
    ],
    defaultTerms: 'Custo de materiais sob orçamento após projeto.'
  },
  {
    id: 't-id',
    name: 'Identidade Visual',
    category: 'Identidade Visual',
    description: 'Criação de Logo, Tipografia e Paleta de Cores.',
    defaultServices: [
      { id: '1', name: 'Naming & Logo', description: 'Conceito e design', price: 4500, quantity: 1 }
    ],
    defaultTerms: 'Até 3 rodadas de revisões.'
  },
  {
    id: 't-copy',
    name: 'Redação (Copywriting)',
    category: 'Redação (Copywriting)',
    description: 'Textos persuasivos para vendas e engajamento.',
    defaultServices: [
      { id: '1', name: 'Página de Vendas', description: 'Copy estruturado', price: 1800, quantity: 1 }
    ],
    defaultTerms: 'Foco em conversão e tom de voz.'
  },
  {
    id: 't-influencer',
    name: 'Consultoria de Influência',
    category: 'Influência',
    description: 'Curadoria e gestão de influenciadores para campanhas.',
    defaultServices: [
      { id: '1', name: 'Mapeamento de Nomes', description: 'Curadoria estratégica', price: 1200, quantity: 1 }
    ],
    defaultTerms: 'Fee de agenciamento não incluso.'
  }
];

const defaultAgencySettings: AgencySettings = {
  agencyName: 'Orbit Brand Agência',
  proposalTitle: 'Orbit Proposta Comercial',
  address: 'Rua Exemplo, 123 - São Paulo',
  email: 'contato@orbitbrand.com.br',
  phone: '(11) 99999-9999',
  cnpj: '00.000.000/0001-00',
  footerText: 'Orbit Brand Agência - Proposta Comercial',
  templateRules: [
    { templateId: 'black-edition', minTicket: 50000, keywords: [], enabled: true },
    { templateId: 'cinematic-edition', minTicket: 0, keywords: ['vídeo', 'filme', 'cinem', 'mobile filmmaking'], enabled: true },
    { templateId: 'corporate-gold', minTicket: 150000, keywords: ['corporat', 'empres'], enabled: true },
    { templateId: 'executive-clean', minTicket: 0, keywords: [], enabled: true },
  ]
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncingTemplates, setIsSyncingTemplates] = useState(false);
  const [agencySettings, setAgencySettings] = useState<AgencySettings>(defaultAgencySettings);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const { user } = useAuth();

  // Escuta propostas e templates em tempo real
  useEffect(() => {
    // Listener de Propostas
    const qProposals = query(collection(db, 'proposals'), orderBy('createdAt', 'desc'));
    const unsubProposals = onSnapshot(qProposals, (snapshot) => {
      const proposalsData: Proposal[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        proposalsData.push({
          id: doc.id,
          services: [],
          media: [],
          timeline: [],
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        } as unknown as Proposal);
      });
      console.log(`📊 ${proposalsData.length} propostas carregadas do Firestore.`);
      setProposals(proposalsData);
      setLoading(false);
    });

    // Listener de Templates (Ordenado por order e depois por nome)
    const qTemplates = query(collection(db, 'templates'));
    const unsubTemplates = onSnapshot(qTemplates, (snapshot) => {
      const templatesData: Template[] = [];
      snapshot.forEach((doc) => {
        templatesData.push({ id: doc.id, ...doc.data() } as Template);
      });

      // Ordenação secundária no cliente para garantir consistência se 'order' faltar
      const sortedTemplates = [...templatesData].sort((a, b) => {
        const orderA = a.order ?? 999;
        const orderB = b.order ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name);
      });

      if (sortedTemplates.length > 0) {
        setTemplates(sortedTemplates);
        setIsSyncingTemplates(false);
      } else {
        setTemplates(initialTemplates);
      }
    });

    // Listener de Configurações da Agência
    const unsubSettings = onSnapshot(doc(db, 'settings', 'agency'), (snapshot) => {
      if (snapshot.exists()) {
        setAgencySettings(snapshot.data() as AgencySettings);
      }
    });

    // Listener de Recibos
    const qReceipts = query(collection(db, 'receipts'), orderBy('createdAt', 'desc'));
    const unsubReceipts = onSnapshot(qReceipts, (snapshot) => {
      const receiptsData: Receipt[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        receiptsData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        } as Receipt);
      });
      setReceipts(receiptsData);
    });

    // Função de Migração Atômica (Batch)
    const migrateTemplates = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'templates'));
        if (snapshot.empty) {
          setIsSyncingTemplates(true);
          console.log("🔥 Iniciando Migração Atômica de Templates...");
          const batch = writeBatch(db);

          initialTemplates.forEach((t) => {
            const { id, ...templateWithoutId } = t;
            const newDocRef = doc(collection(db, 'templates'));
            batch.set(newDocRef, templateWithoutId);
          });

          await batch.commit();
          console.log("✅ Migração Concluída com Sucesso!");
        }
      } catch (error) {
        console.error("❌ Erro na migração:", error);
      }
    };
    migrateTemplates();

    return () => {
      unsubProposals();
      unsubTemplates();
      unsubSettings();
      unsubReceipts();
    };
  }, []);

  const addProposal = async (proposalData: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'proposals'), {
        ...proposalData,
        createdBy: user?.id || 'anonymous',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0
      });
      return docRef.id;
    } catch (error) {
      console.error("Erro ao adicionar proposta:", error);
      throw error;
    }
  };

  const updateProposal = async (id: string, proposalData: Partial<Proposal>) => {
    try {
      // Remove campos que não devem ser salvos diretamente ou que podem causar erro
      const { id: _, ...dataToSave } = proposalData as any;

      // Limpeza recursiva para remover undefined (Firestore odeia undefined em arrays/objetos)
      const sanitize = (obj: any): any => {
        if (Array.isArray(obj)) {
          return obj.map(item => sanitize(item));
        } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Timestamp)) {
          return Object.fromEntries(
            Object.entries(obj)
              .filter(([_, v]) => v !== undefined)
              .map(([k, v]) => [k, sanitize(v)])
          );
        }
        return obj;
      };

      const proposalRef = doc(db, 'proposals', id);
      await updateDoc(proposalRef, {
        ...sanitize(dataToSave),
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error("Erro ao atualizar proposta:", error);
      throw error;
    }
  };

  const deleteProposal = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'proposals', id));
    } catch (error) {
      console.error("Erro ao excluir proposta:", error);
      throw error;
    }
  };

  // Template Methods
  const addTemplate = async (templateData: Omit<Template, 'id'>) => {
    try {
      await addDoc(collection(db, 'templates'), templateData);
    } catch (error) {
      console.error("Erro ao adicionar template:", error);
      throw error;
    }
  };

  const updateTemplate = async (id: string, templateData: Partial<Template>) => {
    try {
      await updateDoc(doc(db, 'templates', id), templateData);
    } catch (error) {
      console.error("Erro ao atualizar template:", error);
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'templates', id));
    } catch (error) {
      console.error("Erro ao excluir template:", error);
      throw error;
    }
  };

  const reorderTemplates = async (reorderedTemplates: Template[]) => {
    try {
      const batch = writeBatch(db);
      reorderedTemplates.forEach((template, index) => {
        const templateRef = doc(db, 'templates', template.id);
        batch.update(templateRef, { order: index });
      });
      await batch.commit();
      console.log("✅ Ordem dos templates atualizada!");
    } catch (error) {
      console.error("Erro ao reordenar templates:", error);
      throw error;
    }
  };

  const deduplicateTemplates = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'templates'));
      const seenNames = new Set<string>();
      const batch = writeBatch(db);
      let count = 0;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (seenNames.has(data.name)) {
          batch.delete(docSnap.ref);
          count++;
        } else {
          seenNames.add(data.name);
        }
      });

      if (count > 0) {
        await batch.commit();
        alert(`${count} templates duplicados foram removidos.`);
      } else {
        alert("Nenhum template duplicado encontrado.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao remover duplicados.");
    }
  };

  const restoreTemplates = async () => {
    if (!window.confirm("Isso irá APAGAR todos os seus templates atuais e restaurar os padrões da agência. Continuar?")) return;
    try {
      const snapshot = await getDocs(collection(db, 'templates'));
      const batch = writeBatch(db);

      // Limpa Tudo
      snapshot.forEach(docSnap => batch.delete(docSnap.ref));

      // Adiciona Padrões com ordem sequencial
      initialTemplates.forEach((t, index) => {
        const { id, ...templateWithoutId } = t;
        const newDocRef = doc(collection(db, 'templates'));
        batch.set(newDocRef, { ...templateWithoutId, order: index });
      });

      await batch.commit();
      alert("Biblioteca padrão restaurada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao restaurar biblioteca.");
    }
  };

  const getProposal = (id: string) => {
    return proposals.find(p => p.id === id);
  };

  const updateAgencySettings = async (settings: Partial<AgencySettings>) => {
    try {
      const settingsRef = doc(db, 'settings', 'agency');
      await updateDoc(settingsRef, settings);
    } catch (error: any) {
      if (error.code === 'not-found') {
        // Se não existir, cria com os defaults + novo valor
        const { setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'settings', 'agency'), { ...defaultAgencySettings, ...settings });
      } else {
        console.error("Erro ao atualizar configurações:", error);
        throw error;
      }
    }
  };

  const addReceipt = async (receiptData: Omit<Receipt, 'id' | 'createdAt' | 'receiptNumber'>): Promise<string> => {
    try {
      const nextNumber = receipts.length + 1;
      const receiptNumber = `${new Date().getFullYear()}${String(nextNumber).padStart(4, '0')}`;

      const docRef = await addDoc(collection(db, 'receipts'), {
        ...receiptData,
        receiptNumber,
        createdBy: user?.id || 'anonymous',
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Erro ao adicionar recibo:", error);
      throw error;
    }
  };

  const deleteReceipt = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'receipts', id));
    } catch (error) {
      console.error("Erro ao excluir recibo:", error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      proposals,
      templates,
      loading,
      isSyncingTemplates,
      addProposal,
      updateProposal,
      deleteProposal,
      getProposal,
      addTemplate,
      updateTemplate,
      deleteTemplate,
      reorderTemplates,
      deduplicateTemplates,
      restoreTemplates,
      agencySettings,
      updateAgencySettings,
      receipts,
      addReceipt,
      deleteReceipt
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
