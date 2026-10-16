# Testes automatizados

## Regra crítica

Todo código deve ser coberto por testes automatizados. Esta regra é obrigatória e não pode ser ignorada. Cobertura mínima: 80% de linhas, statements, funções e branches no frontend e no backend, verificados separadamente. O percentual mínimo não autoriza deixar comportamento crítico sem testes. Não exclua módulos de negócio para aumentar artificialmente o resultado.

Use Vitest para unidade e integração e prefira Playwright para E2E. A suíte E2E fica em `e2e/`, na raiz, fora do frontend e do backend. Cobertura separada por camada e Playwright já estão configurados para o modo simples. Os testes legados em `src/domain` e `server` são preservados e executados por `test:legacy`.

## Prioridade e pirâmide

Mantenha muitos testes de unidade, menos de integração e poucos E2E cobrindo jornadas essenciais. Priorize centavos/arredondamento, transferências, parcelas, pagamento de faturas, isolamento de usuários, sessões, idempotência e importação atômica antes de cadastros simples.

- Unidade: dividir 10.000 centavos em três parcelas preserva 10.000.
- Integração: uma transferência atualiza as duas contas atomicamente; falhas causam rollback.
- Integração de autorização: o usuário B não lê nem altera dados do usuário A.
- E2E: criar conta sintética, cadastrar uma conta financeira, lançar despesa e conferir saldo após recarregar.
- Frontend: validar formulário, estados de erro/carregamento e controles acessíveis.

## FIRST

- **Fast:** prefira funções puras e stubs para APIs externas lentas. Integrações SQLite usam banco temporário ou em memória, com schema real.
- **Independent:** cada teste cria e limpa suas fixtures; nunca dependa da ordem de execução nem de registros criados por outro teste.
- **Repeatable:** fixe relógio, timezone e retornos de APIs com mocks. Use datas sintéticas; restaure mocks e timers ao terminar.
- **Self Validated:** verifique valores e comportamento com assertions relevantes. Confirmar apenas que a execução não lançou erro é insuficiente.
- **Timely:** a ordem de escrita dos testes pode seguir a eficiência da implementação; a entrega continua exigindo testes.

## AAA / Given, When, Then

Separe preparação, ação e verificação; os nomes e a sequência expressam as fases sem exigir comentários. Um conceito/requisito por teste. Mais de uma assertion é aceitável quando demonstra o mesmo requisito.

```ts
import { describe, expect, it } from 'vitest';
import { parseBRL } from './finance';

describe('parseBRL', () => {
  it('converte reais em centavos sem perda decimal', () => {
    const input = '1.250,50';
    const result = parseBRL(input);
    expect(result).toBe(125050);
  });
  it('rejeita fração com três casas decimais', () => {
    expect(() => parseBRL('1,001')).toThrow();
  });
});
```

Exemplo de relógio determinístico para uma função dependente de data:

```ts
import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it('usa a data de referência fixa', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-15T12:00:00Z'));
  const reference = new Date().toISOString().slice(0, 10);
  expect(reference).toBe('2026-10-15');
});
```

O exemplo ilustra controle do relógio; testes reais devem chamar o comportamento de negócio. Em integração/E2E não faça mock da regra que está sendo verificada. Nunca execute testes sobre `.local/moneta.sqlite` real.

## Comandos e evidências

Execute `npm.cmd test`, `npm.cmd run test:coverage`, `npm.cmd run test:e2e` e, ao afetar o legado, `npm.cmd run test:legacy`. Vitest usa pool threads neste Windows, pois forks não iniciaram no ambiente. Thresholds de 80 são exigidos para todas as métricas de cada camada. Bootstraps main/index são verificados pelo navegador e não instrumentados; tipos não são código executável. `shared/money` é instrumentado no frontend; validação compartilhada em ambas as camadas. Versione configurações e testes, ignore relatórios gerados. Registre resultados e limites; corrija falhas antes de concluir.
