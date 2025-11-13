export type DocumentStatus = 'publicado' | 'vigente' | 'en_revision' | 'borrador' | null;

export type DocumentFormat = 'pdf' | 'video' | 'docx' | 'xlsx' | null;

export interface DocumentVersion {
  id: string;
  document_id: string;
  version: string;
  status: string;
  file_url: string | null;
  external_url: string | null;
  notes: string | null;
  approved_by: string;
  approved_by_name: string;
  approved_at: string;
  format: DocumentFormat;
  created_at: string;
}

export interface DocumentRead {
  id: string;
  document_id: string;
  user_id: string;
  user: string;
  position: string | null;
  readAt: string;
  dueDate: string | null;
}

export interface DocumentRecord {
  id: string;
  title: string;
  code: string;
  type: string;
  process_id: string | null;
  owner_id: string;
  owner: string;
  description: string;
  active: boolean;
  category: string;
  tags: string[];
  company_id: string;
  createdAt: string;
  updatedAt: string;
  status: DocumentStatus;
  currentVersion: DocumentVersion | null;
  versions: DocumentVersion[];
  reads: DocumentRead[];
  nextReviewAt: string | null;
}
