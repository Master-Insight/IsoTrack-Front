import { fetchProfile, logout, type UserProfile } from "../services/auth";
import {
  fetchDocumentDetail,
  fetchDocuments,
  type DocumentRecord,
} from "../services/documents";
import { clearSessionTokens } from "../services/httpClient";
import { showAlert } from "./alerts";

const ACCESS_TOKEN_KEY = "accessToken";
const PROFILE_STORAGE_KEY = "profile";
const REFRESH_TOKEN_KEY = "refreshToken";

function redirectToLogin() {
  window.location.href = "/login";
}

function clearSession() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(PROFILE_STORAGE_KEY);
  clearSessionTokens();
}

type BadgeVariant = "neutral" | "success" | "error" | "pending";

type DashboardElements = {
  overlay: HTMLElement | null;
  protectedArea: HTMLElement | null;
  statusBadge: HTMLElement | null;
  documentsBadge: HTMLElement | null;
  documentsCount: HTMLElement | null;
  documentsList: HTMLElement | null;
  documentTitle: HTMLElement | null;
  documentDescription: HTMLElement | null;
  documentCode: HTMLElement | null;
  documentType: HTMLElement | null;
  documentCategory: HTMLElement | null;
  documentOwner: HTMLElement | null;
  documentVersion: HTMLElement | null;
  documentVersionStatus: HTMLElement | null;
  documentStatus: HTMLElement | null;
  documentTags: HTMLElement | null;
  documentLink: HTMLAnchorElement | null;
  profileName: HTMLElement | null;
  profileEmail: HTMLElement | null;
  profileRole: HTMLElement | null;
  profileCompany: HTMLElement | null;
  profileId: HTMLElement | null;
  profileCreated: HTMLElement | null;
  welcomeMessage: HTMLElement | null;
  logoutButton: HTMLButtonElement | null;
};

type DashboardConfig = {
  profileEndpoint?: string;
  logoutEndpoint?: string;
  documentsEndpoint?: string;
};

function getElements(): DashboardElements {
  return {
    overlay: document.getElementById("lock-overlay"),
    protectedArea: document.getElementById("protected-area"),
    statusBadge: document.getElementById("session-status"),
    documentsBadge: document.getElementById("documents-badge"),
    documentsCount: document.getElementById("documents-count"),
    documentsList: document.getElementById("documents-list"),
    documentTitle: document.getElementById("document-title"),
    documentDescription: document.getElementById("document-description"),
    documentCode: document.getElementById("document-code"),
    documentType: document.getElementById("document-type"),
    documentCategory: document.getElementById("document-category"),
    documentOwner: document.getElementById("document-owner"),
    documentVersion: document.getElementById("document-version"),
    documentVersionStatus: document.getElementById("document-version-status"),
    documentStatus: document.getElementById("document-status"),
    documentTags: document.getElementById("document-tags"),
    documentLink: document.getElementById("document-link") as HTMLAnchorElement | null,
    profileName: document.getElementById("profile-name"),
    profileEmail: document.getElementById("profile-email"),
    profileRole: document.getElementById("profile-role"),
    profileCompany: document.getElementById("profile-company"),
    profileId: document.getElementById("profile-id"),
    profileCreated: document.getElementById("profile-created"),
    welcomeMessage: document.getElementById("welcome-message"),
    logoutButton: document.getElementById("logout-button") as HTMLButtonElement | null,
  };
}

function setDocumentsBadge(text: string, variant: BadgeVariant = "neutral", badge?: HTMLElement | null) {
  if (!badge) return;
  const base = "badge ";
  const variants: Record<BadgeVariant, string> = {
    neutral: `${base}bg-amber-100 text-amber-700`,
    success: `${base}bg-emerald-100 text-emerald-700`,
    error: `${base}bg-red-100 text-red-700`,
    pending: `${base}bg-blue-100 text-blue-700`,
  };
  badge.textContent = text;
  badge.className = variants[variant];
}

