# Validação — MONETA simples

Data: 15/10/2026. Implementação no projeto MONETA existente, seguindo PRD → TechSpec → tarefas → execução. A inspeção incluiu AGENTS, seis rules e agente Explore. Nenhuma decisão importante ficou sem premissa registrada.

## Resultados

- Typecheck novo e legado: aprovados.
- ESLint do código novo, testes e configurações: aprovado.
- Build da aplicação simples: aprovado.
- Vitest: 36 testes frontend/shared e 16 backend, todos aprovados.
- Legado: 29 testes Vitest e 20 node:test, todos aprovados.
- Playwright/Microsoft Edge: 1 jornada completa aprovada, com cadastro de receita/despesa, saldo exato, recarga, mês vazio e viewport 390 px sem overflow horizontal.
- Persistência: fechamento/reabertura do SQLite e reinício da API sobre arquivo temporário mantêm lançamentos; mudança de ano consulta corretamente mês vazio.
- Validação: campos obrigatórios, datas impossíveis, tipos inválidos, centavos positivos/inteiros, limites, JSON e tamanho de corpo; queries maliciosas tratadas como texto literal.
- Encerramento: testes de ordem HTTP → SQLite, sinal repetido e timeout.

## Cobertura medida por camada

| Camada | Statements | Branches | Funções | Linhas |
| --- | --- | --- | --- | --- |
| Frontend/shared | 95,91% | 91,78% | 93,10% | 97,72% |
| Backend/shared | 97,29% | 91,17% | 100% | 97,97% |

Thresholds mínimos de 80% para as quatro métricas são obrigatórios nas configurações. Bootstraps main/index são exercitados por E2E e não instrumentados; tipos não executáveis são excluídos. Dinheiro compartilhado instrumentado no frontend; validação em ambas as camadas. Não houve medição da cobertura completa do legado, cuja suite de regressão passou.

## Evidências e operação

Imagens `simple-desktop.png` e `simple-mobile.png`, inspecionadas visualmente. Layout limpo, formulário rotulado, contraste de receita/despesa também indicado por texto e estados anunciados por status/alert. O teste de navegador usa banco novo, sem dados reais.

Portas dos testes: 3003/5180; processos registrados nos logs. O teardown de processos do Playwright neste Windows ficou aguardando; encerrei somente os PIDs iniciados para o teste e confirmei por requisição que ambas as portas estavam livres. O resultado final do Playwright foi exit code 0, 1 passed. Nenhum servidor de teste ficou ativo.

## Ajustes durante validação

Vitest forks não iniciava no ambiente: pool threads corrigiu a execução. O loader tsx falhou na consulta ao usuário do sistema: substituído pelo type stripping nativo do Node, sem essa dependência direta. TypeScript 7 era incompatível com o parser ESLint instalado: adotado 5.9 compatível, com typecheck legado aprovado. Seletores E2E foram ajustados para papel acessível e mensagem específica quando há dois status simultâneos.

## Limites conhecidos

Node 22 emite avisos experimentais de SQLite/type stripping; biblioteca de ícones gera aviso de use client no build, sem impedir geração nem jornada real. Aplicação sem login roda somente em loopback e mantém registros na instalação local. Edição, exclusão, gráficos e integrações não fazem parte do escopo. Módulos autenticados e banco anteriores foram preservados e não são servidos no modo simples.
