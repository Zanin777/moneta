# Arquitetura e decisões · desenho inicial v0.1

> Documento de planejamento preservado da Fase 1. A implementação local v0.6 usa Node/SQLite, não Supabase. Consulte [IMPLEMENTACAO.md](IMPLEMENTACAO.md) para o sistema efetivamente entregue e seus limites.

## Contexto e escopo

Pasta inicial vazia, sem arquitetura anterior a preservar. A Fase 1 entrega código executável, linguagem visual e regras financeiras de base. A prévia usa o layout futuro sem simular finanças operacionais.

## Camadas

1. **Apresentação:** React/TypeScript. Componentes recebem valores prontos; não mantêm saldos independentes. A UI não decide autorização.
2. **Aplicação:** casos de uso por módulo, formulários e consultas. Futuramente usa TanStack Query para invalidar saldos, faturas e relatórios após alterações.
3. **Domínio:** valores em centavos, movimentos discriminados e cálculos puros. Não depende de React ou de transporte HTTP.
4. **Persistência:** Supabase Auth + PostgreSQL com RLS e funções transacionais. Decisão planejada; nenhuma infraestrutura foi provisionada nesta fase.

Fluxo futuro: UI → validação de entrada → sessão Supabase → RPC transacional → constraints/RLS → resultado → invalidação de consultas. Autorização e validação autoritativa permanecem no servidor.

## Contratos financeiros

- Moeda inicial BRL; inteiros seguros em centavos no cliente e `bigint` no PostgreSQL. Validar intervalo antes de enviar/receber. Nunca converter bigint SQL para number sem checar o intervalo seguro.
- `opening_balance` é um saldo de partida em data explícita. O livro futuro aceita movimentos a partir dessa data; ajustes retroativos exigem reconciliação.
- Saldo até uma data = saldo inicial + movimentos liquidados até essa data. Receita/despesa do período considera somente movimentos liquidados daquele período.
- Transferência: um evento lógico, duas pernas de valor igual e sinal oposto, ambas no mesmo commit. Sem categoria de receita/despesa e sem efeito no resultado consolidado.
- Pendente: compromisso, separado do saldo efetivo. Ao liquidar, registrar `settled_at` e a data efetiva sem duplicar o evento.
- O domínio da Fase 1 recebe `date` como data contábil; a API futura separará ocorrência, competência e liquidação. O cálculo atual é ao fim do mês, não um saldo bancário em tempo real.
- Mutação: chave idempotente única por proprietário/operação; devolver resultado anterior em repetição. Desabilitar botão enquanto salva é apenas apoio visual.
- Correções: transações versionadas com auditoria; saldo derivado do livro. A exclusão visível cancela/reverte um evento; não apaga rastreabilidade necessária indiscriminadamente.
- Meta padrão: reserva virtual. Criar meta ou contribuição virtual não movimenta conta. Meta segregada requer conta vinculada e transferência explícita.
- Compras no cartão: reconhecer despesa na data de competência de cada parcela e dívida no livro de passivos. O pagamento baixa dívida e caixa, sem outra despesa. Estornos revertem as pernas originais.
- Parcelas: divisão de centavos preserva a soma. Os primeiros N restos recebem 1 centavo. Ciclos futuros usam fechamento com regra explícita para compras no próprio dia de fechamento; vencimento usa último dia válido do mês quando necessário.
- Patrimônio = contas + ativos externos − passivos externos − dívida de cartões. Um mesmo ativo/passivo tem fonte única; fatura não é somada novamente à dívida já lançada.

## Modelo relacional planejado

Todas as entidades privadas têm `id uuid`, `owner_id uuid references auth.users`, `created_at timestamptz`, `updated_at timestamptz` e unicidade `(owner_id,id)` para FKs compostas. Valores em centavos usam bigint com checks. Tabelas globais opcionais exigem políticas separadas, sem misturar linhas de usuários.

