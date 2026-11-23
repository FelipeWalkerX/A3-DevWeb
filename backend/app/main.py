from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.dependencies import get_current_user
from app.config import CORS_ORIGINS
from app.database import initialize_database
from app.routes import auth, correcoes, questoes, respostas


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title="Clareia API",
    description=(
        "API de questões e respostas discursivas com correção sugerida por IA (Groq). "
        "Faça login em /api/auth/login e use o access token no botão Authorize."
    ),
    version="1.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

#Login e refresh ficam livres. Todo o resto exige o token Bearer
protegido = [Depends(get_current_user)]

app.include_router(auth.router)
app.include_router(questoes.router, dependencies=protegido)
app.include_router(respostas.router, dependencies=protegido)
app.include_router(correcoes.router, dependencies=protegido)


@app.get("/api/health", tags=["Sistema"])
def health() -> dict[str, str]:
    return {"status": "ok"}
