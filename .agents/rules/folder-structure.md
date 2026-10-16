# Estrutura de pastas

## Modo simples implementado

| Pasta | Papel |
| --- | --- |
| `frontend/src/components`, `views`, `hooks`, `services`, `types` | Interface React/TypeScript/Tailwind, transporte e estado separados |
| `frontend/src/tests` | Vitest/Testing Library |
| `backend/routes`, `services`, `data`, `types`, `config`, `adapters` | HTTP, negócio, SQLite, contratos e operação |
| `backend/tests` | Vitest com SQLite e HTTP reais temporários |
| `shared/types`, `shared/validation.ts`, `shared/money.ts` | Contratos, validação e conversão monetária exata reutilizáveis |
| `e2e` | Playwright fora das camadas |
| `.local-simple` | Banco persistente privado do modo simples |
| `dist-simple` | Build novo |
| `tasks/prd-financas-simples` | PRD, TechSpec e tarefas |

Portas do modo simples: frontend 5174 e API 3002. Não há pastas assets/domain vazias: os recursos necessários são ícones da biblioteca e funções compartilhadas. Módulos de tipos comuns ficam em shared para não inverter dependências. Um arquivo por tipo.

## Mapa legado preservado

| Pasta/arquivo | Papel e tecnologia |
| --- | --- |
| `src/app/` | Entrada de aplicação, sessão e layout React/TypeScript |
| `src/features/` | Telas financeiras, contexto e configuração de formulários |
| `src/components/` | Componentes React, gráficos e ilustrações SVG |
| `src/services/api.ts` | Transporte HTTP e tipos hoje agrupados |
| `src/domain/` | Cálculos financeiros, seletores, CSV e testes Vitest |
| `src/styles/` | CSS próprio e tokens visuais |
| `src/main.tsx` | Montagem do React no DOM |
| `public/landing.html` | Landing independente em HTML/CSS/JS |
| `server/index.mjs` | HTTP, autenticação, sessão e arquivos estáticos em Node |
| `server/store.mjs` | Regras de negócio e acesso SQLite atualmente combinados |
| `server/migrations/` | Migrações SQL versionadas |
| `server/*.test.mjs` | Testes atuais via `node:test` |
| `scripts/dev.mjs` | Iniciador de Vite e API |
| `docs/` | Arquitetura, implementação e evidências |
| `.local/` | Banco local privado; ignorado pelo Git |
| `dist/` | Build gerado; não editar manualmente |

Ambos os modos usam um único `package.json` e lock na raiz. Portas legadas: frontend 5173, backend 3001. Comandos atuais estão em `AGENTS.md`.

## Estrutura alvo obrigatória

Esta árvore orienta a evolução; frontend/backend/e2e já existem no modo simples. Os módulos legados continuam preservados em src/server e não foram migrados. O modo simples usa módulos diretamente em backend, sem nível src adicional por não precisar dele. Consulte o mapa implementado antes de assumir caminhos.

```text
moneta/
├── AGENTS.md
├── .agents/rules/
├── frontend/
│   ├── public/landing.html
│   └── src/
│       ├── app/
│       ├── components/
│       ├── views/
│       ├── services/
│       ├── hooks/
│       ├── assets/
│       ├── types/
│       ├── domain/
│       ├── styles/
│       └── tests/
├── backend/
│   └── src/
│       ├── routes/
│       ├── services/
│       ├── data/
│       │   └── migrations/
│       ├── types/
│       ├── config/
│       ├── adapters/
│       └── tests/
├── e2e/
├── scripts/
├── docs/
├── package.json
└── package-lock.json
```

## Responsabilidades

- Backend `routes`: HTTP, parsing, status codes, cookies e chamada dos serviços; não faz queries nem cálculos financeiros.
- Backend `services`: regras de negócio, autorização, orquestração transacional, idempotência e validações financeiras.
- Backend `data`: banco, queries, migrações e clientes de APIs externas; não conhece request/response HTTP. Exponha limites transacionais para os serviços.
- Backend `types`: um arquivo por tipo, como `TransferInput.ts`; migração de `.mjs` para TypeScript exige configurar execução/build primeiro.
- Backend `config` e `adapters`: ambiente validado e adaptadores de logger/infraestrutura.
- Frontend `components`: elementos reutilizáveis; `views`: composição das telas; `services`: acesso à API; `hooks`: lógica React com prefixo `use`.
- Frontend `assets`: recursos visuais; `types`: um arquivo por tipo; `domain`: funções puras; `styles`: tokens e configuração do Tailwind.
- `tests` em cada camada: testes unitários/integração e fixtures sintéticas. `e2e`: jornadas completas com Playwright, fora das duas camadas.

Exemplo de fluxo: `views/TransactionsView.tsx` → `hooks/useTransactions.ts` → frontend `services/transactions.ts` → backend `routes/transactions.ts` → backend `services/createTransaction.ts` → `data/transactionRepository.ts`.

Na migração, mova `src/features` para views/hooks, separe os tipos de `api.ts` e divida `server/index.mjs` e `server/store.mjs` por responsabilidade. Atualize imports, Vite/proxy, TypeScript, scripts, testes, caminhos das migrações e do build. Preserve o caminho do banco do usuário; confirme testes e build antes de remover caminhos antigos. Evite diretórios vazios que aparentem uma migração concluída.
