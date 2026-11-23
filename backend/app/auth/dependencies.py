import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.security import decode_token
from app.database import connect, find_user

#Le o header "Authorization: Bearer <token>". Tambem faz aparecer o botao Authorize no /docs
bearer_scheme = HTTPBearer(auto_error=False)


def _unauthorized(message: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=message,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _unauthorized("Token de acesso não enviado.")
    try:
        username = decode_token(credentials.credentials, "access")
    except jwt.ExpiredSignatureError:
        raise _unauthorized("Token de acesso expirado.")
    except jwt.InvalidTokenError:
        raise _unauthorized("Token de acesso inválido.")

    with connect() as connection:
        user = find_user(connection, username)
    if user is None:
        raise _unauthorized("Usuário do token não existe mais.")
    return user
