import axios, { type AxiosError } from "axios";
import httpClient from "./httpClient";

export type DocumentVersion = {
  id: string;
  document_id: string;
  version: string;
  status: string | null;
  file_url: string | null;
  external_url: string | null;
  notes: string | null;
  approved_by: string | null;
  approved_by_name: string | null;
  approved_at: string | null;
  format: string | null;
  created_at: string;
};

export type DocumentRead = {
  id: string;
  document_id: string;
  user_id: string;
  user: string;
  position: string | null;
  readAt: string;
  dueDate: string | null;
};

export type DocumentRecord = {
  title: string;
  code: string;
  type: string;
  process_id: string | null;
  owner_id: string;
  description: string;
  active: boolean;
  category: string;
  tags: string[];
  id: string;
  company_id: string;
  createdAt: string;
  updatedAt: string;
  owner: string;
  status: string | null;
  currentVersion: DocumentVersion | null;
  versions: DocumentVersion[];
  reads: DocumentRead[];
  nextReviewAt: string | null;
};

export type DocumentListResponse = {
  success: boolean;
  message: string;
  data: DocumentRecord[];
};

export type DocumentDetailResponse = {
  success: boolean;
  message: string;
  data: DocumentRecord;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError.response?.data?.message || axiosError.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export async function fetchDocuments(endpoint: string): Promise<DocumentListResponse> {
  try {
    const { data } = await httpClient.get<DocumentListResponse>(endpoint);
    return data;
  } catch (error) {
    const message = getErrorMessage(error, "No se pudo obtener los documentos");
    throw new Error(message);
  }
}

export async function fetchDocumentDetail(endpoint: string): Promise<DocumentDetailResponse> {
  try {
    const { data } = await httpClient.get<DocumentDetailResponse>(endpoint);
    return data;
  } catch (error) {
    const message = getErrorMessage(error, "No se pudo obtener el documento");
    throw new Error(message);
  }
}
