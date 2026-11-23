import { publicFetch } from "./api";
import { clearSession, saveSession } from "./session";

export async function login(username, password) {
  const data = await publicFetch("/api/auth/login", {
    method: "POST",
    body: { username, password },
  });
  const session = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    usuario: data.usuario,
  };
  saveSession(session);
  return session;
}

export function logout() {
  clearSession();
}
