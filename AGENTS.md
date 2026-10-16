# MONETA — regras para agentes

Modo padrão: gerenciador financeiro local simples, sem login, gráficos ou integrações. Escopo em tasks/prd-financas-simples/prd.md; arquitetura e casos de teste em techspec.md; tarefas e evidências na mesma pasta.

## Regras obrigatórias

Leia todas antes de alterar código:

- [Padrões de código](.agents/rules/code-standards.md)
- [Testes e cobertura](.agents/rules/tests.md)
- [React](.agents/rules/react.md)
- [Node](.agents/rules/node.md)
- [Estrutura de pastas](.agents/rules/folder-structure.md)
- [JavaScript/TypeScript](.agents/rules/javascript-typescript.md)

O mapa de pastas fica somente em folder-structure.md. O código legado permanece preservado em src/server; não conclua que ele foi refatorado por existir uma estrutura nova.

## Tecnologias e portas

React 19, TypeScript 5.9 estrito, Vite 8, Tailwind 4 e Lucide no frontend. Backend Node >=22.17, HTTP nativo, dotenv e SQLite nativo, TypeScript executado pelo type stripping do Node. SQLite/type stripping podem emitir avisos experimentais nessa versão do Node. Compilador fixado em versão compatível com o parser do ESLint.

Frontend: http://127.0.0.1:5174/; API: http://127.0.0.1:3002/api/health. Vite encaminha /api para a API. Build servido pelo backend em http://127.0.0.1:3002/. SIMPLE_PORT muda a porta da API; se alterada, também ajuste SIMPLE_API_URL no ambiente do Vite.

## Comandos na raiz do projeto

```powershell
npm.cmd ci
npm.cmd run dev
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run test:coverage
npm.cmd run test:e2e
npm.cmd run build
npm.cmd start
```

Instalação usa package-lock.json versionado. Para adicionar pacotes use npm.cmd install <pacote> e versione manifesto/lock. Reinicie após mudanças no backend. INICIAR-MONETA.cmd instala dependências ausentes e inicia frontend/API. Mantenha a janela aberta; encerre com Ctrl+C.

Playwright usa Microsoft Edge instalado (channel msedge), portas 3003/5180 e banco novo sob work por execução. Não reutilize instância do usuário. Verifique disponibilidade das portas antes de iniciar; configurações não reutilizam servidores existentes. Encerre os processos de teste e confirme liberação; no Windows, se o teardown do Playwright travar, encerre somente os PIDs registrados por esta execução.

## Dados e validação

Banco novo em .local-simple/simple.sqlite, configurável por MONETA_SIMPLE_DATA_DIR. Nunca remova ou versione dados locais nem use banco real nos testes. Preservar .local/moneta.sqlite legado. Não migrar dados autenticados para área sem autenticação automaticamente.

Dinheiro é inteiro em centavos; entrada textual convertida por BigInt, positiva e limitada a R$ 10 milhões por lançamento. Totais somados por BigInt e limitados ao intervalo seguro. Valide tipo, textos e data real tanto no frontend quanto na API. Queries usam parâmetros. Mês vazio significa lista vazia e totais zero; falha de consulta é erro, não saldo zero.

## Verificação e limites

Cobertura >=80% de linhas, statements, funções e branches, separadamente no frontend e backend. Bootstraps main/index são exercitados por E2E e excluídos da instrumentação; tipos não são executáveis. Validação compartilhada é instrumentada em ambas as camadas; conversão monetária no frontend. Testes novos seguem Vitest/Testing Library/SQLite real e Playwright.

Scripts *:legacy preservam execução anterior: dev:legacy nas portas 5173/3001, start:legacy serve dist, build:legacy gera dist e test:legacy executa testes Vitest antigos e node:test. A interface antiga continua com autenticação e não participa do modo simples. Consulte docs/historico/README-FASE6.md para essa versão. Lint/cobertura do legado inteiro continuam pendentes; não esconder essa distinção.
