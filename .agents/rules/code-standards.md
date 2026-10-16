# Padrões de codificação

Regras obrigatórias para código novo e refatorações do MONETA. Use nomes que descrevam conceitos financeiros, com uma instrução por linha.

## Comentários e tamanho

Não insira comentários, exceto quando absolutamente necessários para explicar algo que o código não comunica, como uma expressão regular complexa. Prefira `parseBRL` a um comentário explicando uma função chamada `process`.

```ts
// Aceita grupos de milhar com ponto e até duas casas decimais com vírgula.
const BRL_PATTERN = /^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/;
```

Classes e arquivos `.ts` não podem exceder 100 linhas. Aplique o mesmo limite aos módulos `.tsx` e `.mjs` para manter a organização. Métodos e funções têm no máximo 30 linhas; componentes React também. Conte linhas físicas, sem minificação. Divida responsabilidades em módulos coesos: `validateTransfer`, `saveTransfer` e `recalculateBalance`, por exemplo.

## Condicionais e parâmetros

Não ultrapasse três níveis de `if/else`. Prefira cláusulas guarda e retornos antecipados. Não ultrapasse três parâmetros; agrupe entradas relacionadas em um objeto tipado.

```ts
interface TransferInput {
  sourceId: string;
  destinationId: string;
  amount: number;
}

export function validateTransfer(input: TransferInput): void {
  if (input.sourceId === input.destinationId) {
    throw new Error('Selecione contas diferentes.');
  }
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0) {
    throw new Error('Informe um valor positivo em centavos.');
  }
}
```

## Espaçamento, constantes e variáveis

Evite linhas em branco dentro de funções/métodos; separe funções e membros de classe com linhas em branco. Extraia números e strings mágicos para constantes com significado. Declare variáveis perto do uso, evitando escopo maior que o necessário.

```ts
const CENTS_PER_REAL = 100;
const DEFAULT_CURRENCY = 'BRL';

export function formatAmount(amount: number): string {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
  });
  return formatter.format(amount / CENTS_PER_REAL);
}
```

## Dados sensíveis

Nunca escreva chaves, senhas ou tokens no código, fixtures, logs ou exemplos reais. Configuração sensível fica em `.env` externo ao código, ignorado pelo Git. Versione apenas `.env.example`, com valores fictícios ou vazios. Variáveis `VITE_*` são públicas no navegador e nunca devem conter segredos.

```dotenv
EXTERNAL_API_KEY=
```

Dados reais de `.local` não são fixtures. Testes usam usuários e valores sintéticos.
