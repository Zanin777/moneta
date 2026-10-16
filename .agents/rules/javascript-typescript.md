# JavaScript e TypeScript

## Declarações e comparações

Prefira `const`. Use `let` somente quando houver reatribuição necessária, como estado de encerramento. Nunca use `var`. Sempre compare com `===` e `!==`; não use `==` ou `!=`.

```ts
const SETTLED_STATUS = 'settled';
const settled = transactions.filter((item) => item.status === SETTLED_STATUS);
```

## Tipagem

Nunca use `any`, inclusive em testes. Use tipos explícitos para parâmetros e retornos envolvendo objetos. Em fronteiras externas, receba `unknown` e valide antes de usar. Evite assertions que apenas silenciem o compilador, non-null assertions sem garantia e `@ts-ignore`. Cada tipo de domínio fica em seu próprio arquivo em `types`.

```ts
export interface TransferInput {
  sourceId: string;
  destinationId: string;
  amount: number;
}
```

```ts
import type { TransferInput } from '../types/TransferInput';

export function copyTransfer(input: TransferInput): TransferInput {
  return {
    sourceId: input.sourceId,
    destinationId: input.destinationId,
    amount: input.amount,
  };
}
```

Exemplo de validação de entrada desconhecida:

```ts
export function readAmount(input: unknown): number {
  if (typeof input !== 'number' || !Number.isSafeInteger(input)) {
    throw new Error('Valor inválido em centavos.');
  }
  return input;
}
```

## Funções e ternários

Use declarações `function` nas funções principais/exportadas do módulo. Prefira arrow functions em callbacks de `map`, `filter`, `reduce`, eventos e promessas. Ternários são permitidos somente sem aninhamento; para múltiplos casos use guardas ou um mapeamento tipado.

```ts
export function statusLabel(settled: boolean): string {
  return settled ? 'Confirmado' : 'Pendente';
}

export function sumAmounts(amounts: readonly number[]): number {
  return amounts.reduce((total, amount) => total + amount, 0);
}
```

O exemplo de soma mostra callback; operações financeiras reais também precisam validar overflow de inteiros seguros. Preserve imutabilidade de props/estado, use `import type` quando aplicável e trate rejeições assíncronas sem engolir erros.

## Lint ao concluir tarefas

Execute o linter toda vez que terminar uma tarefa e corrija falhas antes de concluir. ESLint já está configurado para frontend/backend/shared novos e configurações/testes. Não alegue que `typecheck` é lint. Preserve igualdade estrita, proibição de `var`/`any` e limites de tamanho; respeite o lock existente.

Execute `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd test` e `npm.cmd run build`. O lint atual não cobre refatoração completa do legado src/server; essas pendências permanecem explícitas. Para alterações somente documentais, valide links e coerência dos comandos.
