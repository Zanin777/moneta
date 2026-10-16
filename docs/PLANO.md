# Fases e estado da entrega · v0.6

| Fase | Implementado e verificado | Limites |
|---|---|---|
| 1 | Arquitetura modular, tokens, componentes, domínio em centavos e testes | Stack mantida enxuta com CSS próprio |
| 2 | Navegação responsiva, temas, 10 SVGs, gráficos interativos, onboarding, estados e landing brutalista | Auditoria WCAG integral fica na Fase 7 |
| 3 | Auth real, sessões, banco em disco, migrações, autorização, FKs compostas, rollback e idempotência | SQLite local, sem Supabase/PostgreSQL ou implantação em nuvem |
| 4 | Contas, categorias, transações e transferências CRUD, pesquisa, filtros, ordenação e CSV | CSV no formato publicado; sem OFX ou banco conectado |
| 5 | Orçamentos/thresholds/cópia, metas/histórico/retiradas, recorrências, cartões, ciclos, parcelas e pagamento/estorno de fatura | Recorrências geradas por ação; não há scheduler externo |
| 6 | Relatórios por período/conta/categoria, comparações, patrimônio por data e exportações | Critério por competência de parcela; valores externos são avaliações manuais |

As funcionalidades dessas fases estão implementadas para a execução local. A alternativa SQLite mantém o uso independente de credenciais de um provedor externo; a arquitetura inicial com Supabase foi preservada como referência histórica e não é anunciada como implementada.

## Fase 7 · Próximo trabalho

Auditoria de segurança e acessibilidade completa, testes em aparelhos físicos/leitores de tela, otimização de volume de dados, paginação no servidor, resiliência de rede, políticas de retenção/auditoria e operação com backups. Para acesso público: PostgreSQL/Supabase ou backend equivalente com autorização em todas as camadas, HTTPS, recuperação de senha, políticas de acesso e monitoramento.

## Evoluções

Open Finance autorizado, OFX, reconhecimento automático de recorrências, moedas adicionais, compartilhamento familiar, PDF, PWA, sincronização e agendamento em nuvem. As propostas da landing não implementam ou comercializam essas evoluções.
