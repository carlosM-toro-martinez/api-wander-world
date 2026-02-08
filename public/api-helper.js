const endpoints = [
  {
    key: "auth-register",
    label: "Auth - Register",
    method: "POST",
    path: "/auth/register",
    body: {
      name: "Juan Perez",
      email: "juan@example.com",
      password: "123456",
      initials: "JP"
    }
  },
  {
    key: "auth-login",
    label: "Auth - Login",
    method: "POST",
    path: "/auth/login",
    body: {
      email: "juan@example.com",
      password: "123456"
    }
  },
  {
    key: "auth-logout",
    label: "Auth - Logout",
    method: "POST",
    path: "/auth/logout",
    body: {}
  },
  {
    key: "profiles-post",
    label: "Profiles - Create",
    method: "POST",
    path: "/profiles",
    fileFields: ["avatar", "image"],
    body: {
      name: "Usuario Demo",
      email: "demo@example.com",
      password: "123456",
      initials: "UD",
      avatarUrl: "",
      stats: { trips: 0, countries: 0, favorites: 0 },
      favoriteDestinationIds: []
    }
  },
  {
    key: "profiles-put",
    label: "Profiles - Update",
    method: "PUT",
    path: "/profiles/:id",
    fileFields: ["avatar", "image"],
    body: {
      name: "Usuario Actualizado",
      email: "demo@example.com",
      password: "123456",
      initials: "UA",
      avatarUrl: ""
    }
  },
  {
    key: "categories-post",
    label: "Categories - Create",
    method: "POST",
    path: "/categories",
    fileFields: ["image"],
    body: {
      title: "Aventura",
      image: "",
      count: 0
    }
  },
  {
    key: "categories-put",
    label: "Categories - Update",
    method: "PUT",
    path: "/categories/:id",
    fileFields: ["image"],
    body: {
      title: "Aventura Premium",
      image: "",
      count: 3
    }
  },
  {
    key: "sections-post",
    label: "Sections - Create",
    method: "POST",
    path: "/sections",
    fileFields: ["image", "icon"],
    body: {
      title: "Gastronomía",
      titleEn: "Gastronomy",
      description: "",
      descriptionEn: "",
      imageUrl: "",
      iconUrl: ""
    }
  },
  {
    key: "sections-put",
    label: "Sections - Update",
    method: "PUT",
    path: "/sections/:id",
    fileFields: ["image", "icon"],
    body: {
      title: "Gastronomía Local",
      titleEn: "Local Gastronomy",
      description: "",
      descriptionEn: "",
      imageUrl: "",
      iconUrl: ""
    }
  },
  {
    key: "businesses-post",
    label: "Businesses - Create",
    method: "POST",
    path: "/businesses",
    fileFields: ["logo", "image"],
    body: {
      name: "Café Central",
      description: "",
      descriptionEn: "",
      daysAttention: "Lun - Sab",
      logoUrl: "",
      phoneNumber: "",
      websiteUrl: "",
      mail: "",
      address: "",
      isActive: true,
      sectionId: 1,
      ownerFullName: "",
      ownerEmail: "",
      ownerPassword: "",
      subscriptionStartedAt: "2026-01-01",
      subscriptionEndsAt: "2026-12-31",
      subscriptionStatus: "ACTIVE",
      licenseNumber: ""
    }
  },
  {
    key: "businesses-put",
    label: "Businesses - Update",
    method: "PUT",
    path: "/businesses/:id",
    fileFields: ["logo", "image"],
    body: {
      name: "Café Central (Actualizado)",
      description: "",
      isActive: true,
      sectionId: 1
    }
  },
  {
    key: "admins-post",
    label: "Admins - Create",
    method: "POST",
    path: "/admins",
    body: {
      username: "admin1",
      password: "123456",
      businessId: 1
    }
  },
  {
    key: "admins-put",
    label: "Admins - Update",
    method: "PUT",
    path: "/admins/:id",
    body: {
      username: "admin1",
      password: "123456",
      businessId: 1
    }
  },
  {
    key: "social-post",
    label: "Social Networks - Create",
    method: "POST",
    path: "/social-networks",
    body: {
      businessId: 1,
      facebookUrl: "",
      instagramUrl: "",
      twitterUrl: "",
      tiktokUrl: "",
      whatsappNumber: ""
    }
  },
  {
    key: "social-put",
    label: "Social Networks - Update",
    method: "PUT",
    path: "/social-networks/:id",
    body: {
      facebookUrl: "",
      instagramUrl: "",
      twitterUrl: "",
      tiktokUrl: "",
      whatsappNumber: ""
    }
  },
  {
    key: "promotions-post",
    label: "Promotions - Create",
    method: "POST",
    path: "/promotions",
    body: {
      businessId: 1,
      promotionDetails: "2x1 en desayuno",
      promotionDetailsEn: "2x1 breakfast",
      price: "50"
    }
  },
  {
    key: "promotions-put",
    label: "Promotions - Update",
    method: "PUT",
    path: "/promotions/:id",
    body: {
      promotionDetails: "Promo actualizada",
      promotionDetailsEn: "Updated promo",
      price: "60"
    }
  },
  {
    key: "products-post",
    label: "Products - Create",
    method: "POST",
    path: "/products",
    body: {
      businessId: 1,
      productDetails: "Producto demo",
      productDetailsEn: "Demo product",
      price: "25"
    }
  },
  {
    key: "products-put",
    label: "Products - Update",
    method: "PUT",
    path: "/products/:id",
    body: {
      productDetails: "Producto actualizado",
      productDetailsEn: "Updated product",
      price: "30"
    }
  },
  {
    key: "opening-hours-post",
    label: "Opening Hours - Create",
    method: "POST",
    path: "/opening-hours",
    body: {
      businessId: 1,
      weekend: "Sáb - Dom",
      morningHours: ["08:00-12:00"],
      afternoonHours: ["14:00-18:00"]
    }
  },
  {
    key: "opening-hours-put",
    label: "Opening Hours - Update",
    method: "PUT",
    path: "/opening-hours/:id",
    body: {
      weekend: "Dom",
      morningHours: ["09:00-12:00"],
      afternoonHours: ["15:00-19:00"]
    }
  },
  {
    key: "images-post",
    label: "Images - Create",
    method: "POST",
    path: "/images",
    fileFields: ["image"],
    body: {
      businessId: 1,
      imageUrl: "/uploads/demo.jpg"
    }
  },
  {
    key: "images-put",
    label: "Images - Update",
    method: "PUT",
    path: "/images/:id",
    fileFields: ["image"],
    body: {
      imageUrl: "/uploads/demo2.jpg"
    }
  },
  {
    key: "favorites-post",
    label: "Favorites - Create",
    method: "POST",
    path: "/favorites",
    body: {
      userId: 1,
      destinationId: 1
    }
  },
  {
    key: "notifications-post",
    label: "Notifications - Create",
    method: "POST",
    path: "/notifications",
    body: {
      userId: 1,
      icon: "mail",
      iconBg: "blue",
      iconColor: "white",
      title: "Nueva notificación",
      description: "Detalle aquí",
      time: "10:30",
      unread: true
    }
  },
  {
    key: "notifications-put",
    label: "Notifications - Update",
    method: "PUT",
    path: "/notifications/:id",
    body: {
      title: "Actualizado",
      description: "Detalle actualizado",
      time: "12:00",
      unread: false
    }
  },
  {
    key: "trips-post",
    label: "Trips - Create",
    method: "POST",
    path: "/trips",
    fileFields: ["image"],
    body: {
      userId: 1,
      destinationId: 1,
      name: "Viaje Demo",
      country: "Bolivia",
      image: "",
      date: "10/02/2026",
      travelers: "2 adultos",
      status: "PENDING",
      bookingNumber: "ABC-123"
    }
  },
  {
    key: "trips-put",
    label: "Trips - Update",
    method: "PUT",
    path: "/trips/:id",
    fileFields: ["image"],
    body: {
      name: "Viaje Actualizado",
      status: "CONFIRMED"
    }
  },
  {
    key: "destinations-post",
    label: "Destinations - Create (con imagen)",
    method: "POST",
    path: "/destinations",
    fileFields: ["image"],
    body: {
      name: "Cerro Rico",
      location: "Potosí",
      image: "",
      rating: 4.5,
      reviews: 0,
      price: 120,
      categoryId: 1,
      businessId: 1,
      description: "Descripción breve",
      durationDays: 2,
      groupSize: "4-8",
      availability: "Todo el año",
      includes: ["Guía", "Transporte"],
      itinerary: [
        { day: 1, title: "Día 1", description: "Actividad 1" },
        { day: 2, title: "Día 2", description: "Actividad 2" }
      ],
      reviewsDetail: [
        { name: "Ana", rating: 5, comment: "Excelente", date: "10 Ene 2026" }
      ]
    }
  },
  {
    key: "destinations-put",
    label: "Destinations - Update",
    method: "PUT",
    path: "/destinations/:id",
    fileFields: ["image"],
    body: {
      name: "Cerro Rico Actualizado",
      price: 150,
      availability: "Temporada alta"
    }
  }
];

