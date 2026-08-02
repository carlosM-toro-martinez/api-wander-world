const dayLabels = [
  { key: "sunday", label: "Dom" },
  { key: "monday", label: "Lun" },
  { key: "tuesday", label: "Mar" },
  { key: "wednesday", label: "Mie" },
  { key: "thursday", label: "Jue" },
  { key: "friday", label: "Vie" },
  { key: "saturday", label: "Sab" },
];

const statusFilter = document.getElementById("statusFilter");
const refreshBtn = document.getElementById("refreshBtn");
const businessList = document.getElementById("businessList");
const countBadge = document.getElementById("countBadge");
const emptyState = document.getElementById("emptyState");
const detailForm = document.getElementById("detailForm");
const detailStatus = document.getElementById("detailStatus");
const detailTitle = document.getElementById("detailTitle");
const detailLogo = document.getElementById("detailLogo");
const hoursGrid = document.getElementById("hoursGrid");
const message = document.getElementById("message");

const fields = {
  name: document.getElementById("name"),
  sectionId: document.getElementById("sectionId"),
  licenseNumber: document.getElementById("licenseNumber"),
  ownerFullName: document.getElementById("ownerFullName"),
  ownerEmail: document.getElementById("ownerEmail"),
  phoneNumber: document.getElementById("phoneNumber"),
  mail: document.getElementById("mail"),
  address: document.getElementById("address"),
  logoUrl: document.getElementById("logoUrl"),
  description: document.getElementById("description"),
};

const approveBtn = document.getElementById("approveBtn");
const rejectBtn = document.getElementById("rejectBtn");
const deleteBtn = document.getElementById("deleteBtn");
const saveBtn = document.getElementById("saveBtn");

let applications = [];
let sections = [];
let selected = null;
const API_BASE = "/api/v1";
const EMPTY_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Crect width='72' height='72' rx='8' fill='%23e8f2ee'/%3E%3C/svg%3E";

function apiBase() {
  return API_BASE;
}

function headers() {
  return { "Content-Type": "application/json" };
}

function mediaUrl(value) {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return value;
  return `/${value}`;
}

function statusOf(business) {
  if (business.approvalStatus) return business.approvalStatus;
  if (business.isActive) return "APPROVED";
  if (business.subscriptionStatus === "PAUSED") return "REJECTED";
  return "PENDING";
}

function statusText(status) {
  if (status === "APPROVED") return "Aprobado";
  if (status === "REJECTED") return "Rechazado";
  return "Pendiente";
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? "#b42318" : "#6a7169";
  if (text) {
    setTimeout(() => {
      message.textContent = "";
    }, 3500);
  }
}

async function parseResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.error || "No se pudo completar la accion");
  }
  return data;
}

async function request(path, options = {}) {
  const response = await fetch(`${apiBase()}${path}`, {
    ...options,
    headers: {
      ...headers(),
      ...(options.headers || {}),
    },
  });
  return await parseResponse(response);
}

function sectionTitleOf(business) {
  return business.section?.title || sections.find((section) => section.id === business.sectionId)?.title || "Sin rubro";
}

function renderSections() {
  fields.sectionId.innerHTML = '<option value="">Selecciona rubro</option>';
  sections.forEach((section) => {
    const option = document.createElement("option");
    option.value = String(section.id);
    option.textContent = section.title;
    fields.sectionId.appendChild(option);
  });
}

async function loadSections() {
  sections = await request("/sections");
  renderSections();
}

