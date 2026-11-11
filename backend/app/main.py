import json
import os
import sqlite3
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware

from app.correction import suggest_correction
from app.database import connect, initialize_database
from app.models import (
    CorrectionInput,
    CorrectionOut,
    QuestionInput,
    QuestionOut,
    ResponseInput,
    ResponseOut,
    ResponseStatusUpdate,
)


def _question_from_row(row: sqlite3.Row) -> dict:
    question = dict(row)
    question["criterios"] = json.loads(question.pop("criterios_json"))
    return question


def _response_from_row(row: sqlite3.Row) -> dict:
    return dict(row)


def _get_question(connection: sqlite3.Connection, question_id: str) -> dict:
    row = connection.execute(
        "SELECT * FROM questions WHERE id = ?", (question_id,)
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Questão não encontrada.")
    return _question_from_row(row)


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title="Clareia API",
    description=(
        "API local de questões e respostas com persistência SQLite e "
        "sugestões de correção demonstrativas."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/questions", response_model=list[QuestionOut])
def list_questions() -> list[dict]:
    with connect() as connection:
        rows = connection.execute("SELECT * FROM questions ORDER BY rowid DESC").fetchall()
        return [_question_from_row(row) for row in rows]


@app.post(
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


@app.get("/api/questions/{question_id}", response_model=QuestionOut)
def get_question(question_id: str) -> dict:
    with connect() as connection:
        return _get_question(connection, question_id)


@app.put("/api/questions/{question_id}", response_model=QuestionOut)
def replace_question(question_id: str, payload: QuestionInput) -> dict:
    question = payload.model_dump()
    with connect() as connection:
        existing = _get_question(connection, question_id)
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


@app.delete("/api/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: str) -> Response:
    with connect() as connection:
        _get_question(connection, question_id)
        try:
            connection.execute("DELETE FROM questions WHERE id = ?", (question_id,))
        except sqlite3.IntegrityError as error:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Não é possível excluir uma questão que já possui respostas.",
            ) from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/api/responses", response_model=list[ResponseOut])
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
        return [_response_from_row(row) for row in rows]


@app.post(
    "/api/responses",
    response_model=ResponseOut,
    status_code=status.HTTP_201_CREATED,
)
def create_response(payload: ResponseInput) -> dict:
    response = payload.model_dump()
    response_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    with connect() as connection:
        question = _get_question(connection, response["question_id"])
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


@app.get("/api/responses/{response_id}", response_model=ResponseOut)
def get_response(response_id: str) -> dict:
    with connect() as connection:
        row = connection.execute(
            "SELECT * FROM responses WHERE id = ?", (response_id,)
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Resposta não encontrada.")
        return _response_from_row(row)


@app.patch("/api/responses/{response_id}", response_model=ResponseOut)
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
        return _response_from_row(updated_row)


@app.delete("/api/responses/{response_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_response(response_id: str) -> Response:
    with connect() as connection:
        cursor = connection.execute(
            "DELETE FROM responses WHERE id = ?", (response_id,)
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Resposta não encontrada.")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.post("/api/corrections", response_model=CorrectionOut)
def preview_correction(payload: CorrectionInput) -> dict:
    with connect() as connection:
        question = _get_question(connection, payload.question_id)
    return suggest_correction(question, payload.resposta)
