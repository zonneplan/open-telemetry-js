import { createCounterProvider } from '@zonneplan/open-telemetry-nest';
import { ValueType } from '@opentelemetry/api';

export const METRICS_APP_CONTROLLER_GET = 'app_controller_get';

/**\
 * We can use the `createTypeProvider` function to create a provider for a given metric type.
 * It is easier to export the name of the span separately, so it can be used in the `@InjectMetric` decorator.
 */
export const MetricsProvider = [
  createCounterProvider({
    name: METRICS_APP_CONTROLLER_GET,
    description: 'Counter for GET requests to the app controller',
    valueType: ValueType.INT
  })
];