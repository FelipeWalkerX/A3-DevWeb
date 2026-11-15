import json
import sqlite3
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Response, status

from app.database import connect, find_question, question_from_row
from app.models import QuestionInput, QuestionOut

router = APIRouter(tags=["Questões"])

@router.get("/api/questions", response_model=list[QuestionOut])
def list_questions() -> list[dict]:
    with connect() as connection:
        rows = connection.execute("SELECT * FROM questions ORDER BY rowid DESC").fetchall()
        return [question_from_row(row) for row in rows]


@router.post(
    "/api/questions",
    response_model=QuestionOut,
    status_code=status.HTTP_201_CREATED,
)
def create_question(payload: QuestionInput) -> dict:
    question = payload.model_dump()
    question_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    with connect() as connection:
        connection.execute(
            """
            INSERT INTO questions (
                id, disciplina, turma, enunciado, resposta_esperada,
                criterios_json, nota_maxima, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                question_id,
                question["disciplina"],
                question["turma"],
                question["enunciado"],
                question["resposta_esperada"],
                json.dumps(question["criterios"], ensure_ascii=False),
                question["nota_maxima"],
                created_at,
            ),
        )
    return {"id": question_id, **question, "created_at": created_at}


@router.get("/api/questions/{question_id}", response_model=QuestionOut)
def get_question(question_id: str) -> dict:
    with connect() as connection:
        return find_question(connection, question_id)


@router.put("/api/questions/{question_id}", response_model=QuestionOut)
def replace_question(question_id: str, payload: QuestionInput) -> dict:
    question = payload.model_dump()
    with connect() as connection:
        existing = find_question(connection, question_id)
        connection.execute(
            """
            UPDATE questions
            SET disciplina = ?, turma = ?, enunciado = ?, resposta_esperada = ?,
                criterios_json = ?, nota_maxima = ?
            WHERE id = ?
            """,
            (
                question["disciplina"],
                question["turma"],
                question["enunciado"],
                question["resposta_esperada"],
                json.dumps(question["criterios"], ensure_ascii=False),
                question["nota_maxima"],
                question_id,
            ),
        )
        return {**existing, **question}


@router.delete("/api/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: str) -> Response:
    with connect() as connection:
        find_question(connection, question_id)
        try:
            connection.execute("DELETE FROM questions WHERE id = ?", (question_id,))
        except sqlite3.IntegrityError as error:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Não é possível excluir uma questão que já possui respostas.",
            ) from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)