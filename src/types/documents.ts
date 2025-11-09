export type DocumentStatus = 'vigente' | 'en_revision' | 'borrador';

export type DocumentFormat = 'pdf' | 'video';

export interface DocumentVersion {
  id: string;
  version: string;
  approved_at: string;
  approved_by: string;
  approved_by_name: string;
  notes?: string;
  format: DocumentFormat;
  external_url: string;
}

export interface DocumentRead {
  id: string;
  user_id: string;
  user: string;
  position: string;
  readAt: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  code: string;
  category: string;
  owner_id: string;
  owner: string;
  status: DocumentStatus;
  tags: string[];
  description: string;
  coverImage?: string;
  currentVersion: DocumentVersion;
  versions: DocumentVersion[];
  reads: DocumentRead[];
  createdAt: string;
  updatedAt: string;
  nextReviewAt?: string;
}