const endpointSelect = document.getElementById("endpointSelect");
const baseUrlInput = document.getElementById("baseUrl");
const authTokenInput = document.getElementById("authToken");
const methodInput = document.getElementById("method");
const pathInput = document.getElementById("path");
const resourceIdInput = document.getElementById("resourceId");
const bodyInput = document.getElementById("bodyInput");
const fileInputs = document.getElementById("fileInputs");
const sendBtn = document.getElementById("sendBtn");
const copyCurlBtn = document.getElementById("copyCurlBtn");
const statusEl = document.getElementById("status");
const timeEl = document.getElementById("time");
const responseEl = document.getElementById("response");

function pretty(value) {
  return JSON.stringify(value, null, 2);
}

function setEndpoint(endpoint) {
  methodInput.value = endpoint.method;
  pathInput.value = endpoint.path;
  bodyInput.value = pretty(endpoint.body ?? {});
  renderFileInputs(endpoint.fileFields || []);
}

function buildUrl(endpoint) {
  const base = baseUrlInput.value.replace(/\/+$/, "");
  let path = endpoint.path;
  if (path.includes(":id")) {
    const id = resourceIdInput.value.trim();
    if (!id) throw new Error("Falta el ID para el endpoint.");
    path = path.replace(":id", id);
  }
  return `${base}${path}`;
}

