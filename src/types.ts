export interface Proposal {
  id: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
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
}
