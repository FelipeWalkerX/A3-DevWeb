import { apiFetch } from "./api";

export function listarRespostas() {
  return apiFetch("/api/responses");
}

// Salva a resposta do aluno. A API chama a IA (Groq) e devolve a nota sugerida
export function enviarResposta(resposta) {
  return apiFetch("/api/responses", { method: "POST", body: resposta });
}

export function alterarStatus(id, status) {
  return apiFetch(`/api/responses/${id}`, { method: "PATCH", body: { status } });
}
