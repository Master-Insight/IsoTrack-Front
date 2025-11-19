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

export async function login(endpoint: string, payload: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "No se pudo iniciar sesión");
  }

  return (await response.json()) as LoginResponse;
}

export async function fetchProfile(endpoint: string, accessToken: string): Promise<ProfileResponse> {
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "No se pudo obtener el perfil");
  }

  return (await response.json()) as ProfileResponse;
}
