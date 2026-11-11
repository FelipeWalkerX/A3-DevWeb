# Clareia API

Backend REST da Sprint 2, construído com FastAPI e SQLite. As sugestões de correção são simuladas por critérios e palavras-chave; não há chamada a um modelo de IA.

## Executar localmente

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Na primeira inicialização, o SQLite em `backend/data/clareia.sqlite3` recebe os dados de demonstração de `frontend/data/`. O banco é ignorado pelo Git e preserva as alterações locais.

Abra `http://localhost:8000/docs` para explorar e testar os endpoints interativamente. Para usar outro arquivo de banco, configure `CLAREIA_DATABASE_PATH`. A lista de origens CORS pode ser alterada com `CLAREIA_CORS_ORIGINS` (origens separadas por vírgula).

## Endpoints

| Método | Caminho | Ação |
|---|---|---|
| GET | `/api/health` | Verificar disponibilidade |
| GET, POST | `/api/questions` | Listar ou criar questões |
| GET, PUT, DELETE | `/api/questions/{id}` | Consultar, substituir ou excluir questão |
| GET, POST | `/api/responses` | Listar respostas (filtro `?status=`) ou registrar resposta e sugestão mock |
| GET, PATCH, DELETE | `/api/responses/{id}` | Consultar, revisar ou excluir resposta |
| POST | `/api/corrections` | Pré-visualizar uma sugestão sem salvar resposta |

Todas as sugestões são demonstrativas e devem ser revisadas pelo professor.

## Testes

```bash
pip install -r requirements-dev.txt
pytest
```
