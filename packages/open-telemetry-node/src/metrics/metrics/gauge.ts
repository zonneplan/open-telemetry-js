import { Attributes, ObservableGauge } from '@opentelemetry/api';

type GaugeAttributeVariation = {
  attributes: Attributes | undefined;
  value: number;
};

export class Gauge {
  private readonly gaugeAttributeVariation = new Map<
    string,
    GaugeAttributeVariation
  >();

  public constructor(private readonly gauge: ObservableGauge<Attributes>) {
    this.gauge.addCallback((observableResult) => {
      [...this.gaugeAttributeVariation.values()].forEach(
        ({ value, attributes }) =>
          observableResult.observe(value, attributes)
      );
    });
  }

  public setToCurrentTime(attributes?: Attributes): void {
    this.set(Date.now() / 1000, attributes);
  }

  public set(value: number, attributes?: Attributes): void {
    const key = attributes ? JSON.stringify(attributes) : '';
    const gaugeAttributeVariation = this.gaugeAttributeVariation.get(key);

    if (gaugeAttributeVariation) {
      gaugeAttributeVariation.value = value;
      return;
    }

    this.gaugeAttributeVariation.set(key, {
      attributes,
      value
    });
  }
}
