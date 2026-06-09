import type { IncomingMessage } from 'http';

/**
 * A path matcher used to exclude incoming requests from tracing.
 * - A `string` is matched against the request pathname exactly (query strings are ignored).
 * - A `RegExp` is tested against the request pathname, which allows prefix or pattern matching
 *   (e.g. `/^\/health/` to ignore `/health` and everything below it).
 */
export type IgnoredIncomingPath = string | RegExp;

/**
 * Returns `true` when the given pathname matches any of the provided patterns.
 * Exported for testing.
 */
export function pathMatchesIgnoredPaths(
  pathname: string,
  patterns: readonly IgnoredIncomingPath[]
): boolean {
  return patterns.some((pattern) =>
    typeof pattern === 'string' ? pathname === pattern : pattern.test(pathname)
  );
}

/**
 * Builds an `ignoreIncomingRequestHook` for the HTTP instrumentation that drops the
 * server span for any incoming request whose pathname matches one of the given paths.
 *
 * Returns `undefined` when no paths are provided so the instrumentation keeps its default behaviour.
 */
export function createIgnoreIncomingRequestHook(
  paths: readonly IgnoredIncomingPath[]
): ((request: IncomingMessage) => boolean) | undefined {
  if (paths.length === 0) {
    return undefined;
  }

  return (request: IncomingMessage): boolean => {
    const pathname = (request.url ?? '').split('?')[0] ?? '';
    return pathMatchesIgnoredPaths(pathname, paths);
  };
}
