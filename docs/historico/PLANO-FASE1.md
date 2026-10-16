# Plano de execução e critérios de saída

## Fase 1 — Fundação (entrega atual)

Arquitetura, tokens, componentes de base, tema, navegação estrutural e regras monetárias puras. Uma galeria permite avaliar comportamento sem criar transações falsas.

Critérios: TypeScript estrito passa; build de produção passa; testes de centavos/transferências/pendências passam; prévia identifica limitações e não simula autenticação. Conferir desktop e mobile. Resultado técnico desta execução em `VALIDACAO.md`.

## Fase 2 — Experiência visual

Evoluir layout, dashboards vazios e carregando, biblioteca SVG completa e onboarding visual retomável. Preparar gráficos acessíveis, filtros e formulários; exemplos somente em modo demonstração explicitamente separado.

Saída: todas as páginas e estados essenciais verificáveis; teclado e movimento reduzido; responsividade 360–1440px; nenhuma ação aparenta salvar antes do serviço existir.

## Fase 3 — Persistência e autenticação

Provisionar projeto Supabase, ambiente seguro e migrações versionadas. Auth, perfis, RLS, FKs compostas, serviços e funções transacionais. Introduzir Zod/RHF e TanStack Query quando consumidos por fluxos reais.

Dependências: acesso ao projeto backend e configuração do ambiente. Saída: testes de isolamento com dois usuários e anônimo; mutações rejeitadas fora do proprietário; rollback e idempotência; restauração de sessão; erros recuperáveis. Só então habilitar informações financeiras.

## Fase 4 — Finanças essenciais

Onboarding completo, contas, categorias, CRUD de receitas/despesas e transferências. Filtros, ordenação, busca, CSV com validação e tratamento de linhas rejeitadas. Exportação com proteção a fórmulas de planilhas. Valores pendentes separados.

Saída: lançamento persiste após refresh; edição/exclusão atualizam saldos; transferências preservam consolidado; importação não duplica; gráficos refletem consultas reais; integração testa acesso e concorrência.

## Fase 5 — Planejamento

Orçamentos por mês/categoria com thresholds configuráveis, duplicação para mês seguinte, metas com histórico, retiradas e tipo virtual/segregado; recorrências idempotentes. Cartões, ciclos, parcelas, estornos e pagamentos de fatura.

Saída: contribuição virtual não altera banco; saques concorrentes não excedem reserva; fechamento/vencimento/viradas de mês testados; pagamento de fatura não duplica despesa; pausar acompanhamento não simula cancelar serviço.

## Fase 6 — Relatórios

Agregações mensal, trimestral e anual, filtros por conta/categoria, comparações corretas e patrimônio com fontes únicas. Gráficos com alternativas textuais, exportação e estados sem dados.

Saída: totais conciliam com o livro; nenhum percentual sem base válida; aumento de despesa não é marcado como melhora; ativos/passivos não são contados duas vezes.

## Fase 7 — Qualidade

Testes de interface com Playwright, fluxos reais de ponta a ponta, acessibilidade WCAG 2.2 AA, mobile e zoom. Performance sobre dados representativos, sessão expirada, falhas de rede, recuperação e revisão de segurança/privacidade.

Saída: critérios de aceitação do briefing conferidos com evidências; nenhuma funcionalidade incompleta anunciada como pronta; operação e restauração documentadas. Publicação da aplicação completa somente depois de configurar autenticação e persistência seguras.

## Fora da primeira versão

Múltiplas moedas, Open Finance, OFX, inteligência financeira, compartilhamento familiar, exportação PDF e PWA. Não bloquear o fluxo financeiro principal por essas evoluções.
