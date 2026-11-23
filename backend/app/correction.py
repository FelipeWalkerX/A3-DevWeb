import json
import logging
import re
import unicodedata

from groq import Groq   #Importa a api
from app.config import GROQ_API_KEY, GROQ_MODEL #E a chave

logger = logging.getLogger(__name__)

STOP_WORDS = {
    "com",
    "das",
    "dos",
    "uma",
    "para",
    "pela",
    "pelo",
    "entre",
    "como",
    "cada",
    "sobre",
    "que",
    "uma",
}


def _terms(text: str) -> set[str]:
    normalized = unicodedata.normalize("NFKD", text)
    without_accents = "".join(
        character for character in normalized if not unicodedata.combining(character)
    )
    return {
        word
        for word in re.findall(r"[a-z0-9]{3,}", without_accents.lower())
        if word not in STOP_WORDS
    }


def _mock_correction(question: dict, answer: str) -> dict:
    answer_terms = _terms(answer)
    matched_criteria = 0
    for criterion in question["criterios"]:
        criterion_terms = _terms(criterion)
        if criterion_terms and len(criterion_terms & answer_terms) / len(criterion_terms) >= 0.3:
            matched_criteria += 1

    total_criteria = len(question["criterios"])
    score = round(question["nota_maxima"] * matched_criteria / total_criteria, 1)
    if matched_criteria == total_criteria:
        comment = (
            "Sugestão simulada: a resposta apresenta elementos relacionados aos "
            "critérios cadastrados. Revise o conteúdo antes de confirmar a nota."
        )
    elif matched_criteria:
        comment = (
            f"Sugestão simulada: foram identificados indícios de {matched_criteria} "
            f"de {total_criteria} critérios. Revise os pontos não contemplados."
        )
    else:
        comment = (
            "Sugestão simulada: não foram identificados elementos suficientes "
            "relacionados aos critérios. Revise a resposta antes de confirmar."
        )
    return {"nota_sugerida": score, "comentario_ia": comment, "metodo": "mock"}

def _ai_correction(question: dict, answer: str) -> dict:
    client = Groq(api_key=GROQ_API_KEY)
    criterios = "\n".join(f"- {c}" for c in question["criterios"])
    #O prompt é o bilhete que a ia espera, como a resposta certa, a nota maxima, etc
    prompt = f"""Você é um assistente que ajuda um professor a corrigir questões discursivas.   

Questão: {question["enunciado"]}
Resposta esperada: {question["resposta_esperada"]}
Critérios de correção: 
{criterios}
Nota máxima: {question["nota_maxima"]}

Resposta do aluno: {answer}

Responda só com um JSON assim: {{"nota": número de 0 até a nota máxima, "comentario": "explicação curta para o professor"}}"""

    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},        #Obriga a ia a responder em JSON
        temperature=0.2,        #Deixando a ia menos criativa e mais objetiva
    )
    data = json.loads(completion.choices[0].message.content)
    nota = max(0, min(float(data["nota"]), question["nota_maxima"]))        #Garante que a nota va de 0 ate o max permitido
    return {"nota_sugerida": round(nota, 1), "comentario_ia": data["comentario"], "metodo": "ia"}


def suggest_correction(question: dict, answer: str) -> dict:        #Se a ia nao funcionar ou der erro, ele usa uma resposta simulada
    if not GROQ_API_KEY:
        logger.warning("GROQ_API_KEY não configurada, usando correção simulada.")
        return _mock_correction(question, answer)
    try:
        return _ai_correction(question, answer)
    except Exception:
        logger.exception("Falha ao chamar o Groq, usando correção simulada.")
        return _mock_correction(question, answer)
