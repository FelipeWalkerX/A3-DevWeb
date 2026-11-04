# Clareia — correção assistida

## Descrição do sistema

O Clareia apoia professores que têm muitas avaliações discursivas para corrigir em pouco tempo.
Professores cadastram questões, respostas esperadas e critérios de avaliação.
Estudantes respondem questões discursivas curtas de diferentes disciplinas.
A plataforma apresenta uma sugestão de nota e um comentário para cada resposta.
O professor revisa a sugestão e decide se a correção está adequada.
Na Sprint 1, os dados e as sugestões são demonstrativos e não usam uma API de IA.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). As questões e respostas de exemplo estão em `data/questoes.json` e `data/respostas.json`.

## Funcionalidades demonstrativas

- Listagem pesquisável de respostas, com filtros por status.
- Visualização da resposta do estudante, critérios e sugestão de correção.
- Revisão da sugestão pelo professor e cadastro de questões com validação visual.
- Interface responsiva com Tailwind CSS e estilos complementares.
- Exportação estática configurada para gerar a pasta `out/` com `npm run build`.
