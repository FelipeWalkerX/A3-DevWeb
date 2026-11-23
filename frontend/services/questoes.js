import { apiFetch } from "./api";

export function listarQuestoes() {
  return apiFetch("/api/questions");
}

export function criarQuestao(questao) {
  return apiFetch("/api/questions", { method: "POST", body: questao });
}
