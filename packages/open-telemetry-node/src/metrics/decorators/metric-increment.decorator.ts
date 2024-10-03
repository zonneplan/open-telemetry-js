import { GlobalProviders } from '../../globals';

/**
 * Increments a Counter metric by provided value after a method has been invoked.
 * @param name The name of the metric to increment.
 * @param value The value to increment the metric by. Defaults to 1.
 * @throws Error if the metric is not a counter.
 */
export function metricIncrement(
  name: string,
  value = 1
): MethodDecorator {
  const metric = GlobalProviders.metricProvider?.getMetric(name);

  // When testing decorated methods, we don't want to throw an error if the metric is not found.
  // So instead lets error log so that the user is aware of missing initialization.
  const metricFound = !!metric;
  if (!metricFound) {
    console.warn(
      `Metric with name ${name} not found. Have you initialized OpenTelemetry and registered the metric?`
    );
  }

  if (metricFound && !('add' in metric)) {
    throw new Error('Metric should be a counter');
  }

  const onEnd = () => metric?.add(value);

  return (
    _target: unknown,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    if (!metricFound) {
      return descriptor;
    }

    const originalMethod = descriptor.value;
    descriptor.value = function(...args: unknown[]) {
      let result: unknown;
      try {
        result = originalMethod.apply(this, args);
        if (result instanceof Promise) {
          return result.finally(() => onEnd());
        }

        return result;
      } finally {
        if (!(result instanceof Promise)) {
          onEnd();
        }
      }
    };

    return descriptor;
  };
}
