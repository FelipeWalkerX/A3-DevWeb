from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.config import (
    ACCESS_TOKEN_MINUTES,
    JWT_ALGORITHM,
    JWT_SECRET_KEY,
    REFRESH_TOKEN_DAYS,
)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def _create_token(username: str, token_type: str, duration: timedelta) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": username,
        "type": token_type,     #Diferencia o access do refresh, para um nao ser usado no lugar do outro
        "iat": now,
        "exp": now + duration,
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def create_access_token(username: str) -> str:
    return _create_token(username, "access", timedelta(minutes=ACCESS_TOKEN_MINUTES))


def create_refresh_token(username: str) -> str:
    return _create_token(username, "refresh", timedelta(days=REFRESH_TOKEN_DAYS))


def decode_token(token: str, expected_type: str) -> str:
    """Devolve o username do token. Lança jwt.InvalidTokenError se o token for invalido."""
    payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    if payload.get("type") != expected_type:
        raise jwt.InvalidTokenError("Tipo de token incorreto.")
    username = payload.get("sub")
    if not username:
        raise jwt.InvalidTokenError("Token sem usuário.")
    return username