function renderTags(tags: string[], container: HTMLElement | null) {
  if (!container) return;
  container.innerHTML = "";
  if (!tags.length) {
    container.innerHTML = '<span class="text-xs text-slate-500">Sin etiquetas</span>';
    return;
  }
  tags.forEach((tag) => {
    const badge = document.createElement("span");
    badge.className = "badge bg-slate-100 text-slate-700";
    badge.textContent = tag;
    container.appendChild(badge);
  });
}

function renderWelcome(profile: UserProfile | null, welcomeMessage: HTMLElement | null) {
  if (!welcomeMessage || !profile) return;
  welcomeMessage.textContent = `Bienvenido ${profile.full_name || "usuario"} ���. El panel ya está desbloqueado.`;
}

function renderProfile(profile: UserProfile | null, elements: DashboardElements) {
  if (!profile) return;
  elements.profileName && (elements.profileName.textContent = profile.full_name || "Usuario");
  elements.profileEmail && (elements.profileEmail.textContent = profile.email);
  elements.profileRole && (elements.profileRole.textContent = profile.role ?? "auth");
  elements.profileCompany && (elements.profileCompany.textContent = profile.company_id);
  elements.profileId && (elements.profileId.textContent = profile.id);
  elements.profileCreated &&
    (elements.profileCreated.textContent = new Date(profile.created_at).toLocaleString());
  renderWelcome(profile, elements.welcomeMessage);
}

function renderDocumentDetail(document: DocumentRecord | null, elements: DashboardElements) {
  if (!elements.documentTitle || !elements.documentStatus) return;

  if (!document) {
    elements.documentTitle.textContent = "Sin documento cargado";
    elements.documentDescription &&
      (elements.documentDescription.textContent = "Todavía no se ha podido obtener información.");
    elements.documentCode && (elements.documentCode.textContent = "—");
    elements.documentType && (elements.documentType.textContent = "—");
    elements.documentCategory && (elements.documentCategory.textContent = "—");
    elements.documentOwner && (elements.documentOwner.textContent = "—");
    elements.documentVersion && (elements.documentVersion.textContent = "—");
    elements.documentVersionStatus && (elements.documentVersionStatus.textContent = "—");
    elements.documentStatus.textContent = "—";
    elements.documentStatus.className = "badge bg-slate-100 text-slate-700";
    renderTags([], elements.documentTags);
    if (elements.documentLink) {
      elements.documentLink.href = "#";
      elements.documentLink.classList.add("opacity-60", "pointer-events-none");
    }
    return;
  }

  const currentVersion = document.currentVersion;
  const externalUrl = currentVersion?.external_url || currentVersion?.file_url;

  elements.documentTitle.textContent = document.title || "Documento";
  elements.documentDescription &&
    (elements.documentDescription.textContent =
      document.description || "Documento sin descripción disponible en la API.");
  elements.documentCode && (elements.documentCode.textContent = document.code || "—");
  elements.documentType && (elements.documentType.textContent = document.type || "—");
  elements.documentCategory && (elements.documentCategory.textContent = document.category || "—");
  elements.documentOwner && (elements.documentOwner.textContent = document.owner || "—");
  elements.documentVersion &&
    (elements.documentVersion.textContent = currentVersion?.version || "Sin versión");
  elements.documentVersionStatus &&
    (elements.documentVersionStatus.textContent = currentVersion?.status || "—");

  elements.documentStatus.textContent = document.active ? "Activo" : "Inactivo";
  elements.documentStatus.className = document.active
    ? "badge bg-emerald-100 text-emerald-700"
    : "badge bg-slate-200 text-slate-700";

  renderTags(document.tags || [], elements.documentTags);

  if (elements.documentLink) {
    if (externalUrl) {
      elements.documentLink.href = externalUrl;
      elements.documentLink.classList.remove("opacity-60", "pointer-events-none");
    } else {
      elements.documentLink.href = "#";
      elements.documentLink.classList.add("opacity-60", "pointer-events-none");
    }
  }
}

