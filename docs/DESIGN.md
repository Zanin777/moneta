# Design system · MONETA

> Atualização v0.6: a coleção agora contém 10 SVGs (`growth`, `empty`, `plan`, `complete`, `budget`, `account`, `search`, `error`, `welcome`, `login`) e pode ser explorada na galeria. Gráficos SVG interativos e formulários conectados foram adicionados. A landing em `public/landing.html` segue a direção WORDS IN MOTION solicitada: papel/tinta/laranja, tipografia cinética, blur e vidro; o espaço financeiro mantém a paleta de leitura do produto. As seções abaixo preservam as decisões iniciais da fundação.

## Direção

Minimalismo editorial, geometria e progresso. A marca usa três barras inclinadas, os SVGs exploram caminhos e construções, e a paleta combina violeta, verde-água e superfícies sóbrias. Sem emojis, imagens genéricas, 3D ou rasterização. SVGs decorativos são ocultos da árvore acessível; informação financeira precisa aparecer também em texto.

## Tokens

`src/styles/tokens.css` é a fonte de verdade. Paleta estrutural segue o briefing: primary #635BFF, hover #4941D9, fundo #F8F9FC, superfície #FFFFFF, texto #172033, borda #E8EBF2 e accent #A6E3DA. Tema escuro: #10131C, #1A1E2A, #242938, #F5F7FC, #A4ADBF, #343A4A.

As cores originais success #16A67A, danger #EA6275 e warning #F1AD57 são preservadas para arte. Texto semântico usa variantes mais escuras no tema claro e mais claras no escuro para melhorar legibilidade. Texto secundário claro usa #59677C em vez de #738095. Ajustes deliberados para contraste; WCAG AA completa ainda requer auditoria.

- Espaços: 4, 8, 12, 16, 24, 32, 48px.
- Raios: 8, 14, 22px; sombra apenas sutil.
- Tipografia: Inter/Manrope se instaladas, Segoe UI/sans-serif como fallback sem requisição externa. Títulos 600–700, corpo 400–500, dinheiro com números tabulares.
- Movimento: 200ms padrão, 180ms entrada de página; redução de movimento respeitada por CSS e Motion.

## Primitivas entregues

| Componente | Contrato |
|---|---|
| Button | primary, secondary, ghost, danger; foco, hover, active, disabled e loading |
| Field | label vinculado, hint, erro com aria-describedby e aria-invalid |
| Card | superfície responsiva, padding e borda padronizados |
| Badge | texto + tom semântico; não depende só de cor |
| Progress | valor limitado a 0–100, nome acessível e indicação textual externa |
| Modal | dialog nativo, backdrop, Escape, foco contido pelo navegador |
| Tabs | roving tabIndex, setas, Home/End, painéis nomeados |
| Toast | região aria-live; mensagem dispensável |
| Skeleton/estados | exemplos de carregando, vazio, sucesso e erro com ação de nova tentativa |
| Sidebar | versão ampla/compacta, navegação ativa nomeada, menu mobile |
| Illustration | growth, empty e plan; viewBox comum 260×190 |

## Evolução prevista

Fase 2: extrair tabs/toasts/estados para primitivas próprias conforme reuso; adicionar tooltip, drawer e restantes ilustrações (meta concluída, orçamento excedido, conta criada, busca vazia, erro, login e onboarding). Tabelas, calendário e gráficos acessíveis entram junto dos módulos reais. Não são necessários para considerar o núcleo de componentes da Fase 1 entregue.

## Responsividade e acessibilidade

- Desktop: sidebar e grade central; região contextual apenas quando necessária.
- Tablet: grade reorganizada e menu compacto conforme largura.
- Mobile: menu em dialog, conteúdo em uma coluna e métricas em pares; controles com toque mínimo 44px.
- Link de salto, landmarks, hierarquia de títulos, labels e foco visível.
- Auditar a aplicação inteira com teclado, leitores de tela, contraste e zoom de 200% na Fase 7. Não declarar conformidade total por inspeção de CSS.
