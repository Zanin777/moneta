# Validação da entrega local · v0.6

## Testes automatizados

**49 testes aprovados**: 29 com Vitest (dinheiro, relatórios, patrimônio, metas e CSV) e 20 com Node test runner (SQLite, API, autenticação, isolamento e calendário). Build e TypeScript estrito aprovados.

Cobertura relevante:

- centavos seguros, parsing/formatos inválidos, overflow e soma de parcelas;
- transferência preservando consolidado, pendências, edição/exclusão e recálculo;
- leitura e escrita entre dois usuários, associações cruzadas rejeitadas e FKs;
- scrypt, sessão, cookies, logout, exclusão individual, CSRF/Origin;
- rollback de CSV inválido, repetição de lote e chave idempotente;
- pagamento/estorno de fatura sem duplicar despesas, limite e exclusão protegida;
- ciclos em fechamento, fevereiro bissexto, dia 31 e virada de ano;
- metas virtuais/segregadas, retiradas excessivas e conclusão prematura;
- recorrências idempotentes, dia âncora e pausa;
- thresholds/cópia de orçamento e histórico de avaliações;
- relatórios por competência, filtros, patrimônio e CSV com neutralização de fórmulas.

## Navegador

**40 verificações aprovadas**, listadas em `browser-checks.json`. O build compilado também foi aberto no backend, sem Vite, confirmando landing, tela de acesso, CSP e execução sem erros JavaScript.

Playwright do runtime com Microsoft Edge headless. Cadastro e formulários reais, atualização da página, saldo conciliado, busca/edição, download CSV, orçamento, contribuição de meta, recorrência, compra parcelada, pagamento, patrimônio e relatórios. Tema escuro persistente e ausência de erros JavaScript.

Landing e dashboard verificados em 360, 390, 768, 1024 e 1440 px. Páginas financeiras verificadas no mobile, incluindo menu, privacidade por teclado, filtros e ausência de overflow horizontal.

As capturas `platform-*.png` contêm **dados sintéticos de QA**, identificados pelos nomes “QA”/“Teste automatizado”. Os usuários de teste foram excluídos do banco da aplicação após a verificação. A aplicação entregue não inicia com esses dados.

Capturas da landing: `landing-desktop.png`, `landing-mobile.png`. Capturas da plataforma: dashboard, relatórios, escuro e mobile. Documentos/snapshots históricos da Fase 1 estão em `historico/` e `preview-*.png`.

## Limitações

Sem teste em aparelho físico, auditoria completa com leitor de tela, teste de carga, pen test ou infraestrutura de produção. A Fase 7 permanece como próxima etapa. A passagem dos testes não significa certificação de segurança ou conformidade WCAG/LGPD.

Avisos de `use client` das bibliotecas são filtrados apenas para a SPA cliente; outros avisos de build permanecem visíveis. SQLite no Node 22 emite aviso de API experimental. O ambiente de execução é local, com dados persistidos em disco e isolamento por sessão na API, sem RLS PostgreSQL.