function renderDocumentsList(
  documents: DocumentRecord[],
  elements: DashboardElements,
  onClick: (id: string) => void,
) {
  if (!elements.documentsList || !elements.documentsCount) return;
  elements.documentsList.innerHTML = "";
  elements.documentsCount.textContent = `${documents.length} docs`;

  if (!documents.length) {
    elements.documentsList.innerHTML =
      '<p class="text-sm text-slate-500 px-3 py-2">Sin documentos disponibles.</p>';
    renderDocumentDetail(null, elements);
    return;
  }

  documents.forEach((doc, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "w-full text-left px-3 py-3 rounded-lg border border-slate-200 hover:border-primary/60 hover:bg-primary/5 transition-colors";
    button.innerHTML = `
          <div class="flex items-center justify-between gap-2">
            <div>
              <p class="font-semibold text-ink">${doc.title}</p>
              <p class="text-xs text-slate-500">${doc.code}</p>
            </div>
            <span class="badge bg-slate-100 text-slate-700">${doc.currentVersion?.version || "Sin versión"}</span>
          </div>
          <p class="text-xs text-slate-600 mt-1 line-clamp-2">${doc.description || "Documento sin descripción"}</p>
        `;

    button.addEventListener("click", () => onClick(doc.id));

    if (index === 0) {
      button.classList.add("border-primary/60", "bg-primary/5");
    }

    elements.documentsList.appendChild(button);
  });
}

function lockContent(elements: DashboardElements) {
  elements.overlay?.classList.remove("hidden");
  elements.protectedArea?.classList.add("pointer-events-none", "opacity-80");
  if (elements.statusBadge) {
    elements.statusBadge.textContent = "Bloqueado";
    elements.statusBadge.className = "badge bg-amber-100 text-amber-700";
  }
  setDocumentsBadge("Protegido", "neutral", elements.documentsBadge);
}

function unlockContent(elements: DashboardElements) {
  elements.overlay?.classList.add("hidden");
  elements.protectedArea?.classList.remove("pointer-events-none", "opacity-80");
  if (elements.statusBadge) {
    elements.statusBadge.textContent = "Sesión activa";
    elements.statusBadge.className = "badge bg-emerald-100 text-emerald-700";
  }
}

function hydrateFromLocal(): UserProfile | null {
  const cachedProfile = sessionStorage.getItem(PROFILE_STORAGE_KEY);
  if (cachedProfile) {
    try {
      return JSON.parse(cachedProfile) as UserProfile;
    } catch (error) {
      console.error("No se pudo parsear el perfil en caché", error);
    }
  }
  return null;
}

async function loadProfileFromServer(profileEndpoint?: string) {
  if (!profileEndpoint) return null;
  const response = await fetchProfile(profileEndpoint);
  sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(response.data));
  return response.data;
}

async function loadDocumentDetail(
  documentId: string,
  endpoints: Required<DashboardConfig>,
  elements: DashboardElements,
) {
  setDocumentsBadge("Detalle", "pending", elements.documentsBadge);
  try {
    const detailEndpoint = `${endpoints.documentsEndpoint}/${documentId}`;
    const { data } = await fetchDocumentDetail(detailEndpoint);
    renderDocumentDetail(data, elements);
    setDocumentsBadge("Sincronizado", "success", elements.documentsBadge);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo obtener el documento";
    await showAlert({ title: "Error al cargar el documento", text: message, icon: "error" });
    setDocumentsBadge("Error", "error", elements.documentsBadge);
  }
}

async function loadDocuments(endpoints: Required<DashboardConfig>, elements: DashboardElements) {
  setDocumentsBadge("Cargando", "pending", elements.documentsBadge);
  elements.documentsCount && (elements.documentsCount.textContent = "0 docs");

  try {
    const { data } = await fetchDocuments(endpoints.documentsEndpoint);
    renderDocumentsList(data, elements, (id) => loadDocumentDetail(id, endpoints, elements));
    if (data?.length) {
      await loadDocumentDetail(data[0].id, endpoints, elements);
    }
    setDocumentsBadge("Disponible", "success", elements.documentsBadge);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo obtener los documentos";
    await showAlert({ title: "No se pudo obtener el listado", text: message, icon: "error" });
    renderDocumentDetail(null, elements);
    setDocumentsBadge("Error", "error", elements.documentsBadge);
    return false;
  }
}