function getSchedule(business) {
  const opening = business.openingHours?.[0];
  const closedDays = (opening?.weekend || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return dayLabels.map((day, index) => {
    const range = opening?.morningHours?.[index] || opening?.afternoonHours?.[index] || "";
    const [open = "", close = ""] = range.split("-");
    return {
      ...day,
      closed: closedDays.includes(day.key) || !range,
      open,
      close,
    };
  });
}

function renderHours(business) {
  const schedule = getSchedule(business);
  hoursGrid.innerHTML = "";

  schedule.forEach((day) => {
    const row = document.createElement("div");
    row.className = "hour-row";
    row.dataset.day = day.key;

    const label = document.createElement("span");
    label.className = "day-label";
    label.textContent = day.label;

    const open = document.createElement("input");
    open.type = "time";
    open.dataset.kind = "open";
    open.value = day.open;

    const close = document.createElement("input");
    close.type = "time";
    close.dataset.kind = "close";
    close.value = day.close;

    row.appendChild(label);
    row.appendChild(open);
    row.appendChild(close);
    hoursGrid.appendChild(row);
  });
}

function collectOpeningHours() {
  const rows = Array.from(hoursGrid.querySelectorAll(".hour-row"));
  const values = dayLabels.map((day) => {
    const row = rows.find((item) => item.dataset.day === day.key);
    const open = row?.querySelector('[data-kind="open"]')?.value || "";
    const close = row?.querySelector('[data-kind="close"]')?.value || "";
    return { day: day.key, open, close };
  });

  return {
    closedDays: values
      .filter((item) => !item.open || !item.close)
      .map((item) => item.day),
    morningHours: values.map((item) => (item.open && item.close ? `${item.open}-${item.close}` : "")),
    afternoonHours: values.map(() => ""),
  };
}

function fillDetail(business) {
  selected = business;
  emptyState.classList.add("hidden");
  detailForm.classList.remove("hidden");

  const status = statusOf(business);
  detailStatus.textContent = statusText(status);
  detailStatus.className = `status-pill status-${status.toLowerCase()}`;
  detailTitle.textContent = business.name || "Negocio";
  detailLogo.src = mediaUrl(business.logoUrl) || EMPTY_IMAGE;
  detailLogo.classList.toggle("is-empty", !business.logoUrl);
  detailLogo.onerror = () => {
    detailLogo.src = EMPTY_IMAGE;
    detailLogo.classList.add("is-empty");
  };

  Object.entries(fields).forEach(([key, input]) => {
    if (key === "sectionId") {
      input.value = business.sectionId || business.section?.id || "";
      return;
    }
    input.value = business[key] || "";
  });

  renderHours(business);
  renderList();
}

function renderList() {
  businessList.innerHTML = "";
  countBadge.textContent = String(applications.length);

  if (!applications.length) {
    const empty = document.createElement("p");
    empty.className = "business-meta";
    empty.textContent = "No hay solicitudes con este filtro.";
    businessList.appendChild(empty);
    return;
  }

  applications.forEach((business) => {
    const status = statusOf(business);
    const item = document.createElement("button");
    item.type = "button";
    item.className = `business-item ${selected?.id === business.id ? "active" : ""}`;
    item.addEventListener("click", () => fillDetail(business));

    const text = document.createElement("div");
    const logo = document.createElement("img");
    logo.className = "business-logo";
    logo.alt = `Logo de ${business.name || "negocio"}`;
    logo.src = mediaUrl(business.logoUrl) || EMPTY_IMAGE;
    logo.classList.toggle("is-empty", !business.logoUrl);
    logo.onerror = () => {
      logo.src = EMPTY_IMAGE;
      logo.classList.add("is-empty");
    };

    const name = document.createElement("div");
    name.className = "business-name";
    name.textContent = business.name || "Sin nombre";
    const meta = document.createElement("div");
    meta.className = "business-meta";
    meta.textContent = `${sectionTitleOf(business)} · ${business.licenseNumber || "Sin NIT"} · ${business.ownerEmail || "Sin correo"}`;
    text.appendChild(name);
    text.appendChild(meta);

    const badge = document.createElement("span");
    badge.className = `status-mini status-${status.toLowerCase()}`;
    badge.textContent = statusText(status);

    item.appendChild(logo);
    item.appendChild(text);
    item.appendChild(badge);
    businessList.appendChild(item);
  });
}

async function loadApplications() {
  refreshBtn.disabled = true;
  try {
    const status = statusFilter.value;
    const suffix = status ? `?status=${status}` : "";
    applications = await request(`/businesses/review-applications${suffix}`);
    selected = selected
      ? applications.find((business) => business.id === selected.id) || null
      : null;
    renderList();
    if (selected) fillDetail(selected);
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    refreshBtn.disabled = false;
  }
}

function detailPayload() {
  return {
    name: fields.name.value.trim(),
    licenseNumber: fields.licenseNumber.value.trim(),
    ownerFullName: fields.ownerFullName.value.trim(),
    ownerEmail: fields.ownerEmail.value.trim(),
    phoneNumber: fields.phoneNumber.value.trim(),
    mail: fields.mail.value.trim(),
    address: fields.address.value.trim(),
    logoUrl: fields.logoUrl.value.trim(),
    description: fields.description.value.trim(),
    sectionId: fields.sectionId.value ? Number(fields.sectionId.value) : null,
    openingHours: collectOpeningHours(),
  };
}

async function saveSelected() {
  if (!selected) return;
  saveBtn.disabled = true;
  try {
    await request(`/businesses/review-applications/${selected.id}`, {
      method: "PUT",
      body: JSON.stringify(detailPayload()),
    });
    showMessage("Cambios guardados.");
    await loadApplications();
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    saveBtn.disabled = false;
  }
}

async function changeStatus(action) {
  if (!selected) return;
  try {
    await request(`/businesses/review-applications/${selected.id}/${action}`, {
      method: "PATCH",
      body: "{}",
    });
    showMessage(action === "approve" ? "Negocio aprobado." : "Negocio rechazado.");
    await loadApplications();
  } catch (error) {
    showMessage(error.message, true);
  }
}

async function deleteSelected() {
  if (!selected) return;
  const ok = window.confirm(`Eliminar la solicitud de ${selected.name}?`);
  if (!ok) return;

  try {
    await request(`/businesses/review-applications/${selected.id}`, {
      method: "DELETE",
    });
    selected = null;
    detailForm.classList.add("hidden");
    emptyState.classList.remove("hidden");
    showMessage("Solicitud eliminada.");
    await loadApplications();
  } catch (error) {
    showMessage(error.message, true);
  }
}

refreshBtn.addEventListener("click", loadApplications);
statusFilter.addEventListener("change", loadApplications);
saveBtn.addEventListener("click", saveSelected);
approveBtn.addEventListener("click", () => changeStatus("approve"));
rejectBtn.addEventListener("click", () => changeStatus("reject"));
deleteBtn.addEventListener("click", deleteSelected);

Promise.all([loadSections(), loadApplications()]).catch((error) => showMessage(error.message, true));
