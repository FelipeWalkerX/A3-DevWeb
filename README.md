# Clareia

Plataforma demonstrativa para apoiar professores na correção de respostas discursivas. A API e o frontend usam dados locais; as sugestões de nota são simuladas e precisam ser revisadas pelo professor.

## Executar

Siga as instruções do [backend](./backend/README.md) e do [frontend](./frontend/README.md). Rode a API na porta `8000` e o Next.js na porta `3000`.

## Estrutura

- `backend/`: API REST FastAPI, persistência SQLite e testes.
- `frontend/`: painel Next.js com dados carregados pela API.
