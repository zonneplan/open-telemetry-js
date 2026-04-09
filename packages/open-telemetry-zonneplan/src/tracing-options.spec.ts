import { DefaultTracingOptions } from './tracing-options';

describe('DefaultTracingOptions', () => {
  it('does not register duplicate instrumentations', () => {
    const instrumentationNames = DefaultTracingOptions.instrumentations.map(
      (instrumentation) => instrumentation.instrumentationName
    );

    const duplicateNames = instrumentationNames.filter(
      (name, index) => instrumentationNames.indexOf(name) !== index
    );

    expect(duplicateNames).toEqual([]);
  });

  it('includes the core instrumentations we expect from the auto bundle', () => {
    const instrumentationNames = DefaultTracingOptions.instrumentations.map(
      (instrumentation) => instrumentation.instrumentationName
    );

    expect(instrumentationNames).toContain('@opentelemetry/instrumentation-kafkajs');
    expect(instrumentationNames).toContain('@opentelemetry/instrumentation-mysql');
    expect(instrumentationNames).toContain('@opentelemetry/instrumentation-nestjs-core');
    expect(instrumentationNames).toContain('@opentelemetry/instrumentation-winston');
  });
});
