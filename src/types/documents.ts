export type DocumentStatus = 'vigente' | 'en_revision' | 'borrador';

export type DocumentFormat = 'pdf' | 'video';

export interface DocumentVersion {
  id: string;
  version: string;
  updatedAt: string;
  updatedBy: string;
  notes?: string;
  fileUrl: string;
}

export interface DocumentRead {
  id: string;
  user: string;
  role: string;
  readAt: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  code: string;
  category: string;
  owner: string;
  status: DocumentStatus;
  tags: string[];
  summary: string;
  format: DocumentFormat;
  coverImage?: string;
  currentVersion: DocumentVersion;
  versions: DocumentVersion[];
  reads: DocumentRead[];
  complianceArea: string;
  createdAt: string;
  updatedAt: string;
  nextReviewAt?: string;
  url: string;
}
