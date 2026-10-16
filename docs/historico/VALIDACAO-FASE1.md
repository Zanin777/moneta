# Validação da Fase 1

## Resultado

- Instalação: 49 pacotes, lockfile gerado, versões exatas compatíveis com Node 22.17.1.
- TypeScript estrito: aprovado no build, sem `any` nas estruturas da aplicação.
- Build Vite: aprovado. Bundle inicial de aproximadamente 389 kB / 124 kB gzip em JavaScript, antes de futuras divisões por módulo.
- Vitest: **20 testes aprovados** em `src/domain/finance.test.ts`.
- Navegador: **20 verificações aprovadas** usando Playwright disponível no runtime com Microsoft Edge headless. Não foi necessário instalar navegador adicional.
- Inspeção visual das capturas desktop e mobile realizada.

## Regras financeiras cobertas

Parsing BRL, entradas ambíguas, precisão/overflow, formatação, divisão de centavos em parcelas, transferências conservando consolidado, pendências separadas, receita/despesa/resultado, histórico anterior e movimentos posteriores, filtro de proprietário, transferências inválidas, duplicações, datas inválidas, edição e exclusão por recálculo.

O teste de proprietário verifica apenas o cálculo puro. **Não comprova isolamento de banco**, que ainda não existe. O parcelamento cobre divisão de valores, não ciclos de fatura.

## Navegador

HTTP 200; tema escuro após reload; validação inválida e válida; modal abre, fecha por Escape e retorna foco; tabs por setas; erro com nova tentativa demonstrativa; módulo futuro com ação desabilitada; ausência de overflow horizontal em 360, 390, 768, 1024 e 1440px; menu mobile; três seções da galeria sem overflow mobile; nenhum erro JavaScript capturado.

Capturas: `preview-desktop.png`, `preview-dark.png`, `preview-mobile.png`.

## Limitações e pendências

O build emite avisos de diretiva `use client` nas bibliotecas Motion e Lucide. Esta aplicação é uma SPA integralmente cliente, sem fronteiras React Server Components. Build concluído e execução no navegador validada; revisar esses avisos se houver migração para SSR/RSC.

Não foi realizado teste em aparelho físico, leitor de tela ou auditoria integral WCAG. Backend, RLS, transações SQL, autenticação, persistência financeira e fluxos financeiros de ponta a ponta permanecem nas fases indicadas no plano. A prévia é local, sem publicação de produto em produção.
