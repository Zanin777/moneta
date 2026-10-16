# Especificação técnica

## Resumo

Referência: `prd.md`. Nova entrada padrão no projeto existente, com React/TypeScript/Tailwind e API Node HTTP/SQLite separada do backend autenticado. Reutilizar React/Vite/Vitest, sem reutilizar o schema dependente de usuário. Instalação local; sem publicação de dados financeiros.

## Arquitetura do sistema

### Visão dos componentes

`frontend/src/views/FinanceView` compõe EntryForm/EntryFields, Summary e EntryList. `useEntryForm` e `useMonth` coordenam serviços HTTP. Shared contém validação, dinheiro e tipos, reutilizados no backend. `backend/routes` trata protocolo; `services/report` valida/orquestra; `data/entries` usa SQLite. `server` compõe rotas/estáticos, `index` inicia ambiente e `config/shutdown` encerra graciosamente. Logger centralizado em adapters. Não alterar `src`/`server` legados nem `.local/moneta.sqlite`.

## Design de implementação

### Principais interfaces

```text
addEntry(repository, unknown) -> Entry
getReport(repository, month) -> MonthReport
saveEntry(EntryInput) -> Promise<Entry>
loadMonth(month, signal?) -> Promise<MonthReport>
```

### Modelos de dados

#### EntryInput e Entry

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| id | string | só resposta | UUID |
| kind | income/expense | sim | Receita ou despesa |
| description | string | sim | Texto aparado, 1–120 caracteres |
| amount | integer | sim | Centavos, 1–1.000.000.000 |
| category | string | sim | Texto aparado, 1–120 caracteres |
| date | string | sim | Data real YYYY-MM-DD, anos 1000–9999 |

Exemplo de entrada: `{"kind":"income","description":"Salário","amount":100000,"category":"Trabalho","date":"2026-10-15"}`. Resposta inclui `id` UUID.

#### MonthReport

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| entries | Entry[] | sim | Ordenados por data descendente e inserção descendente |
| income | integer | sim | Receitas em centavos |
| expense | integer | sim | Despesas em centavos |
| balance | integer | sim | Receitas menos despesas |

Exemplo vazio: `{"entries":[],"income":0,"expense":0,"balance":0}`. Totais calculados com BigInt, convertidos apenas dentro do intervalo seguro.

#### Erro

| Status | Significado | Exemplo |
| --- | --- | --- |
| 400 | Validação/JSON | `{"error":"Informe uma data válida."}` |
| 403 | Header de mutação ausente | `{"error":"Origem da solicitação inválida."}` |
| 404/405 | Rota/método | `{"error":"Rota não encontrada."}` |
| 500 | Falha interna | `{"error":"Não foi possível salvar ou consultar. Tente novamente."}` |

Schema `simple_entries`: campos de Entry, textos NOT NULL, amount INTEGER CHECK positivo, kind CHECK; índice date. Arquivo `.local-simple/simple.sqlite`, separado do banco legado. SQL de entrada usa placeholders `?`.

### Endpoints da API

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | /api/entries?month=2026-10 | MonthReport; month obrigatório YYYY-MM válido |
| POST | /api/entries | EntryInput JSON; header X-Moneta-Request: 1; responde Entry/201 |
| GET | /api/health | `{"app":"moneta-simple"}`/200 |

GET retorna 200 com MonthReport inclusive vazio; mês inválido retorna 400/Erro. POST valida todos os campos na API independentemente do frontend; corpo limitado a 16 KiB; retorna 400 para entrada inválida, 403 sem header e 500 para erro interno. Não há degradação parcial nem origem externa. Não devolver mensagem SQL interna. Estáticos do build em `dist-simple` são servidos na porta da API.

## Pontos de integração

Nenhuma integração externa. Vite 5174 encaminha API à porta 3002. Bancos temporários e portas diferentes nos testes E2E. A execução legada permanece em scripts `*:legacy`.

## Abordagem de testes

### Testes de unidade

| ID | Nome | CA | Resultado |
| --- | --- | --- | --- |
| TU-01 | Dinheiro e validação | CA-02/03 | Conversão exata e rejeição de entradas inválidas |
| TU-02 | Interface e falhas | CA-01/04/06 | Salva, muda mês, mostra erro e retry sem dados antigos |
| TU-03 | Encerramento | CA-05 | Fecha servidor/banco uma vez e limita espera |

### Testes de integração

| ID | Nome | CA | Resultado |
| --- | --- | --- | --- |
| TI-01 | API/SQLite mensal | CA-01/02/03/04 | POST/GET real, positivo, negativo, vazio, fronteiras |
| TI-02 | Reabertura | CA-05 | Arquivo temporário preserva lançamentos |
| TI-03 | Protocolo e queries | CA-02/06 | JSON inválido, limites, SQL literal, erros, estáticos |

### Testes E2E

| ID | Nome | CA | Resultado |
| --- | --- | --- | --- |
| E2E-01 | Jornada completa | CA-01/03/04/05/06 | Formulário real, reload, mês vazio, mobile |

Vitest + Testing Library para UI, SQLite real temporário nas integrações e Playwright em `e2e`. Cobertura >=80% em cada métrica nas camadas separadas; bootstraps main/index exercitados por E2E e fora da instrumentação unitária. Dinheiro shared instrumentado no frontend; validação em ambas as camadas. FIRST, fixtures independentes e assertions de valores.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. Backend, tipos/validação e persistência.
2. Interface e integração HTTP.
3. Testes, lint, cobertura, build e entrega.

### Dependências técnicas

Node >=22.17 e dependências npm. Documentação oficial consultada: nodejs.org/api/sqlite.html, vitest.dev/guide/coverage.html e tailwindcss.com/docs/installation/using-vite. Fixar compilador TypeScript compatível com ESLint se necessário; não forçar peers incompatíveis.

## Monitoramento e observabilidade

Health check local, logger de início/encerramento e erro sanitizado. Sem dados pessoais em logs.

## Considerações técnicas

### Principais decisões

Escopo novo prevalece sobre regras legadas de autenticação. Servidor novo separado evita expor APIs privadas. Não criar projeto independente: módulos novos dentro do MONETA existente. Categorias livres, interface abre mês atual em São Paulo e consulta mês da data após salvar.

### Riscos conhecidos

SQLite síncrono adequado ao baixo volume local; queries curtas e indexadas. API sem login ligada somente em loopback. Falha de leitura não aparece como saldo zero. AbortController impede resultado atrasado de sobrescrever mês novo. Evitar segundo POST por clique repetido.

### Conformidade com o AGENTS.md e as rules

AGENTS e seis rules lidos. Novos módulos <=100 linhas, funções/componentes <=30, até três parâmetros, guardas, tipos separados, Tailwind, dotenv, logger e consultas preparadas. Legado preservado. Sem regra de transferência/cartão aplicável ao novo escopo.

### Conformidade com skills

Não há `.agents/skills` no projeto. Usadas skills instaladas criar-prd, criar-techspec, criar-tasks e executar-task; Explore executado. Pedido explícito de implementação autoriza prosseguir pelas etapas, conforme instruções superiores sobre não repetir aprovações. Premissas do PRD suprem perguntas já respondidas pelo usuário.

### Arquivos relevantes e dependentes

`frontend`, `backend`, `shared`, `e2e`, scripts npm, configs Vite/Vitest/TypeScript/ESLint/Playwright, lock, AGENTS, README e esta pasta de tarefas.