| Entidade | Campos/relações essenciais | Invariantes |
|---|---|---|
| profiles | user_id, display_name, onboarding_step | Um perfil por usuário; dados mínimos |
| accounts | owner, name, type, institution, currency, opening_balance, opening_date, archived_at | Moeda BRL inicial; não apagar conta com histórico |
| categories | owner, name, kind, icon_key, color_token | Categoria compatível com o tipo de movimento |
| transactions | owner, account, category, amount, kind, status, occurred_at, effective_date, notes, recurrence_id, version | Positivo; FK composta assegura proprietário |
| transfers | owner, source_account, destination_account, amount, effective_date, status | Contas diferentes; ambas do proprietário |
| ledger_entries | owner, event_id, account_or_liability_id, signed_amount, effective_date | Pernas conciliadas; gravação via função transacional |
| mutation_requests | owner, operation, idempotency_key, result | Unique(owner,operation,key); mesma chave com payload diferente rejeitada |
| cards | owner, name, last_four, limit, closing_day, due_day | Somente últimos quatro dígitos; dias 1–31 |
| invoices | owner, card, cycle_start, cycle_end, due_date, status | Ciclo único por cartão; total derivado de parcelas |
| purchases / installments | owner, card, category, purchase_id, invoice_id, index, total_count, amount | Soma das parcelas igual à compra; índice único |
| invoice_payments | owner, invoice, payer_account, amount, ledger_event | Pagamento atômico sem nova despesa |
| budgets / budget_items | owner, month, category, limit, attention_threshold, near_threshold | Um limite por mês/categoria; thresholds ordenados |
| goals | owner, name, description, target, desired_date, kind, linked_account, status | Meta virtual não muda saldo |
| contributions | owner, goal, signed_amount, date, transfer_event | Retirada não pode exceder reserva; tipo coerente |
| subscriptions | owner, account/card, amount, frequency, next_charge, status | Não gerar duplicação por período; pause/cancel só acompanhamento |
| assets / liabilities | owner, name, amount, valuation_date, source_reference | Fonte única para evitar dupla contagem |
| preferences | owner, theme, currency, locale, timezone | Perfil e preferências por usuário |
| notifications | owner, type, related_entity, read_at | Acesso restrito; geração idempotente |
| audit_events | owner, actor, action, entity, version, timestamp | Sem segredos ou payload financeiro excessivo nos logs |

Índices: `(owner_id,effective_date)`, `(owner_id,account_id,effective_date)`, `(owner_id,status)`, `(owner_id,category_id,effective_date)`; ciclos e chaves idempotentes únicos. Avaliar consultas reais antes de ampliar índices.

## Segurança a implementar na Fase 3

- RLS habilitada e forçada quando aplicável; políticas de leitura e mutação por `auth.uid() = owner_id` com `USING` e `WITH CHECK`. Testar sessões de dois usuários e usuário anônimo.
- FKs compostas `(owner_id,account_id)` impedem associação cruzada mesmo em operações autorizadas de criação.
- Funções RPC verificam sessão e proprietário; usar `security invoker` quando possível. Se `security definer` for indispensável, fixar search_path, restringir grants e validar autorização explícita.
- Nenhuma service-role key no navegador. Chave pública do Supabase somente com políticas completas; segredos em ambiente seguro.
- Sessões via Supabase Auth, recuperação e expiração verificadas. Escolher PKCE e estratégia de token/cookie conforme implantação; avaliar CSRF se usar cookies. Não inventar autenticação local.
- Conteúdo como texto; não usar HTML não confiável. HTTPS, cabeçalhos CSP, limites e validação de tamanho no ambiente de implantação. Vite é servidor de desenvolvimento.
- Exportação/exclusão por proprietário, reautenticação em ações sensíveis e política de retenção explícita. Revisão de LGPD antes de operar dados reais.
- Logs sem credenciais, dados bancários completos ou detalhes financeiros desnecessários. Mensagens de erro úteis sem stack SQL pública.

## Riscos e dependências

| Risco | Tratamento e momento |
|---|---|
| Duplicação de transferências/faturas | Livro único e transações SQL; testes de rollback nas fases 3–5 |
| Corrida entre contribuições ou pagamentos | Locks/constraints e idempotência; teste concorrente |
| Vazamento entre usuários | RLS, FKs compostas e testes de integração antes de habilitar cadastro |
| Datas/fusos e recorrências | BRL e America/Sao_Paulo inicialmente; datas contábeis explícitas; testes de virada de mês |
| Escopo amplo | Entregas sequenciais com critérios de saída em PLANO.md |
| Infraestrutura ausente | Backend permanece pendente; não substituir por armazenamento financeiro no navegador |
| Bibliotecas atuais | Versões fixas, lockfile, build/testes e revisão ao atualizar |

Open Finance, OFX, compartilhamento, PDF e PWA permanecem evoluções. Interfaces de repositório e moeda explícita permitem ampliar sem misturar essas integrações no núcleo.
