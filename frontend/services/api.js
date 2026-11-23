import { clearSession, getSession, saveSession } from "./session";

// Definida no .env.local (local) ou nas variáveis do projeto na Vercel
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Função chamada quando a sessão acaba (o AuthContext registra o logout aqui)
let onSessionExpired = () => {};
export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler;
}

function readErrorMessage(body, status) {
  const detail = body?.detail;
  if (typeof detail === "string") return detail;
  // Erro de validação do FastAPI (422) vem como lista
  if (Array.isArray(detail)) return detail.map((item) => item.msg).join(" ");
  return `Erro ${status} ao acessar a API.`;
}

async function send(path, { method = "GET", body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar à API. Se ela estiver hospedada no Render, aguarde alguns segundos e tente de novo.",
      0
    );
  }

  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(readErrorMessage(data, response.status), response.status);
  return data;
}

// Se várias requisições derem 401 juntas, só um refresh é feito
let refreshing = null;

async function refreshAccessToken() {
  const session = getSession();
  if (!session?.refreshToken) throw new ApiError("Sessão expirada.", 401);

  const data = await send("/api/auth/refresh", {
    method: "POST",
    body: { refreshToken: session.refreshToken },
  });
  saveSession({ ...session, accessToken: data.accessToken, usuario: data.usuario });
  return data.accessToken;
}

// Requisição para rotas protegidas: manda o Bearer e tenta renovar o token se ele expirou
export async function apiFetch(path, options = {}) {
  const token = getSession()?.accessToken;
  try {
    return await send(path, { ...options, token });
  } catch (error) {
    if (error.status !== 401) throw error;
  }

  try {
    refreshing ??= refreshAccessToken().finally(() => {
      refreshing = null;
    });
    const newToken = await refreshing;
    return await send(path, { ...options, token: newToken });
  } catch (error) {
    if (error.status === 401) {
      clearSession();
      onSessionExpired();
      throw new ApiError("Sua sessão expirou. Faça login novamente.", 401);
    }
    throw error;
  }
}

// Requisição sem token (login)
export function publicFetch(path, options) {
  return send(path, options);
}
