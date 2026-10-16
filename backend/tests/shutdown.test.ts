import { afterEach, expect, it, vi } from 'vitest';
import type { Server } from 'node:http';
import { registerShutdown } from '../config/shutdown.ts';
import { logger } from '../adapters/logger.ts';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it('TU-03 encerra uma vez e fecha banco depois do HTTP', () => {
  const handlers = new Map<string, () => void>();
  vi.spyOn(process, 'on').mockImplementation((event, callback) => {
    handlers.set(String(event), callback);
    return process;
  });
  const order: string[] = [];
  const server = { close: (callback: () => void) => { order.push('http'); callback(); } };
  const repository = { add: vi.fn(), list: vi.fn(), close: () => { order.push('database'); } };
  vi.spyOn(logger, 'info').mockImplementation(() => {});
  registerShutdown(server as unknown as Server, repository);
  handlers.get('SIGINT')?.();
  handlers.get('SIGTERM')?.();
  expect(order).toEqual(['http', 'database']);
});

it('TU-03 limita espera de conexões pendentes', () => {
  vi.useFakeTimers();
  const handlers = new Map<string, () => void>();
  vi.spyOn(process, 'on').mockImplementation((event, callback) => {
    handlers.set(String(event), callback);
    return process;
  });
  const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  const server = { close: vi.fn() };
  const repository = { add: vi.fn(), list: vi.fn(), close: vi.fn() };
  registerShutdown(server as unknown as Server, repository);
  handlers.get('SIGTERM')?.();
  vi.advanceTimersByTime(10_000);
  expect(exit).toHaveBeenCalledWith(1);
  expect(repository.close).not.toHaveBeenCalled();
});

it('TU-03 adaptador centraliza logs', () => {
  const info = vi.spyOn(console, 'log').mockImplementation(() => {});
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  logger.info('Iniciado');
  logger.error('Erro sanitizado');
  expect(info).toHaveBeenCalledWith('Iniciado');
  expect(error).toHaveBeenCalledWith('Erro sanitizado');
});
