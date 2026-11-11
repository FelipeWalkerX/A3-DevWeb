from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(
        part.upper() if part == "ia" else part.capitalize() for part in rest
    )


class APIModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class QuestionInput(APIModel):
    disciplina: str = Field(min_length=1, max_length=100)
    turma: str = Field(min_length=1, max_length=100)
    enunciado: str = Field(min_length=1, max_length=2000)
    resposta_esperada: str = Field(min_length=1, max_length=5000)
    criterios: list[str] = Field(min_length=1, max_length=30)
    nota_maxima: float = Field(gt=0, le=10)

    @field_validator(
        "disciplina",
        "turma",
        "enunciado",
        "resposta_esperada",
    )
    @classmethod
    def reject_blank_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Este campo não pode ficar vazio.")
        return value

    @field_validator("criterios")
    @classmethod
    def reject_blank_criteria(cls, value: list[str]) -> list[str]:
        cleaned = [criterion.strip() for criterion in value]
        if any(not criterion for criterion in cleaned):
            raise ValueError("Os critérios não podem ficar vazios.")
        return cleaned


class QuestionOut(QuestionInput):
    id: str
    created_at: str


class ResponseInput(APIModel):
    question_id: str = Field(min_length=1)
    aluno: str = Field(min_length=1, max_length=150)
    resposta: str = Field(min_length=1, max_length=10000)
    turma: str | None = Field(default=None, max_length=100)

    @field_validator("question_id", "aluno", "resposta", "turma")
    @classmethod
    def trim_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Este campo não pode ficar vazio.")
        return value


class ResponseOut(APIModel):
    id: str
    question_id: str
    aluno: str
    turma: str
    resposta: str
    nota_sugerida: float
    comentario_ia: str
    status: Literal["pendente", "revisada"]
    created_at: str


class ResponseStatusUpdate(APIModel):
    status: Literal["pendente", "revisada"]


class CorrectionInput(APIModel):
    question_id: str = Field(min_length=1)
    resposta: str = Field(min_length=1, max_length=10000)

    @field_validator("question_id", "resposta")
    @classmethod
    def trim_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Este campo não pode ficar vazio.")
        return value


class CorrectionOut(APIModel):
    nota_sugerida: float
    comentario_ia: str
    metodo: Literal["mock"] = "mock"
