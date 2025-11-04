export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface Company {
  id: string;
  name: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
  companies: Company[];
}

export interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
}
