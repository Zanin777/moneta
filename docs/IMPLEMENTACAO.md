# Arquitetura implementada · v0.6

`ARQUITETURA.md` registra o desenho inicial da Fase 1. Este documento descreve as decisões efetivamente implementadas nas fases seguintes.

## Runtime e separação de responsabilidades

- React/TypeScript/Vite para a interface. A API é acessada por fetch com cookie de sessão, sem senha ou token no localStorage.
- Node HTTP + `node:sqlite` para backend local, bind 127.0.0.1. Vite faz proxy `/api`; o mesmo backend serve `dist/` no modo `npm start`.
- SQLite foi escolhido porque não havia credenciais Supabase nem PostgreSQL instalado. Não são necessários serviços externos para operar o sistema local.
- `server/store.mjs` concentra casos de uso, validação e transações. `src/domain/selectors.ts` projeta a visualização a partir do snapshot autorizado; nunca aceita saldo pronto enviado pelo cliente.
- `server/migrations` contém versões 1 e 2. A evolução do schema usa SQL idempotente e registro em `schema_migrations`.

## Modelo efetivo

Usuários, sessões, preferências, contas, categorias, transações (incluindo eventos de transferência), cartões, compras, parcelas, pagamentos de fatura, orçamentos, metas, contribuições, recorrências, ativos, passivos, histórico de avaliações, notificações, chaves idempotentes, lotes CSV e auditoria.

Faturas são projeções por `(owner,card,mês de vencimento)` sobre parcelas e pagamentos; não há tabela redundante de total de fatura. Transferências são eventos únicos com origem/destino e valor, sem persistir saldos ou duas pernas que poderiam se desencontrar. Essas escolhas preservam a atomicidade e evitam contagens duplicadas.

Tabelas privadas referenciam o proprietário. Entidades relacionais usam FKs compostas para impedir vinculação a registros de outro usuário. Consultas e mutações recebem o proprietário da sessão, nunca de parâmetros controlados pelo cliente. O banco SQLite em si pertence à instalação; acesso direto ao arquivo pelo administrador do sistema operacional não é isolado por login da aplicação.

## Segurança

scrypt com salt, sessões com 256 bits aleatórios armazenadas como SHA-256, validade 24h, cookie HttpOnly/SameSite=Strict. Validação de Origin e header específico em POST, ausência de CORS permissivo, limite de requisição 1 MB, rate limit em memória para login/cadastro, prepared statements e whitelist de ações/tabelas. O build servido pelo backend recebe CSP e cabeçalhos básicos.

Cookie Secure não é usado no HTTP de loopback. A implantação pública requer HTTPS, revisão das origens e cookies, armazenamento e rate limit persistentes, recuperação de acesso e operação de backups. Não há declaração de conformidade LGPD/WCAG ou auditoria de segurança integral.

## Contabilidade

Saldo de conta: saldo inicial na data definida + receitas liquidadas − despesas liquidadas ± transferências − pagamentos de fatura. Conta com histórico não permite alterar saldo/data inicial sem ajuste explícito. Saldos negativos de conta são permitidos como posição registrada; o sistema não faz pagamentos bancários reais.

Resultado: receitas liquidadas menos despesas liquidadas e parcelas por mês de vencimento. Pagamento de fatura baixa dívida e conta, sem duplicar despesa. A dívida patrimonial integral é reconhecida na data da compra, com todas as parcelas futuras incluídas no saldo devedor. Os critérios são expostos na interface.

Metas: virtual soma contribuições, sem qualquer impacto em conta. Segregada acompanha o saldo de uma conta exclusiva por meta; movimentação exige transferência explícita. Conclusão depende de atingir o alvo.

Recorrências: dia âncora preservado em meses curtos e pausas; geração manual em lote cria pendentes, no máximo 120 por ação. Chave única por recorrência/data evita duplicação. Não há worker rodando quando o computador/site está fechado.

Patrimônio: saldos + últimas avaliações externas conhecidas até a data − dívidas externas − dívida de cartões. Valores externos devem ser cadastrados uma única vez, fora de contas. Não existe importação automática para detectar bens cadastrados com nomes diferentes.

## Concorrência e erros

BEGIN IMMEDIATE serializa mutações e protege validação/gravação. Chave de idempotência e hash de payload são salvos no mesmo commit. Formulários mantêm a chave ao repetir o mesmo payload. Importação valida todas as linhas na mesma transação e registra hash do lote para prevenir repetição.

Erros de validação exibem instruções; conflitos relacionais não expõem SQL; 401 retorna ao acesso; falha de conexão orienta verificar o iniciador. A auditoria registra ação e entidade, sem gravar senha ou payload financeiro completo. A exclusão de dados remove a trilha daquele usuário conforme solicitação explícita.

## Limites operacionais

Snapshot completo por usuário, sem paginação de servidor; adequado à execução pessoal local, não à escala comercial. Banco sem criptografia nativa de disco. Sem recuperação de senha, e-mail de confirmação, bancos conectados ou nuvem. Node 22 considera SQLite experimental. Essas limitações estão no README e na interface.
