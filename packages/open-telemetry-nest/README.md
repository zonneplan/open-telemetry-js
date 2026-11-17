# OpenTelemetry Nest

![](https://github.com/zonneplan/open-telemetry-js/actions/workflows/ci-master.yml/badge.svg)

Find the source code at [zonneplan/open-telemetry-js](https://github.com/zonneplan/open-telemetry-js).

## Set up

```
npm install @zonneplan/open-telemetry-nest
```

Requires Node.js 22.15 or later. The package is built on the OpenTelemetry JS SDK 3.x and `@opentelemetry/api` 1.10: SDK objects you pass in, such as span processors, samplers, exporters and metric readers, must come from the 3.x packages (`@opentelemetry/sdk-trace`, `@opentelemetry/sdk-metrics` and so on).

## Usage

### Using metrics

```typescript
import { createCounterProvider, Counter } from '@zonneplan/open-telemetry-nest';

const MY_METRIC = 'my_metric';

// my-module.ts
@Module({
  providers: [
    /**
     * Registers a counter provider, which can be injected in services.
     */
    createCounterProvider({
      name: MY_METRIC,
      description: 'My metric description',
      unit: 'occurrences',
      valueType: ValueType.INT,
    })
  ]
})
export class MyModule {}

// my-service.ts
@Injectable()
export class MyService {
  constructor(
    /**
     * Inject the metric in the service.
     */
    @InjectMetric(MY_METRIC) private readonly myMetric: Counter
  ) {}

  /**
   * Using the default metric methods.
   */
  public myMethod() {
    this.myMetric.add(1);
  }

  /**
   * Using the metric increment decorator.
   */
  @metricIncrement(MY_METRIC)
  public myMetricIncrementDecorator() {
    
  }
}
```
