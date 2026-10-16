# Node.js

O backend atual usa HTTP nativo, ESM e SQLite nativo. Preserve os contratos `/api`, as sessões e a autorização por proprietário ao separar módulos.

## Assincronismo e event loop

Prefira `async/await` a callbacks. Para APIs legadas, adapte com `promisify`. Use I/O assíncrono no caminho de requisições; cálculos intensivos devem ir para worker threads ou jobs apropriados. Uma função marcada `async` não torna cálculo síncrono não bloqueante. O SQLite síncrono atual exige transações curtas; não intercale `await` em uma transação compartilhada sem isolamento adequado.

```js
import { readFile } from 'node:fs/promises';

export async function readImport(path) {
  const content = await readFile(path, 'utf8');
  return content;
}
```

## Ambiente

Use `.env` ignorado pelo Git e `dotenv` na entrada do backend; valide variáveis ao iniciar. `dotenv` já está instalado e usado em `backend/index.ts`. `.env.example` documenta somente nomes e valores não sensíveis. Mantenha a porta do backend alinhada ao proxy Vite se alterar configuração de porta.

```js
import 'dotenv/config';

export function readDataDirectory() {
  const directory = process.env.MONETA_DATA_DIR;
  if (!directory) throw new Error('Configure MONETA_DATA_DIR.');
  return directory;
}
```

## Logging centralizado

Use `console.log` e `console.error` exclusivamente em um adaptador central. Os demais módulos usam esse adaptador. Não registre senha, token, cookie, dados pessoais ou conteúdo financeiro bruto.

```js
export const logger = {
  info(message) {
    console.log(message);
  },
  error(message) {
    console.error(message);
  },
};
```

Exemplo de chamada: `logger.info('Servidor iniciado.');`. Para erros, registre uma mensagem sanitizada e identificador de correlação, sem imprimir indiscriminadamente o objeto da requisição.

## Graceful shutdown

Trate `SIGINT` e `SIGTERM`, torne o encerramento idempotente, pare de aceitar conexões, aguarde requisições em andamento e então feche o banco. Defina timeout para impedir travamento indefinido. O exemplo pressupõe `server` HTTP já iniciado e `store` com método `close`:

```js
const SHUTDOWN_TIMEOUT_MS = 10_000;

export function registerShutdown(server, store) {
  let stopping = false;
  function stop() {
    if (stopping) return;
    stopping = true;
    const timeout = setTimeout(() => {
      logger.error('Encerramento excedeu o tempo limite.');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    server.close(() => {
      store.close();
      clearTimeout(timeout);
      logger.info('Servidor encerrado.');
    });
  }
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
}
```

Importe o adaptador `logger` no módulo real. Valide em testes encerramento normal, sinal repetido e timeout.

## Dependências e módulos

Versione `package-lock.json`; use `npm ci` em instalações reproduzíveis. Evite referências circulares: routes dependem de services; services dependem de data; data não importa routes/services. Tipos e adaptadores comuns não dependem da camada HTTP. Injete dependências quando necessário para testes.
