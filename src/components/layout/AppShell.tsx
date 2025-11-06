import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../auth/AuthProvider';
import { Header } from './Header';
import Sidebar from './Sidebar';

interface AppShellProps {
  children: ReactNode;
  requireAuth?: boolean;
  fallback?: ReactNode;
}

const AuthenticatedContent = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = '/login';
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"
          aria-hidden="true"
        />
        <span className="sr-only">Cargando sesión...</span>
      </div>
    );
  }

  if (!user) {
    return <>{fallback ?? null}</>;
  }

  return <>{children}</>;
};

const AppShell = ({ children, requireAuth = true, fallback }: AppShellProps) => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-100">
        <Header />
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
          <Sidebar />
          <main className="flex-1 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            {requireAuth ? (
              <AuthenticatedContent fallback={fallback}>{children}</AuthenticatedContent>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
};

export default AppShell;
