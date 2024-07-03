import { Attributes, Gauge as OTELGauge } from '@opentelemetry/api';

export class Gauge {
  public constructor(private readonly gauge: OTELGauge<Attributes>) {
  }

  public setToCurrentTime(attributes?: Attributes): void {
    this.record(Date.now() / 1000, attributes);
  }

  /**
   * @deprecated use {@link record} instead. Will be removed in version 1.0.
   */
  public set(value: number, attributes?: Attributes): void {
    this.gauge.record(value, attributes);
  }

  public record(value: number, attributes?: Attributes): void {
    this.gauge.record(value, attributes);
  }
}
