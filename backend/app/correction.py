import re
import unicodedata


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


def suggest_correction(question: dict, answer: str) -> dict:
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
