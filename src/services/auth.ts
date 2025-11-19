import axios, { AxiosError } from "axios";
import { API_URL } from "../consts";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refresh_token: string;
    profile: UserProfile;
  };
};

export type UserProfile = {
  email: string;
  company_id: string;
  full_name: string;
  position: string | null;
  id: string;
  role: string;
  created_at: string;
};

export type ProfileResponse = {
  success: boolean;
  message: string;
  data: UserProfile;
};

export type LogoutResponse = {
  success: boolean;
  message: string;
  data?: {
    status: string;
  };
};

const http = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError.response?.data?.message || axiosError.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export async function login(endpoint: string, payload: LoginPayload): Promise<LoginResponse> {
  try {
    const { data } = await http.post<LoginResponse>(endpoint, payload);
    return data;
  } catch (error) {
    const message = getErrorMessage(error, "No se pudo iniciar sesión");
    throw new Error(message);
  }
}

export async function fetchProfile(endpoint: string, accessToken: string): Promise<ProfileResponse> {
  try {
    const { data } = await http.get<ProfileResponse>(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return data;
  } catch (error) {
    const message = getErrorMessage(error, "No se pudo obtener el perfil");
    throw new Error(message);
  }
}

export async function logout(endpoint: string, accessToken: string): Promise<LogoutResponse> {
  try {
    const { data } = await http.post<LogoutResponse>(endpoint, undefined, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return data;
  } catch (error) {
    const message = getErrorMessage(error, "No se pudo cerrar sesión");
    throw new Error(message);
  }
}
