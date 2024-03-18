import { MetricReader } from '@opentelemetry/sdk-metrics';
import { PrometheusSerializer } from '@opentelemetry/exporter-prometheus';
import { register } from 'prom-client';

export class PrometheusNestExporter extends MetricReader {
  private readonly serializer: PrometheusSerializer =
    new PrometheusSerializer();

  public async getMetricsResponseInPlainText(): Promise<string> {
    const [defaultMetrics, openTelemetryMetrics] = await Promise.all([
      this.getPrometheusDefaultMetricsInPlainText(),
      this.getOpenTelemetryPrometheusMetricsInPlainText()
    ]);

    return `${defaultMetrics}\n${openTelemetryMetrics}`;
  }

  protected onForceFlush(): Promise<void> {
    // do nothing
    return Promise.resolve(undefined);
  }

  protected onShutdown(): Promise<void> {
    // do nothing
    return Promise.resolve(undefined);
  }

  private async getPrometheusDefaultMetricsInPlainText(): Promise<string> {
    return await register.metrics();
  }

  private async getOpenTelemetryPrometheusMetricsInPlainText(): Promise<string> {
    const defaultMessage = '# Failed to collect OpenTelemetry metrics';

    try {
      const { resourceMetrics, errors } = await this.collect();

      if (errors.length) {
        return defaultMessage;
      }

      return this.serializer.serialize(resourceMetrics);
    } catch {
      return defaultMessage;
    }
  }
}
