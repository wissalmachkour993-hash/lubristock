type RuntimeClientConfig = {
  apiBaseUrl: string;
  email: string;
  password: string;
};

const FALLBACK_CONFIG: RuntimeClientConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  email: process.env.NEXT_PUBLIC_API_EMAIL ?? "admin@ocp.ma",
  password: process.env.NEXT_PUBLIC_API_PASSWORD ?? "admin123",
};

let runtimeConfigPromise: Promise<RuntimeClientConfig> | null = null;
let tokenCache: { key: string; token: string } | null = null;
let resolvedApiBaseUrl: string | null = null;

function normalizeApiBaseUrl(configured: string) {
  if (typeof window === "undefined") return configured.replace(/\/$/, "");

  const hostname = window.location.hostname;
  if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") {
    return configured.replace(/\/$/, "");
  }

  // Si l'app est ouverte depuis un autre appareil (LAN), éviter localhost côté navigateur.
  if (configured.includes("localhost") || configured.includes("127.0.0.1")) {
    try {
      const parsed = new URL(configured);
      parsed.hostname = hostname;
      return parsed.toString().replace(/\/$/, "");
    } catch {
      return `http://${hostname}:4000/api`;
    }
  }

  return configured.replace(/\/$/, "");
}

async function getRuntimeConfig(): Promise<RuntimeClientConfig> {
  if (typeof window === "undefined") {
    return { ...FALLBACK_CONFIG, apiBaseUrl: normalizeApiBaseUrl(FALLBACK_CONFIG.apiBaseUrl) };
  }
  if (runtimeConfigPromise) return runtimeConfigPromise;

  runtimeConfigPromise = fetch("/api/runtime-config", { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) return FALLBACK_CONFIG;
      const data = (await response.json()) as Partial<RuntimeClientConfig>;
      return {
        apiBaseUrl: data.apiBaseUrl ?? FALLBACK_CONFIG.apiBaseUrl,
        email: data.email ?? FALLBACK_CONFIG.email,
        password: data.password ?? FALLBACK_CONFIG.password,
      };
    })
    .catch(() => FALLBACK_CONFIG)
    .then((cfg) => ({ ...cfg, apiBaseUrl: normalizeApiBaseUrl(cfg.apiBaseUrl) }));

  return runtimeConfigPromise;
}

function dedupe(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function buildApiBaseUrlCandidates(primary: string): string[] {
  const normalizedPrimary = normalizeApiBaseUrl(primary);
  const candidates = [normalizedPrimary];

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    if (hostname) {
      candidates.push(`${protocol}//${hostname}:4000/api`);
      candidates.push(`http://${hostname}:4000/api`);
    }
  }

  candidates.push("http://localhost:4000/api");
  candidates.push("http://127.0.0.1:4000/api");
  return dedupe(candidates.map((u) => u.replace(/\/$/, "")));
}

async function fetchWithApiFallback(
  path: string,
  init: RequestInit,
  preferredBaseUrl?: string
): Promise<{ response: Response; baseUrl: string }> {
  const { apiBaseUrl } = await getRuntimeConfig();
  const candidates = buildApiBaseUrlCandidates(preferredBaseUrl ?? resolvedApiBaseUrl ?? apiBaseUrl);
  let lastNetworkError: unknown = null;

  for (const baseUrl of candidates) {
    try {
      const response = await fetch(`${baseUrl}${path}`, init);
      resolvedApiBaseUrl = baseUrl;
      return { response, baseUrl };
    } catch (error) {
      lastNetworkError = error;
    }
  }

  throw new Error(
    `Impossible de joindre l'API (${candidates.join(" | ")}). Vérifiez que le backend tourne et que NEXT_PUBLIC_API_URL est correct.`,
    { cause: lastNetworkError }
  );
}

async function loginIfNeeded() {
  const config = await getRuntimeConfig();
  const baseForKey = resolvedApiBaseUrl ?? config.apiBaseUrl;
  const cacheKey = `${baseForKey}|${config.email}`;
  if (tokenCache?.key === cacheKey && tokenCache.token) return tokenCache.token;

  const { response, baseUrl } = await fetchWithApiFallback("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: config.email, password: config.password }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Connexion API impossible");
  }
  const data = (await response.json()) as { token?: string };
  if (!data.token) throw new Error("Token JWT absent après login");
  tokenCache = { key: `${baseUrl}|${config.email}`, token: data.token };
  return tokenCache.token;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await loginIfNeeded();
  const headers = new Headers(options.headers ?? {});
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Authorization", `Bearer ${token}`);

  const { response } = await fetchWithApiFallback(path, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erreur API");
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function apiUpload<T>(path: string, file: File): Promise<T> {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest<T>(path, { method: "POST", body: formData });
}

/** Télécharge un fichier binaire (export / modèle) avec le même jeton que les autres appels. */
export async function apiDownloadBlob(path: string, downloadFileName: string): Promise<void> {
  const token = await loginIfNeeded();
  const { response } = await fetchWithApiFallback(path, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erreur téléchargement");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = downloadFileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
