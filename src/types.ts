export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'master' | 'admin' | 'manager' | 'collaborator';
  avatarUrl?: string;
}

export interface Proposal {
  id: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  clientDocument: string;
  projectName: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  services: ServiceItem[];
  total: number;
  templateId: string;
  terms: string;
  notes: string;
  media: MediaItem[];
  timeline: TimelineItem[];
  views: number;
  createdBy?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  date: string;
  description: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultServices: ServiceItem[];
  defaultTerms: string;
  order?: number;
}

export interface AgencySettings {
  agencyName: string;
  proposalTitle: string;
  address: string;
  email: string;
  phone: string;
  cnpj: string;
  footerText: string;
  logoUrl?: string;
  bankName?: string;
  bankAgency?: string;
  bankAccount?: string;
  pixKey?: string;
}
export interface Receipt {
  id: string;
  receiptNumber: string;
  clientName: string;
  clientDocument: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod: 'pix' | 'transfer' | 'credit' | 'cash';
  proposalId?: string;
  createdBy: string;
  createdAt: string;
  bankName?: string;
  bankAgency?: string;
  bankAccount?: string;
  pixKey?: string;
}
