import type { IncomingMessage } from 'http';
import {
  createIgnoreIncomingRequestHook,
  pathMatchesIgnoredPaths
} from './ignore-incoming-paths';

const request = (url: string): IncomingMessage => ({ url } as IncomingMessage);

describe('pathMatchesIgnoredPaths', () => {
  it('matches strings exactly', () => {
    expect(pathMatchesIgnoredPaths('/health', ['/health'])).toBe(true);
    expect(pathMatchesIgnoredPaths('/health/live', ['/health'])).toBe(false);
    expect(pathMatchesIgnoredPaths('/healthz', ['/health'])).toBe(false);
  });

  it('matches regular expressions', () => {
    expect(pathMatchesIgnoredPaths('/health/live', [/^\/health/])).toBe(true);
    expect(pathMatchesIgnoredPaths('/users', [/^\/health/])).toBe(false);
  });

  it('returns false when no pattern matches', () => {
    expect(pathMatchesIgnoredPaths('/users', ['/health', /^\/metrics/])).toBe(
      false
    );
  });
});

describe('createIgnoreIncomingRequestHook', () => {
  it('returns undefined when no paths are provided', () => {
    expect(createIgnoreIncomingRequestHook([])).toBeUndefined();
  });

  it('ignores requests matching a configured path', () => {
    const hook = createIgnoreIncomingRequestHook(['/health']);

    expect(hook?.(request('/health'))).toBe(true);
    expect(hook?.(request('/users'))).toBe(false);
  });

  it('strips the query string before matching', () => {
    const hook = createIgnoreIncomingRequestHook(['/health']);

    expect(hook?.(request('/health?ready=true'))).toBe(true);
  });

  it('supports regular expression patterns', () => {
    const hook = createIgnoreIncomingRequestHook([/^\/health/]);

    expect(hook?.(request('/health/live'))).toBe(true);
    expect(hook?.(request('/users'))).toBe(false);
  });

  it('handles a missing url', () => {
    const hook = createIgnoreIncomingRequestHook(['/health']);

    expect(hook?.({} as IncomingMessage)).toBe(false);
  });
});
