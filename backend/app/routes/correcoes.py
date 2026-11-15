from fastapi import APIRouter

from app.correction import suggest_correction
from app.database import connect, find_question
from app.models import CorrectionInput, CorrectionOut

router = APIRouter(tags=["Correção com IA"])


@router.post("/api/corrections", response_model=CorrectionOut)
def preview_correction(payload: CorrectionInput) -> dict:
    with connect() as connection:
        question = find_question(connection, payload.question_id)
    return suggest_correction(question, payload.resposta)