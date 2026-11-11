# Clareia — correção assistida

## Descrição do sistema

O Clareia apoia professores com muitas avaliações discursivas e pouco tempo para corrigi-las.
Professores cadastram questões, respostas esperadas e critérios de avaliação.
A plataforma persiste questões e respostas localmente e apresenta sugestões demonstrativas de nota.
O professor revisa a sugestão e decide se a correção está adequada.
As sugestões são simuladas e não usam uma API ou modelo de IA real.

## Rodar localmente

```bash
# Terminal 1: API e banco SQLite
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). A interface usa a API em `http://localhost:8000`; documentação interativa disponível em [http://localhost:8000/docs](http://localhost:8000/docs).

## Funcionalidades

- Listagem pesquisável de respostas, com filtros por status.
- Visualização da resposta do estudante, critérios e sugestão de correção.
- Cadastro persistente de questões e respostas pelo frontend.
- Revisão persistente da sugestão pelo professor.
- Interface responsiva com Tailwind CSS e estilos complementares.
- Exportação estática configurada para gerar a pasta `out/` com `npm run build`.
- Defina `NEXT_PUBLIC_API_URL` antes do build para apontar a interface estática à URL pública da API.
