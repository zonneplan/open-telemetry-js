import { Attributes, Gauge as OTELGauge } from '@opentelemetry/api';

/**
 * Wrapper around the OTEL Gauge, to provide a more prom-client like API.
 */
export class Gauge {
  public constructor(private readonly gauge: OTELGauge<Attributes>) {
  }

  /**
   * Sets the gauge to the current time in seconds.
   * @param attributes optional attributes to be set on the gauge.
   */
  public setToCurrentTime(attributes?: Attributes): void {
    this.record(Date.now() / 1000, attributes);
  }

  /**
   * Records the value to the gauge.
   * @param value the value to record.
   * @param attributes optional attributes to be set on the gauge.
   */
  public record(value: number, attributes?: Attributes): void {
    this.gauge.record(value, attributes);
  }
}