function buildHeaders() {
  const headers = {};
  const token = authTokenInput.value.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function buildFormData(data) {
  const form = new FormData();
  Object.entries(data || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === "object") {
      form.append(key, JSON.stringify(value));
    } else {
      form.append(key, String(value));
    }
  });
  return form;
}

function renderFileInputs(fields) {
  fileInputs.innerHTML = "";
  if (!fields.length) {
    const empty = document.createElement("small");
    empty.textContent = "Este endpoint no requiere archivos.";
    fileInputs.appendChild(empty);
    return;
  }
  fields.forEach(name => {
    const wrapper = document.createElement("div");
    wrapper.className = "file-item";
    const label = document.createElement("small");
    label.textContent = `Campo: ${name}`;
    const input = document.createElement("input");
    input.type = "file";
    input.dataset.field = name;
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    fileInputs.appendChild(wrapper);
  });
}

function updateResponse(status, ms, data) {
  statusEl.textContent = `Status: ${status}`;
  timeEl.textContent = `Tiempo: ${ms} ms`;
  responseEl.textContent = typeof data === "string" ? data : pretty(data);
}

function currentEndpoint() {
  const key = endpointSelect.value;
  return endpoints.find(e => e.key === key);
}

endpointSelect.addEventListener("change", () => {
  const endpoint = currentEndpoint();
  if (endpoint) setEndpoint(endpoint);
});

sendBtn.addEventListener("click", async () => {
  const endpoint = currentEndpoint();
  if (!endpoint) return;

  let data;
  try {
    data = JSON.parse(bodyInput.value || "{}");
  } catch (error) {
    updateResponse("Error", 0, { error: "JSON inválido en el body." });
    return;
  }

  let url;
  try {
    url = buildUrl(endpoint);
  } catch (error) {
    updateResponse("Error", 0, { error: error.message });
    return;
  }

  const headers = buildHeaders();
  const options = { method: endpoint.method, headers };
  const start = performance.now();

  const fileFieldInputs = Array.from(
    fileInputs.querySelectorAll('input[type="file"]')
  );
  const hasSelectedFile = fileFieldInputs.some(input => input.files && input.files[0]);
  const hasFileFields = (endpoint.fileFields || []).length > 0;

  if (hasFileFields && hasSelectedFile) {
    const form = buildFormData(data);
    fileFieldInputs.forEach(input => {
      const file = input.files && input.files[0];
      if (file) {
        form.append(input.dataset.field, file);
      }
    });
    options.body = form;
  } else {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(data);
  }

  try {
    const res = await fetch(url, options);
    const text = await res.text();
    let json;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = text;
    }
    const elapsed = Math.round(performance.now() - start);
    updateResponse(res.status, elapsed, json);
  } catch (error) {
    updateResponse("Error", 0, { error: error.message });
  }
});

copyCurlBtn.addEventListener("click", async () => {
  const endpoint = currentEndpoint();
  if (!endpoint) return;
  let data;
  try {
    data = JSON.parse(bodyInput.value || "{}");
  } catch {
    data = {};
  }
  let url;
  try {
    url = buildUrl(endpoint);
  } catch {
    url = buildUrl({ ...endpoint, path: endpoint.path.replace(":id", "ID") });
  }
  const token = authTokenInput.value.trim();
  const headers = [];
  if (token) headers.push(`-H "Authorization: Bearer ${token}"`);
  let curl = `curl -X ${endpoint.method} "${url}"`;
  const hasFileFields = (endpoint.fileFields || []).length > 0;
  if (hasFileFields) {
    Object.entries(data || {}).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      const serialized = typeof value === "object" ? JSON.stringify(value) : String(value);
      curl += ` -F "${key}=${serialized}"`;
    });
    (endpoint.fileFields || []).forEach(name => {
      curl += ` -F "${name}=@/ruta/a/archivo.jpg"`;
    });
  } else {
    curl += ` -H "Content-Type: application/json"`;
    curl += ` -d '${JSON.stringify(data)}'`;
  }
  if (headers.length) curl += ` ${headers.join(" ")}`;
  await navigator.clipboard.writeText(curl);
});

function init() {
  endpoints.forEach(endpoint => {
    const option = document.createElement("option");
    option.value = endpoint.key;
    option.textContent = `${endpoint.method} ${endpoint.path} — ${endpoint.label}`;
    endpointSelect.appendChild(option);
  });
  setEndpoint(endpoints[0]);
}

init();
