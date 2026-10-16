# Documento de Requisitos do Produto (PRD)

## Visão geral

Modo simples do MONETA para uma pessoa registrar receitas e despesas locais e consultar o saldo mensal sem login. O usuário forneceu escopo, fluxos, campos, persistência e exclusões; não há decisão de produto pendente.

## Objetivos

Registrar 100% dos lançamentos válidos; rejeitar dados inválidos; preservar registros após recarga/reinício; apresentar totais exatos em centavos e mês vazio zerado. Premissa: uma instalação local compartilhada, sem segregação por usuário.

## Histórias de usuário

- US1: Como pessoa que controla seu dinheiro, quero registrar receita/despesa para acompanhar meu mês.
- US2: Quero escolher o mês e ver totais e registros correspondentes.
- US3: Quero reencontrar registros após reiniciar a aplicação.

## Principais funcionalidades

- RF1: Cadastro com tipo, descrição, valor positivo, categoria e data obrigatórios.
- RF2: Consulta mensal com lista, receitas, despesas e saldo.
- RF3: Persistência local durável e mensagens claras de sucesso/validação/erro.

## Critérios de aceitação

- CA-01 (RF1): Um lançamento válido é salvo e aparece no mês da sua data.
- CA-02 (RF1): Campos vazios, tipo desconhecido, data impossível e valor não positivo são rejeitados na interface e na API.
- CA-03 (RF2): Receitas menos despesas produz saldo exato, inclusive negativo e para 0,10 + 0,20.
- CA-04 (RF2): Trocar mês mostra apenas registros correspondentes; mês vazio tem lista vazia e totais zero.
- CA-05 (RF3): Recarga e reinício preservam registros.
- CA-06 (RF3): Interface em português, reais, responsiva, rotulada e operável por teclado; erros não fingem sucesso.

## Experiência do usuário

Uma única tela com seletor mensal, formulário, resumo e lista. Ao salvar, consultar o mês da data registrada. Durante consulta exibir carregamento, não totais antigos; em falha oferecer tentativa novamente. Campo monetário aceita vírgula ou ponto decimal sem agrupamento. Categorias são texto livre com sugestões. Datas não são restringidas ao mês consultado.

## Restrições técnicas de alto nível

Dados locais, API com validação própria, dinheiro sem arredondamento e banco com consultas parametrizadas. Preservar a instalação e banco legados. Sem serviços externos. Limite por lançamento: R$ 10 milhões.

## Fora do escopo

Autenticação, gráficos, importação, integrações, transferências, cartões, edição/exclusão e nuvem. A versão anterior permanece preservada, mas não participa do modo simples.
