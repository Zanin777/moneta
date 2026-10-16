# MONETA · finanças pessoais simples

Registre receitas e despesas, consulte lançamentos por mês e acompanhe receitas, despesas e saldo. Interface em português, responsiva, valores em reais e mensagens de validação, sucesso e erro. Sem login, gráficos, importação ou integrações no modo simples.

## Iniciar

Requer Node.js 22.17 ou superior. Na pasta que contém package.json:

```powershell
 
npm.cmd run dev
```

Abra http://127.0.0.1:5174/. No Windows, também pode dar dois cliques em INICIAR-MONETA.cmd. Mantenha o terminal aberto; encerre com Ctrl+C. Backend em 127.0.0.1:3002. O modo desenvolvimento recarrega o frontend; após editar backend reinicie.

Para executar o build:

```powershell
npm.cmd run build
npm.cmd start
```

Abra http://127.0.0.1:3002/. Não abra index.html diretamente.

## Uso e persistência

Preencha tipo, descrição, valor, categoria e data. Categorias são livres, com sugestões. Valores positivos, até R$ 10 milhões por registro; digite 1250,50 ou 1250.50, sem separador de milhar. Datas devem existir. Ao salvar, a consulta vai para o mês da data registrada. Trocar o mês consultado não altera um formulário já preenchido. Mês sem registros mostra lista vazia e totais zero; erro de conexão mostra mensagem e botão para tentar novamente.

O banco é criado em `.local-simple/simple.sqlite` e preserva registros após recarga/reinício. Não remova essa pasta para atualizar. Para backup, encerre a aplicação e copie a pasta inteira. Configuração opcional em .env (modelo .env.example): MONETA_SIMPLE_DATA_DIR e SIMPLE_PORT. Ao mudar a porta da API, configure SIMPLE_API_URL no ambiente do Vite para o mesmo endereço. A instalação é local e seus dados não são enviados a serviços externos.

## Verificações

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run test:coverage
npm.cmd run test:e2e
npm.cmd run test:legacy
```

O E2E usa Microsoft Edge instalado, portas 3003/5180 e banco temporário próprio. Testes não usam dados pessoais. SQLite e execução TypeScript do Node 22 podem emitir avisos experimentais. O build pode emitir aviso sobre diretivas use client da biblioteca de ícones; o build e a jornada no navegador foram verificados.

Veja docs/VALIDACAO-SIMPLES.md para resultados. PRD, TechSpec e tarefas em tasks/prd-financas-simples. AGENTS.md vincula todas as regras do projeto.

## Versão anterior preservada

Os módulos e banco anteriores continuam intactos. Scripts dev:legacy, build:legacy, start:legacy e test:legacy permitem trabalhar naquela versão; ela não participa da aplicação simples. Documentação anterior em docs/historico/README-FASE6.md. Não importe automaticamente dados privados para o banco sem autenticação.
