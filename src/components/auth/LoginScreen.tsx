import { AuthProvider } from './AuthProvider';
import { LoginForm } from './LoginForm';

const LoginScreen = () => {
  return (
    <AuthProvider>
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <p className="text-2xl font-semibold text-brand-600">ISOTrack</p>
          <p className="mt-1 text-sm text-slate-500">Inicia sesión para continuar</p>
        </div>
        <LoginForm />
      </div>
    </AuthProvider>
  );
};

export default LoginScreen;
