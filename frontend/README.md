# Clareia - Frontend

Site em Next.js (App Router) com Tailwind CSS. Consome a API do `backend/`. Instruções completas no [README principal](../README.md).

```bash
npm install
cp .env.example .env.local
npm run dev      # http://localhost:3000
npm run build    # gera a versão estática em out/
```

## Páginas

- `/login`: login do professor
- `/dashboard`: questões e respostas (GET na API), filtro por status e revisão da nota
- `/correcao`: envia a resposta de um aluno para a IA corrigir
- `/questoes/nova`: cadastro de questão com resposta esperada e critérios

As páginas do painel só abrem com login. O token fica no `localStorage` e vai no header `Authorization: Bearer` de todas as requisições (veja `services/api.js`).