async function onSessionReady(
  profile: UserProfile,
  endpoints: Required<DashboardConfig>,
  elements: DashboardElements,
) {
  renderProfile(profile, elements);
  unlockContent(elements);
  const hasToken = Boolean(sessionStorage.getItem(ACCESS_TOKEN_KEY));
  if (hasToken) {
    await loadDocuments(endpoints, elements);
  }
}

async function checkSession(endpoints: Required<DashboardConfig>, elements: DashboardElements) {
  const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) {
    redirectToLogin();
    return;
  }

  const cachedProfile = hydrateFromLocal();
  if (cachedProfile) {
    await onSessionReady(cachedProfile, endpoints, elements);
  }

  try {
    const profile = await loadProfileFromServer(endpoints.profileEndpoint);
    if (profile) {
      await onSessionReady(profile, endpoints, elements);
    }
  } catch (error) {
    console.error("Sesión inválida", error);
    const message = error instanceof Error ? error.message : "No se pudo validar la sesión";
    await showAlert({ title: "Sesión expirada", text: message, icon: "error" });
    clearSession();
    lockContent(elements);
    redirectToLogin();
  }
}

function bindLogout(endpoints: Required<DashboardConfig>, elements: DashboardElements) {
  elements.logoutButton?.addEventListener("click", async () => {
    const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      clearSession();
      redirectToLogin();
      return;
    }

    if (!endpoints.logoutEndpoint) {
      console.error("No se configuró el endpoint de logout");
      clearSession();
      redirectToLogin();
      return;
    }

    elements.logoutButton.disabled = true;
    elements.logoutButton.textContent = "Cerrando sesión...";

    try {
      await logout(endpoints.logoutEndpoint);
    } catch (error) {
      console.error("No se pudo cerrar sesión", error);
      const message = error instanceof Error ? error.message : "No se pudo cerrar sesión";
      await showAlert({ title: "Cierre de sesión incompleto", text: message, icon: "warning" });
    } finally {
      clearSession();
      redirectToLogin();
    }
  });
}

function resolveEndpoints(config: DashboardConfig, elements: DashboardElements): Required<DashboardConfig> {
  const profileEndpoint =
    config.profileEndpoint || elements.protectedArea?.dataset.profileEndpoint || "";
  const logoutEndpoint = config.logoutEndpoint || elements.protectedArea?.dataset.logoutEndpoint || "";
  const documentsEndpoint =
    config.documentsEndpoint || elements.protectedArea?.dataset.documentsEndpoint || "";

  if (!profileEndpoint || !logoutEndpoint || !documentsEndpoint) {
    throw new Error("Faltan endpoints para inicializar el panel protegido");
  }

  return { profileEndpoint, logoutEndpoint, documentsEndpoint };
}

export function initDashboard(config: DashboardConfig = {}) {
  const elements = getElements();
  const endpoints = resolveEndpoints(config, elements);

  const startSession = () => checkSession(endpoints, elements);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startSession);
  } else {
    startSession();
  }

  window.addEventListener("session:login", async (event: Event) => {
    const detail = (event as CustomEvent).detail || {};
    if (detail.profile) {
      await onSessionReady(detail.profile, endpoints, elements);
    }

    if (detail.accessToken) {
      try {
        const refreshedProfile = await loadProfileFromServer(endpoints.profileEndpoint);
        if (refreshedProfile) {
          await onSessionReady(refreshedProfile, endpoints, elements);
        }
      } catch (error) {
        console.error("No se pudo refrescar el perfil tras login", error);
      }
    }
  });

  bindLogout(endpoints, elements);
  lockContent(elements);
}
