# OpenTelemetry Node

![](https://github.com/zonneplan/open-telemetry-js/actions/workflows/ci-main.yml/badge.svg)

Find the source code at [zonneplan/open-telemetry-js](https://github.com/zonneplan/open-telemetry-js).

## Set up

```
npm install @zonneplan/open-telemetry-node
```

## Usage

### Initialize OpenTelemetry before your application bootstraps

The usage of `import ... = require('')` is necessary so that the types are loaded in before the application is bootstrapped. Otherwise, the instrumentations are not loaded in time. This code would be placed on top of the `main.ts` in a NestJS application. For example, see [main.ts](../../examples/nest-app/src/main.ts)

```typescript
import otel = require('@zonneplan/open-telemetry-node');
import nest = require('@zonneplan/open-telemetry-nest');
import zonneplan = require('@zonneplan/open-telemetry-zonneplan');

new otel.OpenTelemetryBuilder('nest-example')
  .withTracing(zonneplan.DefaultTracingOptions)
  .withLogging(zonneplan.DefaultLoggingOptions)
  .withMetrics(zonneplan.DefaultMetricsOptions)
  .withMetrics((options) =>
    options.$if(process.env['NODE_ENV'] === 'development', (metricsOptions) =>
      metricsOptions.withMetricReader(new nest.PrometheusNestExporter())
    )
  )
  .start();
```

Alternatively, by not using predefined options:

```typescript
new otel.OpenTelemetryBuilder('nest-example')
  .withInstrumentation(
    new MySQLInstrumentation({
      enabled: true
    }),
    new NestInstrumentation({
      enabled: true
    }),
  )
  .withSampler(new AlwaysOnSampler())
  .withSpanExporter(new OTLPTraceExporter())
  .withSpanProcessor((exporter) => new BatchSpanProcessor(exporter))

  .withLogging((options) =>
    options
      .withLogRecordExporter(new OTLPLogExporter())
  )
  .withMetrics((options) =>
    options
      .withMetricReader(
        new PeriodicExportingMetricReader({
          exporter: new OTLPMetricExporter(),
          exportIntervalMillis: 1000
        })
      )
  )
  .start();
```


### Using spans (tracing)

```typescript
import { setAttributeOnActiveSpan } from './set-attributes-on-active-span';
import { setSpanError } from './set-span-status';

@Injectable()
export class MyService {
  /**
   * Instead of manually starting a span, you can use the {@link span} decorator to automatically start a span for the given method.
   * Alternatively, use the `startSpan` method using the disposable pattern / manually ending it.
   * The span name can be overwritten, but defaults to AppService::getData.
   *
   * @note decorators require the following config options in the `tsconfig.json`:
   *     "emitDecoratorMetadata": true,
   *     "experimentalDecorators": true
   */
  @span()
  /**
   * Span attributes can be manually set in the method, by using the `setAttributeOnActiveSpan` method.
   * However, if you only want to set some input parameters as span attributes, you can use the {@link spanAttribute} decorator.
   *
   * @note primitive values (string, numbers and booleans) don't need a function for parsing. Other's do, because they are not valid span attribute values.
   * the name is automatically inferred, but technically does not match the Open telemetry spec, so it's recommended to always provide a name.
   */
  public methodWithSpanDecorator(@spanAttribute((val: Date) => val.toISOString()) date: Date, @spanAttribute() name: string) {
    setAttributeOnActiveSpan('name', name);
    setSpanError('This is an error');
  }

  public methodWithSpan() {
    const span = startSpan('methodWithSpan');

    span.setAttribute('name', 'John Doe');
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: 'This is an error'
    });

    span.end();
  }
  
  public methodWithDisposableSpan() {
    let span: Span;
    
    if (true) {
      using span = startSpan('methodWithDisposableSpan');
      span.end();
    }
    
    span.isRecording(); // false
  }
}
```


### Using metrics

```typescript
// We provide our own Gauge instance here to mimic the behaviour of a Prometheus Gauge (from prom-client)
// this is mainly because we use gauages for tracking time-related tasks, so we provide a simple utility to set the gauge to the current time.
const gauge = getOrCreateMetric({
  name: 'process_boot_time',
  unit: 's',
  type: 'Gauge',
  description: 'Time when the process started',
  valueType: ValueType.INT,
})

gauge.setToCurrentTime();

const counter = getOrCreateMetric({
  type: 'Counter',
  name: 'http_request', // automatically suffixed with '_total' by OTEL
  description: 'Total number of HTTP requests',
})

counter.add(1);

const histogram = getOrCreateMetric({
  type: 'Histogram',
  name: 'http_request_duration',
})

histogram.record(0.5);
```

Classes can also be decorated with the `metricIncrement` decorator to automatically increment a counter on a method call.

```typescript
class MyClass {
  @metricIncrement('my_class_method_calls')
  public myMethod() {
    // ...
  }
}
```
