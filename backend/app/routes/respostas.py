import uuid
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, HTTPException, Query, Response, status

from app.correction import suggest_correction
from app.database import connect, find_question, response_from_row
from app.models import ResponseInput, ResponseOut, ResponseStatusUpdate

router = APIRouter(tags=["Respostas"])

@router.get("/api/responses", response_model=list[ResponseOut])
def list_responses(
    response_status: Literal["pendente", "revisada"] | None = Query(
        default=None, alias="status"
    ),
) -> list[dict]:
    with connect() as connection:
        if response_status:
            rows = connection.execute(
                "SELECT * FROM responses WHERE status = ? ORDER BY rowid DESC",
                (response_status,),
            ).fetchall()
        else:
            rows = connection.execute(
                "SELECT * FROM responses ORDER BY rowid DESC"
            ).fetchall()
        return [response_from_row(row) for row in rows]


@router.post(
    "/api/responses",
    response_model=ResponseOut,
    status_code=status.HTTP_201_CREATED,
)
def create_response(payload: ResponseInput) -> dict:
    response = payload.model_dump()
    response_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    with connect() as connection:
        question = find_question(connection, response["question_id"])
        correction = suggest_correction(question, response["resposta"])
        record = {
            "id": response_id,
            "question_id": response["question_id"],
            "aluno": response["aluno"],
            "turma": response["turma"] or question["turma"],
            "resposta": response["resposta"],
            "nota_sugerida": correction["nota_sugerida"],
            "comentario_ia": correction["comentario_ia"],
            "status": "pendente",
            "created_at": created_at,
        }
        connection.execute(
            """
            INSERT INTO responses (
                id, question_id, aluno, turma, resposta, nota_sugerida,
                comentario_ia, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            tuple(record.values()),
        )
    return record


@router.get("/api/responses/{response_id}", response_model=ResponseOut)
def get_response(response_id: str) -> dict:
    with connect() as connection:
        row = connection.execute(
            "SELECT * FROM responses WHERE id = ?", (response_id,)
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Resposta não encontrada.")
        return response_from_row(row)


@router.patch("/api/responses/{response_id}", response_model=ResponseOut)
def update_response_status(
    response_id: str, payload: ResponseStatusUpdate
) -> dict:
    with connect() as connection:
        row = connection.execute(
            "SELECT * FROM responses WHERE id = ?", (response_id,)
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Resposta não encontrada.")
        connection.execute(
            "UPDATE responses SET status = ? WHERE id = ?",
            (payload.status, response_id),
        )
        updated_row = connection.execute(
            "SELECT * FROM responses WHERE id = ?", (response_id,)
        ).fetchone()
        return response_from_row(updated_row)


@router.delete("/api/responses/{response_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_response(response_id: str) -> Response:
    with connect() as connection:
        cursor = connection.execute(
            "DELETE FROM responses WHERE id = ?", (response_id,)
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Resposta não encontrada.")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
