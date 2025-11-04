import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthProvider';

interface ProtectedIslandProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const ProtectedIsland = ({ children, fallback }: ProtectedIslandProps) => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = '/login';
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" aria-hidden="true" />
        <span className="sr-only">Cargando sesión...</span>
      </div>
    );
  }

  if (!user) {
    return <>{fallback ?? null}</>;
  }

  return <>{children}</>;
};

export default ProtectedIsland;
