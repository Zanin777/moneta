# React

Prefira componentes funcionais pequenos e reutilizáveis, com no máximo 30 linhas. Separe telas, componentes visuais, hooks e transporte HTTP. Componentes não fazem `fetch` diretamente: usam hooks `use*`, que coordenam os serviços.

## Props explícitas e acessibilidade

Não use spread de props (`<Button {...props} />`); declare cada propriedade. Use HTML semântico, labels, teclado, foco visível e atributos `aria-*` apropriados. Não invente ARIA redundante ou incompatível com o elemento. Nomes acessíveis devem descrever a ação; erros devem estar associados ao campo.

```tsx
interface SaveButtonProps {
  busy: boolean;
  onSave: () => void;
}

export function SaveButton(props: SaveButtonProps) {
  return (
    <button
      type="button"
      aria-label="Salvar lançamento"
      aria-busy={props.busy}
      disabled={props.busy}
      onClick={props.onSave}
      className="rounded bg-violet-700 px-4 py-2 text-white focus-visible:outline-2"
    >
      Salvar
    </button>
  );
}
```

## Estado, efeitos e cálculos

Evite `useEffect` para derivar valores de props/estado ou tratar cliques. Calcule valores simples durante renderização e execute ações nos handlers. Reserve efeitos para sincronização com sistemas externos, com cleanup quando necessário. Use `useMemo` para cálculos realmente pesados, com todas as dependências; não para valores triviais.

```tsx
import { useMemo } from 'react';
import { buildAnnualReport } from '../domain/buildAnnualReport';
import type { Transaction } from '../types/Transaction';

export function useAnnualReport(transactions: Transaction[], year: number) {
  return useMemo(
    () => buildAnnualReport({ transactions, year }),
    [transactions, year],
  );
}
```

Os módulos do exemplo representam a estrutura alvo. Hooks concentram lógica reutilizável, estados de carregamento/erro e coordenação; serviços concentram URLs, serialização e erros de rede. Separe hooks grandes por responsabilidade, sem esconder erros.

## Estilização

Use Tailwind para estilizar componentes novos. Tailwind está integrado em `vite.simple.config.ts` e `frontend/src/styles.css`. Preserve responsividade e aparência do modo afetado. Não substitua todo o CSS legado sem verificar a aparência e os fluxos. Teste por nomes e papéis acessíveis e comportamento de formulários.
