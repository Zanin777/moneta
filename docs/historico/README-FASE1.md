# MONETA · Fase 1

Fundação de uma plataforma de finanças pessoais. **Esta versão não é um sistema financeiro pronto para produção.** A entrega começa pela Fase 1, conforme o briefing, e inclui uma prévia navegável para avaliar a base visual.

## Executar

Requer Node.js 22.12 ou superior. Versões exatas e árvore resolvida no `package-lock.json`.

**Windows:** extraia o ZIP por completo e dê dois cliques em `INICIAR-MONETA.cmd`. Na primeira execução, ele instala as dependências se necessário e abre o navegador. Mantenha a janela do servidor aberta enquanto utiliza o site. Não abra `index.html` diretamente: esta aplicação precisa do servidor Vite.

Se preferir o terminal, abra-o nesta pasta. No PowerShell, use `npm.cmd` se a política de execução bloquear `npm.ps1`:

```powershell
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite. Para validar:

```powershell
npm run typecheck
npm test
npm run build
npm run preview
```

## Implementado

- React + TypeScript estrito + Vite; módulos de domínio independentes da interface.
- Tokens de cores, espaços, bordas, tipografia e movimento; temas claro/escuro.
- Navegação desktop compactável e menu mobile; destinos futuros com fase indicada.
- Preferência de tema persistente neste navegador, com tratamento de falha de armazenamento.
- Galeria interativa de botões, campos, badges, progresso, modal nativo, tabs, feedback e estados vazio/carregando/erro/sucesso.
- Três ilustrações SVG próprias, ícones vetoriais e Motion respeitando movimento reduzido.
- Parsing e formatação monetária sem multiplicar decimais; saldo, resultado mensal, transferências e divisão monetária de parcelas.
- Testes de integridade monetária. Dividir valores em parcelas ainda não gera ciclos de fatura.

## Limites da entrega

Não há login, backend, banco, lançamento financeiro, cartões operacionais, gráficos financeiros, importação, notificações ou conexão bancária. Os indicadores usam “—”, sem valores fabricados. Valores da galeria são identificados como amostras. Somente o tema é persistido; os exemplos de formulário não gravam dados.

Os módulos financeiros ficam explicitamente indisponíveis. A filtragem por proprietário no domínio é uma regra de cálculo, **não uma barreira de autorização**. Segurança entre usuários depende do backend e das políticas PostgreSQL previstas na Fase 3.

## Estrutura

```text
src/
  app/           navegação, composição de telas e preferências locais
  components/    primitivas e coleção vetorial
  domain/        regras monetárias puras e testes
  styles/        tokens e estilos responsivos
docs/
  ARQUITETURA.md decisões, modelo relacional, integridade e segurança
  PLANO.md       fases, dependências e critérios de saída
  DESIGN.md      linguagem visual e contrato dos componentes
```

Para as próximas fases, separar telas em `features/<modulo>`, adaptadores em `services/` e migrações em `supabase/migrations/`. Não foi criado cliente Supabase vazio nem incluída chave em código.

## Dependências

Consultadas no registro npm antes da instalação: React 19.3.1, Vite 8.3.4, TypeScript 7.0.2, Vitest 5.0.4, Lucide React 1.57.0 e Motion 14.2.0. Node local: 22.17.1. Build e testes verificam a combinação instalada.

CSS com tokens foi escolhido para a fundação, evitando Tailwind e shadcn/ui antes de existir necessidade concreta. Recharts, Zod, React Hook Form e TanStack Query serão avaliados nas fases que usam gráficos, formulários persistentes e estado de servidor. Nenhuma fonte remota ou biblioteca de imagens é necessária.
