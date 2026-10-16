# MONETA · v0.6

Plataforma local de finanças pessoais e landing page **WORDS IN MOTION**. Implementação das fases 1–6 para uso neste computador, com autenticação, banco real e registros separados por usuário. Sem dados financeiros de demonstração na aplicação.

## Iniciar no Windows

1. Extraia o ZIP inteiro para uma pasta.
2. Tenha **Node.js 22.17 ou superior** instalado.
3. Dê dois cliques em **INICIAR-MONETA.cmd**.
4. Mantenha a janela aberta enquanto utiliza o site.

Na primeira execução, o iniciador instala as dependências pela internet, se necessário. Depois, abre a landing e permite acessar a plataforma. Se a instalação já estiver rodando nas portas padrão, o iniciador reutiliza o endereço. Não abra o `index.html` da aplicação diretamente.

- Landing: **http://127.0.0.1:5173/landing.html**
- Plataforma: **http://127.0.0.1:5173/**
- API: http://127.0.0.1:3001/api/health

Crie seu próprio acesso pelo botão **Primeira vez? Criar conta**. O e-mail é um identificador local: não há envio de confirmação ou recuperação de senha. Não existe senha padrão ou conta administrativa pré-cadastrada.

## Terminal

Abra o terminal na pasta que contém este README e `package.json`:

```powershell
npm.cmd ci
npm.cmd run dev
```

Para servir o build pelo próprio backend, sem Vite:

```powershell
npm.cmd run build
npm.cmd start
```

Nesse modo, use http://127.0.0.1:3001/landing.html ou http://127.0.0.1:3001/. `npm.cmd run preview` também inicia o backend com o build. Nenhuma instalação de PostgreSQL é necessária para esta versão local.

## O que funciona

| Fase | Entrega |
|---|---|
| 1 · Fundação | React/TypeScript estrito, tokens, componentes, regras monetárias |
| 2 · Experiência | Layout responsivo, temas, gráficos SVG, 10 ilustrações próprias, onboarding retomável, feedback e estados |
| 3 · Persistência | API Node, SQLite com migrações, cadastro/login, sessões, autorização e FKs por proprietário |
| 4 · Finanças | Contas, categorias, receitas/despesas/transferências, edição/exclusão, filtros, ordenação, importação/exportação CSV |
| 5 · Planejamento | Orçamentos configuráveis e cópia mensal, metas virtuais/segregadas, contribuições/retiradas, recorrências, cartões/parcelas/faturas/pagamentos |
| 6 · Relatórios | Períodos mensal/trimestral/anual/personalizado, filtros por conta/categoria, comparações, patrimônio e histórico de avaliações, CSV |

### Regras e critérios contábeis

- Inteiros em centavos. Valores individuais limitados a R$ 10 bilhões; rejeição de valores inválidos no servidor.
- Transferências entre contas próprias não geram renda ou despesa. Pendentes não mudam saldo.
- Despesas de cartão são reconhecidas por parcela no **mês de vencimento**. O pagamento da fatura baixa conta e dívida, sem outra despesa. A dívida patrimonial considera o valor total das compras menos pagamentos.
- Compras no dia do fechamento vão para o ciclo seguinte. Dias inexistentes são ajustados ao último dia válido; centavos são distribuídos preservando a soma.
- Metas virtuais não movimentam contas. Metas segregadas acompanham uma conta exclusiva; use transferências para reservar dinheiro.
- Recorrências geram **pendências sob solicitação**, até 120 ocorrências por execução. Não há agendamento em segundo plano ou pagamento automático. Pausar/cancelar acompanhamento não cancela o serviço contratado.
- Bens e dívidas externas não devem repetir valores já incluídos em contas ou cartões. Avaliações por data permitem evolução histórica. Excluir um bem remove também o histórico correspondente; revisar avaliações por edição preserva datas anteriores.
- Importação CSV é atômica: se uma linha falhar, nenhuma linha é salva. O mesmo lote não é importado novamente. Modelo e formato são oferecidos na página de transações; nomes de contas/categorias precisam ser únicos no arquivo em relação aos cadastros.

## Dados e privacidade

O banco fica em **`.local/moneta.sqlite`**, com arquivos auxiliares WAL/SHM durante uso. Essa pasta é ignorada no Git e não está no ZIP de entrega. Nunca substitua essa pasta ao atualizar o código. É possível alterar o local com a variável `MONETA_DATA_DIR`.

Exportação individual: Configurações → Exportar meus dados. Exclusão individual: Configurações → Excluir meus dados, mediante senha. Para backup completo, pare os servidores e copie a pasta `.local` inteira; ela contém dados de todos os usuários dessa instalação. Proteja o acesso à pasta e às cópias. Os arquivos do banco não têm criptografia própria de disco.

Senhas usam scrypt com salt aleatório. Tokens de sessão aleatórios são armazenados como hash, expiram em 24h e usam cookie HttpOnly/SameSite=Strict. O servidor vincula cada operação ao usuário autenticado, com consultas e FKs por proprietário. Mutações financeiras usam `BEGIN IMMEDIATE` e chave de idempotência.

**Limite de implantação:** servidor restrito a 127.0.0.1. Esta versão foi adaptada para funcionar localmente sem conta externa. Não implementa Supabase/PostgreSQL nem RLS; o isolamento é validado na API e nas FKs SQLite. Publicação comercial exige adaptação do backend, HTTPS/cookies Secure, recuperação de acesso, infraestrutura de backup, monitoramento e revisão de segurança/privacidade. Não exponha este servidor diretamente à internet.

## Landing page

`public/landing.html` é autocontida, com CSS e JS inline, SVGs, geometria CSS 3D, tipografia cinética, blur, vidro e gradientes. Paleta: #F4F1EA, #141210 e #FF3B00. Inclui navbar, hero com dois CTAs, três recursos, três cenários ilustrativos, três planos, FAQ, CTA final e footer com transparência e compartilhamento.

Os textos de depoimento são identificados como **cenários ilustrativos**. Somente a versão local gratuita está disponível; propostas em nuvem/família não têm cobrança ou contratação. Links sociais compartilham a página e identificam quando o endereço é local; não fingem perfis oficiais. Contato prepara uma mensagem para copiar, sem simular envio.

## Verificação

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

Veja `docs/VALIDACAO.md` para evidências e limites. SQLite do Node 22 emite aviso de API experimental; não impede a execução. As versões JS originais foram mantidas, sem novas dependências de runtime.

## Estrutura

```text
public/landing.html     página pública autocontida
src/app/                sessão, layout e galeria visual
src/features/           páginas financeiras, contexto e formulários
src/services/           contratos e transporte da API
src/domain/             dinheiro, seletores, CSV e testes
src/components/         primitivas, gráficos e 10 ilustrações SVG
server/                 autenticação, API, store transacional e testes
server/migrations/      schema relacional e histórico de avaliações
scripts/dev.mjs         iniciador conjunto de API + Vite
docs/                   arquitetura, fases e validação
```

Diagnóstico: se houver falha de conexão, verifique se a janela do iniciador permanece aberta e se as portas 5173 e 3001 estão livres. Se o PowerShell bloquear `npm.ps1`, use `npm.cmd`. Alterações do frontend recarregam pelo Vite; após editar o backend, reinicie os servidores.
