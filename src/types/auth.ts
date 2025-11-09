export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  companyId?: string | null;
  position?: string | null;
  createdAt?: string;
}

export interface Company {
  id: string;
  name: string;
}

export interface AuthSession {
  user: User;
  companies: Company[];
  activeCompanyId?: string | null;
}

export interface LoginResponse {
  access_token?: string;
  accessToken?: string;
  refresh_token?: string;
  refreshToken?: string;
  profile: UserProfileResponse;
  companies?: CompanyResponse[];
}

export interface RefreshResponse {
  access_token?: string;
  accessToken?: string;
  refresh_token?: string;
  refreshToken?: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  full_name?: string;
  fullName?: string;
  role?: string;
  company_id?: string | null;
  companyId?: string | null;
  position?: string | null;
  created_at?: string;
  createdAt?: string;
}

export interface CompanyResponse {
  id: string;
  name?: string;
  business_name?: string;
  businessName?: string;
}
