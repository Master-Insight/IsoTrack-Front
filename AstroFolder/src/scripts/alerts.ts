const alertOptions = {
  confirmButtonColor: "#2563eb",
};

let swalPromise: Promise<any> | null = null;
let fallbackContainer: HTMLDivElement | null = null;

const iconToEmoji: Record<string, string> = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
  question: "❓",
};

function ensureFallbackContainer() {
  if (typeof document === "undefined") return null;
  if (fallbackContainer) return fallbackContainer;

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "1rem";
  container.style.right = "1rem";
  container.style.zIndex = "9999";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "0.5rem";
  document.body.appendChild(container);
  fallbackContainer = container;
  return container;
}

function renderFallbackNotice({ title, text, icon }: { title: string; text: string; icon?: string }) {
  const container = ensureFallbackContainer();
  if (!container) return;

  const card = document.createElement("div");
  card.style.background = "#0f172a";
  card.style.color = "#fff";
  card.style.padding = "0.85rem 1rem";
  card.style.borderRadius = "0.75rem";
  card.style.boxShadow = "0 12px 30px rgba(15, 23, 42, 0.35)";
  card.style.border = "1px solid rgba(255,255,255,0.12)";
  card.style.minWidth = "280px";

  const emoji = icon ? iconToEmoji[icon] || "ℹ️" : "ℹ️";

  const titleEl = document.createElement("div");
  titleEl.style.fontWeight = "700";
  titleEl.style.fontSize = "0.95rem";
  titleEl.textContent = `${emoji} ${title}`;

  const textEl = document.createElement("p");
  textEl.style.margin = "0.25rem 0 0";
  textEl.style.fontSize = "0.85rem";
  textEl.style.color = "#e2e8f0";
  textEl.textContent = text;

  card.appendChild(titleEl);
  card.appendChild(textEl);

  container.appendChild(card);

  setTimeout(() => {
    card.style.opacity = "0";
    card.style.transform = "translateY(-6px)";
    card.style.transition = "opacity 200ms ease, transform 200ms ease";
    setTimeout(() => container.removeChild(card), 200);
  }, 3200);
}

export async function loadSwal() {
  if (!swalPromise) {
    swalPromise = import("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js");
  }
  const module = await swalPromise;
  return module.default ?? module;
}

export async function showAlert({
  title,
  text,
  icon = "info",
}: {
  title: string;
  text: string;
  icon?: string;
}) {
  try {
    const Swal = await loadSwal();
    await Swal.fire({
      title,
      text,
      icon,
      ...alertOptions,
    });
  } catch (error) {
    console.error("No se pudo mostrar SweetAlert2", error);
    renderFallbackNotice({ title, text, icon });
  }
}
