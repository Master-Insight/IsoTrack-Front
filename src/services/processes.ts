import axios, { type AxiosError } from "axios";
import httpClient from "./httpClient";
import type { DocumentRecord } from "./documents";

export type ArtifactEntityType = "process" | "task" | "document" | "diagram";

export type ArtifactLink = {
  id: string;
  from_id: string;
  from_type: ArtifactEntityType;
  to_id: string;
  to_type: ArtifactEntityType;
  to_name?: string;
  to_code?: string;
  created_at?: string;
};

export type TaskRecord = {
  id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  frequency?: string | null;
  responsible_roles?: string[] | null;
};

export type ProcessRecord = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  maturity?: string | null;
  owner?: string | null;
  owner_id?: string | null;
  inputs?: string[] | null;
  outputs?: string[] | null;
  tasks?: TaskRecord[];
  documents?: DocumentRecord[];
  artifactLinks?: ArtifactLink[];
};

type ProcessListResponse = {
  success: boolean;
  message: string;
  data: ProcessRecord[];
};

type ProcessDetailResponse = {
  success: boolean;
  message: string;
  data: ProcessRecord;
};

type ProcessLinksResponse = {
  success: boolean;
  message: string;
  data: ArtifactLink[];
};

type UpdateTaskResponse = {
  success: boolean;
  message: string;
  data: TaskRecord;
};

type ArtifactLinkPayload = {
  from_id: string;
  from_type: ArtifactEntityType;
  to_id: string;
  to_type: ArtifactEntityType;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError.response?.data?.message || axiosError.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export async function fetchProcesses(endpoint: string): Promise<ProcessListResponse> {
  try {
    const { data } = await httpClient.get<ProcessListResponse>(endpoint);
    return data;
  } catch (error) {
    const message = getErrorMessage(error, "No se pudo obtener los procesos");
    throw new Error(message);
  }
}

export async function fetchProcessDetail(endpoint: string): Promise<ProcessDetailResponse> {
  try {
    const { data } = await httpClient.get<ProcessDetailResponse>(endpoint);
    return data;
  } catch (error) {
    const message = getErrorMessage(error, "No se pudo obtener el proceso");
    throw new Error(message);
  }
}

export async function fetchProcessLinks(endpoint: string): Promise<ProcessLinksResponse> {
  try {
    const { data } = await httpClient.get<ProcessLinksResponse>(endpoint);
    return data;
  } catch (error) {
    const message = getErrorMessage(error, "No se pudieron obtener los vínculos");
    throw new Error(message);
  }
}

export async function updateTaskStatus(endpoint: string, status: string): Promise<UpdateTaskResponse> {
  try {
    const { data } = await httpClient.patch<UpdateTaskResponse>(endpoint, { status });
    return data;
  } catch (error) {
    const message = getErrorMessage(error, "No se pudo actualizar el estado de la tarea");
    throw new Error(message);
  }
}

export async function createArtifactLink(endpoint: string, payload: ArtifactLinkPayload): Promise<ProcessLinksResponse> {
  try {
    const { data } = await httpClient.post<ProcessLinksResponse>(endpoint, payload);
    return data;
  } catch (error) {
    const message = getErrorMessage(error, "No se pudo crear el vínculo");
    throw new Error(message);
  }
}

export async function deleteArtifactLink(endpoint: string): Promise<ProcessLinksResponse> {
  try {
    const { data } = await httpClient.delete<ProcessLinksResponse>(endpoint);
    return data;
  } catch (error) {
    const message = getErrorMessage(error, "No se pudo eliminar el vínculo");
    throw new Error(message);
  }
}
