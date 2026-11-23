# Clareia

Sistema para ajudar professores da educação básica a corrigir questões discursivas. O professor cadastra a questão com a resposta esperada e os critérios de correção; quando a resposta de um aluno é enviada, a API usa IA (Groq) para sugerir uma nota e um comentário. A sugestão fica pendente até o professor revisar no dashboard.

- `backend/`: API em FastAPI com SQLite, login com JWT (access token + refresh token) e correção por IA.
- `frontend/`: site em Next.js (App Router) com Tailwind CSS.

API em produção: https://a3-devweb.onrender.com/docs

## Rodar localmente

Precisa de Python 3.10+ e Node.js 20+.

### 1. Backend (terminal 1)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # depois preencha GROQ_API_KEY, JWT_SECRET_KEY e ADMIN_PASSWORD
uvicorn app.main:app --reload
```

A API sobe em http://localhost:8000 e a documentação em http://localhost:8000/docs.
Na primeira execução o banco é criado com questões de exemplo e com o professor definido em `ADMIN_USERNAME` / `ADMIN_PASSWORD` (padrão: `professor` / `clareia123`).

Sem `GROQ_API_KEY` a API continua funcionando, mas a correção vira uma simulação por palavras-chave.

### 2. Frontend (terminal 2)

```bash
cd frontend
npm install
cp .env.example .env.local       # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Abra http://localhost:3000. A tela de login aparece primeiro.

### Testes da API

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

## Autenticação

1. `POST /api/auth/login` com `{ "username", "password" }` devolve `accessToken` (15 min) e `refreshToken` (7 dias).
2. As rotas de questões, respostas e correção exigem o header `Authorization: Bearer <accessToken>`. Sem token ou com token inválido a API responde `401`.
3. Quando o access token expira, o frontend chama `POST /api/auth/refresh` com o `refreshToken` e repete a requisição. Se o refresh também expirou, volta para o login.

No `/docs`, faça o login, copie o `accessToken` e cole no botão **Authorize**.

## Deploy

### Backend no Render

- New > Web Service, apontando para este repositório
- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Environment Variables:
  - `GROQ_API_KEY`: chave do Groq
  - `JWT_SECRET_KEY`: texto aleatório longo (`python -c "import secrets; print(secrets.token_hex(32))"`)
  - `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_NAME`: login do professor
  - `CLAREIA_CORS_ORIGINS`: URL do site na Vercel, ex: `https://a3-dev-web.vercel.app` (várias separadas por vírgula)

No plano gratuito o disco do Render é apagado quando o serviço reinicia, então o SQLite volta aos dados de exemplo. O banco hospedado entra na Sprint 4.

### Frontend na Vercel

- Add New > Project, importando este repositório
- Root Directory: `frontend` (o framework Next.js é detectado sozinho)
- Environment Variables: `NEXT_PUBLIC_API_URL` = URL do Render, ex: `https://a3-devweb.onrender.com`
- Depois do primeiro deploy, coloque a URL da Vercel em `CLAREIA_CORS_ORIGINS` no Render.

Como `NEXT_PUBLIC_API_URL` é lida no build, ao mudar essa variável é preciso fazer um novo deploy na Vercel.

## Estrutura

```
backend/app/
  main.py            cria a API, CORS e registra as rotas
  config.py          variáveis de ambiente
  database.py        SQLite, criação das tabelas e dados iniciais
  models.py          schemas Pydantic
  correction.py      correção com Groq (e simulação se a IA falhar)
  auth/              hash de senha, geração e validação do JWT
  routes/            auth, questões, respostas, correções
  seed/              questões e respostas de exemplo

frontend/
  app/login/                 tela de login
  app/(painel)/layout.js     protege as páginas e mostra o menu
  app/(painel)/dashboard/    questões e respostas vindas da API
  app/(painel)/correcao/     envio de resposta para correção com IA
  app/(painel)/questoes/nova cadastro de questão
  components/                componentes reutilizados
  context/AuthContext.js     usuário logado, login e logout
  hooks/useApiData.js        GET com estados de carregando/erro
  services/                  chamadas à API e controle dos tokens
```
