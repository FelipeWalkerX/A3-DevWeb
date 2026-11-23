import jwt
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.auth.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)
from app.config import ACCESS_TOKEN_MINUTES
from app.database import connect, find_user
from app.models import LoginInput, RefreshInput, TokenOut, UserOut

router = APIRouter(prefix="/api/auth", tags=["Autenticação"])


def _public_user(user: dict) -> dict:
    return {"username": user["username"], "nome": user["nome"]}


@router.post("/login", response_model=TokenOut)
def login(payload: LoginInput) -> dict:
    with connect() as connection:
        user = find_user(connection, payload.username.strip())
    #Mesma mensagem para usuario e senha errados, para nao revelar quais usuarios existem
    if user is None or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos.",
        )
    return {
        "access_token": create_access_token(user["username"]),
        "refresh_token": create_refresh_token(user["username"]),
        "expires_in": ACCESS_TOKEN_MINUTES * 60,
        "usuario": _public_user(user),
    }


@router.post("/refresh", response_model=TokenOut)
def refresh(payload: RefreshInput) -> dict:
    #Recebe o refresh token (valido por 7 dias) e devolve um novo access token
    try:
        username = decode_token(payload.refresh_token, "refresh")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sessão expirada. Faça login novamente.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Refresh token inválido.")

    with connect() as connection:
        user = find_user(connection, username)
    if user is None:
        raise HTTPException(status_code=401, detail="Usuário não encontrado.")
    return {
        "access_token": create_access_token(username),
        "expires_in": ACCESS_TOKEN_MINUTES * 60,
        "usuario": _public_user(user),
    }


@router.get("/me", response_model=UserOut)
def me(user: dict = Depends(get_current_user)) -> dict:
    return _public_user(user)
