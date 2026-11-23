# Clareia API

API em FastAPI com SQLite, autenticação JWT e correção de respostas com IA (Groq). Instruções de instalação e deploy no [README principal](../README.md).

```bash
uvicorn app.main:app --reload
```

## Endpoints

| Método | Caminho | Token | Ação |
|---|---|---|---|
| GET | `/api/health` | não | Verificar se a API está no ar |
| POST | `/api/auth/login` | não | Login, devolve access e refresh token |
| POST | `/api/auth/refresh` | não | Novo access token a partir do refresh token |
| GET | `/api/auth/me` | sim | Usuário logado |
| GET, POST | `/api/questions` | sim | Listar ou criar questões |
| GET, PUT, DELETE | `/api/questions/{id}` | sim | Consultar, alterar ou excluir questão |
| GET, POST | `/api/responses` | sim | Listar respostas (`?status=`) ou enviar resposta para correção com IA |
| GET, PATCH, DELETE | `/api/responses/{id}` | sim | Consultar, revisar ou excluir resposta |
| POST | `/api/corrections` | sim | Ver a correção da IA sem salvar a resposta |

## Variáveis de ambiente

Veja [.env.example](.env.example).
