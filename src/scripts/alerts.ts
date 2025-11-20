const alertOptions = {
  confirmButtonColor: "#2563eb",
};

let swalPromise: Promise<any> | null = null;

export async function loadSwal() {
  if (!swalPromise) {
    swalPromise = import("https://cdn.jsdelivr.net/npm/sweetalert2@11");
  }
  const module = await swalPromise;
  return module.default;
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
    alert(`${title}: ${text}`);
  }
}
