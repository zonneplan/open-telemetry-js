import type { IncomingMessage } from 'http';
import {
  createIgnoreIncomingRequestHook,
  pathMatchesIgnoredPaths
} from './ignore-incoming-paths';

const request = (url: string): IncomingMessage => ({ url } as IncomingMessage);

describe('pathMatchesIgnoredPaths', () => {
  it('matches strings exactly', () => {
    // Arrange
    const patterns = ['/health'];

    // Act
    const exact = pathMatchesIgnoredPaths('/health', patterns);
    const subPath = pathMatchesIgnoredPaths('/health/live', patterns);
    const prefix = pathMatchesIgnoredPaths('/healthz', patterns);

    // Assert
    expect(exact).toBe(true);
    expect(subPath).toBe(false);
    expect(prefix).toBe(false);
  });

  it('matches regular expressions', () => {
    // Arrange
    const patterns = [/^\/health/];

    // Act
    const matching = pathMatchesIgnoredPaths('/health/live', patterns);
    const nonMatching = pathMatchesIgnoredPaths('/users', patterns);

    // Assert
    expect(matching).toBe(true);
    expect(nonMatching).toBe(false);
  });

  it('returns false when no pattern matches', () => {
    // Arrange
    const patterns = ['/health', /^\/metrics/];

    // Act
    const result = pathMatchesIgnoredPaths('/users', patterns);

    // Assert
    expect(result).toBe(false);
  });
});

describe('createIgnoreIncomingRequestHook', () => {
  it('returns undefined when no paths are provided', () => {
    // Arrange
    const paths: string[] = [];

    // Act
    const hook = createIgnoreIncomingRequestHook(paths);

    // Assert
    expect(hook).toBeUndefined();
  });

  it('ignores requests matching a configured path', () => {
    // Arrange
    const hook = createIgnoreIncomingRequestHook(['/health']);

    // Act
    const ignored = hook?.(request('/health'));
    const traced = hook?.(request('/users'));

    // Assert
    expect(ignored).toBe(true);
    expect(traced).toBe(false);
  });

  it('strips the query string before matching', () => {
    // Arrange
    const hook = createIgnoreIncomingRequestHook(['/health']);

    // Act
    const result = hook?.(request('/health?ready=true'));

    // Assert
    expect(result).toBe(true);
  });

  it('supports regular expression patterns', () => {
    // Arrange
    const hook = createIgnoreIncomingRequestHook([/^\/health/]);

    // Act
    const ignored = hook?.(request('/health/live'));
    const traced = hook?.(request('/users'));

    // Assert
    expect(ignored).toBe(true);
    expect(traced).toBe(false);
  });

  it('handles a missing url', () => {
    // Arrange
    const hook = createIgnoreIncomingRequestHook(['/health']);

    // Act
    const result = hook?.({} as IncomingMessage);

    // Assert
    expect(result).toBe(false);
  });
});
