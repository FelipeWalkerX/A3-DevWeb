import json
import os
import re
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterator
from fastapi import HTTPException


from app.auth.security import hash_password
from app.config import ADMIN_NAME, ADMIN_PASSWORD, ADMIN_USERNAME

BACKEND_DIR = Path(__file__).resolve().parents[1]
SEED_DIR = Path(__file__).resolve().parent / "seed"


def database_path() -> Path:
    configured_path = os.environ.get("CLAREIA_DATABASE_PATH")
    if configured_path:
        return Path(configured_path)
    return BACKEND_DIR / "data" / "clareia.sqlite3"


@contextmanager
def connect() -> Iterator[sqlite3.Connection]:
    path = database_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def _load_seed_file(path: Path) -> list[dict]:
    try:
        with path.open(encoding="utf-8") as seed_file:
            records = json.load(seed_file)
    except (OSError, json.JSONDecodeError) as error:
        raise RuntimeError(f"Não foi possível carregar os dados iniciais: {path}") from error
    if not isinstance(records, list):
        raise RuntimeError(f"O arquivo de dados iniciais precisa conter uma lista: {path}")
    return records


def _normalize_criteria(value: str | list[str]) -> list[str]:
    if isinstance(value, str):
        criteria = re.split(r"\s*[;,]\s*|\s+e\s+", value.strip(), flags=re.IGNORECASE)
    elif isinstance(value, list):
        criteria = value
    else:
        raise RuntimeError("Os critérios de correção precisam ser um texto ou uma lista.")
    normalized = [criterion.strip() for criterion in criteria if criterion.strip()]
    if not normalized:
        raise RuntimeError("Cada questão inicial precisa ter ao menos um critério.")
    return normalized


def _create_admin_user(connection: sqlite3.Connection) -> None:
    #Cria o professor definido nas variaveis de ambiente, so na primeira vez
    if find_user(connection, ADMIN_USERNAME):
        return
    connection.execute(
        "INSERT INTO users (username, nome, password_hash, created_at) VALUES (?, ?, ?, ?)",
        (
            ADMIN_USERNAME,
            ADMIN_NAME,
            hash_password(ADMIN_PASSWORD),
            datetime.now(timezone.utc).isoformat(),
        ),
    )


def initialize_database() -> None:
    with connect() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS questions (
                id TEXT PRIMARY KEY,
                disciplina TEXT NOT NULL,
                turma TEXT NOT NULL,
                enunciado TEXT NOT NULL,
                resposta_esperada TEXT NOT NULL,
                criterios_json TEXT NOT NULL,
                nota_maxima REAL NOT NULL CHECK (nota_maxima > 0 AND nota_maxima <= 10),
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS responses (
                id TEXT PRIMARY KEY,
                question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
                aluno TEXT NOT NULL,
                turma TEXT NOT NULL,
                resposta TEXT NOT NULL,
                nota_sugerida REAL NOT NULL CHECK (nota_sugerida >= 0),
                comentario_ia TEXT NOT NULL,
                status TEXT NOT NULL CHECK (status IN ('pendente', 'revisada')),
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS responses_question_id_idx
                ON responses(question_id);
            CREATE INDEX IF NOT EXISTS responses_status_idx
                ON responses(status);
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                nome TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            """
        )
        _create_admin_user(connection)
        question_count = connection.execute(
            "SELECT COUNT(*) FROM questions"
        ).fetchone()[0]
        if question_count:
            return

        questions = _load_seed_file(SEED_DIR / "questoes.json")
        responses = _load_seed_file(SEED_DIR / "respostas.json")
        created_at = datetime.now(timezone.utc).isoformat()
        questions_by_id = {}
        for question in questions:
            question_id = str(question["id"])
            criteria = _normalize_criteria(question["criterios"])
            questions_by_id[question_id] = {**question, "id": question_id, "criterios": criteria}
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
                    question["respostaEsperada"],
                    json.dumps(criteria, ensure_ascii=False),
                    question["notaMaxima"],
                    created_at,
                ),
            )
        for response in responses:
            question_id = str(response["questaoId"])
            question = questions_by_id.get(question_id)
            if question is None:
                raise RuntimeError(
                    f"A resposta inicial {response['id']} referencia uma questão inexistente."
                )
            answer = response.get("resposta", response.get("texto"))
            if not isinstance(answer, str) or not answer.strip():
                raise RuntimeError(
                    f"A resposta inicial {response['id']} não contém o texto do aluno."
                )
            connection.execute(
                """
                INSERT INTO responses (
                    id, question_id, aluno, turma, resposta, nota_sugerida,
                    comentario_ia, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    str(response["id"]),
                    question_id,
                    response["aluno"],
                    response.get("turma", question["turma"]),
                    answer.strip(),
                    response["notaSugerida"],
                    response["comentarioIA"],
                    response["status"],
                    created_at,
                ),
            )


def question_from_row(row: sqlite3.Row) -> dict:
    question = dict(row)
    question["criterios"] = json.loads(question.pop("criterios_json"))
    return question


def response_from_row(row: sqlite3.Row) -> dict:
    return dict(row)


def find_question(connection: sqlite3.Connection, question_id: str) -> dict:
    row = connection.execute(
        "SELECT * FROM questions WHERE id = ?", (question_id,)
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Questão não encontrada.")
    return question_from_row(row)


def find_user(connection: sqlite3.Connection, username: str) -> dict | None:
    row = connection.execute(
        "SELECT * FROM users WHERE username = ?", (username,)
    ).fetchone()
    return dict(row) if row else None
