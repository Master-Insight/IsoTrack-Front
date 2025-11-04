import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Company, User } from '../../types/auth';
import * as authService from '../../lib/auth-service';
import { clearCompanyId, clearTokens, getCompanyId, setCompanyId as persistCompanyId } from '../../lib/session';

interface AuthContextValue {
  user: User | null;
  companies: Company[];
  companyId: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setActiveCompany: (companyId: string) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompany] = useState<string | null>(getCompanyId());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bootstrap = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const session = await authService.loadProfile();
      setUser(session.user);
      setCompanies(session.companies);
      if (session.companies.length) {
        const storedCompanyId = getCompanyId();
        const fallbackCompany = session.companies[0].id;
        const nextCompanyId = session.companies.some((company) => company.id === storedCompanyId)
          ? storedCompanyId
          : fallbackCompany;
        setCompany(nextCompanyId);
        if (nextCompanyId) {
          persistCompanyId(nextCompanyId);
        }
      } else {
        setCompany(null);
        clearCompanyId();
      }
    } catch (err) {
      clearTokens();
      clearCompanyId();
      setUser(null);
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const session = await authService.login({ email, password });
      setUser(session.user);
      setCompanies(session.companies);
      const initialCompany = session.companies[0]?.id ?? null;
      setCompany(initialCompany);
      if (initialCompany) {
        persistCompanyId(initialCompany);
      }
    } catch (err) {
      console.error(err);
      setError((err as Error).message ?? 'No se pudo iniciar sesión');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setCompanies([]);
      setCompany(null);
      clearCompanyId();
      setIsLoading(false);
    }
  }, []);

  const setActiveCompany = useCallback((id: string) => {
    setCompany(id);
    persistCompanyId(id);
  }, []);

  const refreshProfile = useCallback(async () => {
    await bootstrap();
  }, [bootstrap]);

  const value = useMemo(
    () => ({
      user,
      companies,
      companyId,
      isLoading,
      error,
      login,
      logout,
      setActiveCompany,
      refreshProfile,
    }),
    [user, companies, companyId, isLoading, error, login, logout, setActiveCompany, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
