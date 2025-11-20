import React, { useMemo, useState } from "react";
import { API_URL, DEFAULT_COMPANY, DEFAULT_USER } from "../../consts";
import type { LoginPayload, UserProfile } from "../../services/auth";
import { fetchProfile, login, persistTokens } from "../../services/auth";

const loginEndpoint = `${API_URL}/users/login`;
const profileEndpoint = `${API_URL}/users/me`;

const PROFILE_STORAGE_KEY = "profile";

const initialPayload: LoginPayload = {
  email: DEFAULT_USER.email,
  password: "",
};

type LoginResult = {
  profile: UserProfile;
  accessToken: string;
};

export default function LoginForm() {
  const [payload, setPayload] = useState<LoginPayload>(initialPayload);
  const [status, setStatus] = useState<string>("");
  const [statusVariant, setStatusVariant] = useState<"neutral" | "success" | "error">("neutral");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  let swalPromise: Promise<any> | null = null;

  const loadSwal = async () => {
    if (!swalPromise) {
      swalPromise = import("https://cdn.jsdelivr.net/npm/sweetalert2@11");
    }
    const module = await swalPromise;
    return module.default;
  };

  const showAlert = async ({ title, text, icon = "info" }) => {
    try {
      const Swal = await loadSwal();
      await Swal.fire({
        title,
        text,
        icon,
        confirmButtonColor: "#2563eb",
      });
    } catch (error) {
      console.error("No se pudo mostrar SweetAlert2", error);
      alert(`${title}: ${text}`);
    }
  };

  const isDisabled = useMemo(() => {
    return isSubmitting || !payload.email || !payload.password;
  }, [isSubmitting, payload.email, payload.password]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPayload((current) => ({ ...current, [name]: value }));
  };

  const emitLogin = (detail: LoginResult) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("session:login", { detail }));
  };

  const persistProfile = async (accessToken: string) => {
    if (!accessToken?.startsWith("eyJ")) return;
    try {
      const profileResponse = await fetchProfile(profileEndpoint);
      sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileResponse.data));
      emitLogin({ profile: profileResponse.data, accessToken });
    } catch (error) {
      console.error("No se pudo obtener el perfil", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Conectando con FastAPI...");
    setStatusVariant("neutral");
    setIsSubmitting(true);

    try {
      const response = await login(loginEndpoint, payload);
      setStatus(response.message || "Login exitoso");
      setStatusVariant("success");

      if (response.success && response.data) {
        const { accessToken, refresh_token, profile } = response.data;
        persistTokens(accessToken, refresh_token);
        sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));

        emitLogin({ profile, accessToken });
        await persistProfile(accessToken);
        await showAlert({
          title: "Sesión validada",
          text: "Redirigiendo al panel principal...",
          icon: "success",
        });
        setPreview(JSON.stringify(response.data, null, 2));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo iniciar sesión";
      setStatus(message);
      setStatusVariant("error");
      await showAlert({
        title: "Error de autenticación",
        text: message,
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card-surface p-8 space-y-6">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary text-sm font-semibold">
          Acceso seguro
          <span className="badge bg-primary/10 text-primary">FastAPI + Supabase</span>
        </div>
        <h2 className="text-2xl font-bold text-ink">Ingresá a IsoTrack</h2>
        <p className="text-slate-600 text-sm">
          Autenticación basada en Supabase con FastAPI. La sesión se vincula a la empresa {DEFAULT_COMPANY.name}.
        </p>
      </header>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="form-label" htmlFor="email">
            Correo electrónico
          </label>
          <input
            className="form-input"
            id="email"
            name="email"
            type="email"
            value={payload.email}
            autoComplete="username"
            onChange={handleChange}
            required
            placeholder="usuario@empresa.com"
          />
        </div>
        <div className="space-y-1">
          <label className="form-label" htmlFor="password">
            Contraseña
          </label>
          <input
            className="form-input"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={payload.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />
          <p className="text-xs text-slate-500">Tu contraseña se valida en FastAPI contra Supabase Auth.</p>
        </div>
        <button className="button-primary w-full" type="submit" disabled={isDisabled}>
          {isSubmitting ? "Validando..." : "Iniciar sesión"}
        </button>
        {status && (
          <p
            id="login-status"
            className={`text-sm ${
              statusVariant === "error"
                ? "text-red-600 font-semibold"
                : statusVariant === "success"
                  ? "text-emerald-600 font-semibold"
                  : "text-slate-600"
            }`}
          >
            {status}
          </p>
        )}
        {preview && (
          <pre className="text-xs bg-slate-900 text-white p-4 rounded-xl overflow-x-auto border border-slate-800">
            {preview}
          </pre>
        )}
      </form>
    </section>
  );
}
