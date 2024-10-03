import { MetricReader } from '@opentelemetry/sdk-metrics';
import { PrometheusSerializer } from '@opentelemetry/exporter-prometheus';
import { register } from 'prom-client';

/**
 * Exports metrics in Prometheus plain text format.
 */
export class PrometheusNestExporter extends MetricReader {
  private readonly serializer: PrometheusSerializer =
    new PrometheusSerializer();

  /**
   * Gets the following metrics in plain text format:
   * - Default Prometheus metrics (using prom-client)
   * - Metrics collected via OpenTelemetry
   */
  public async getMetricsResponseInPlainText(): Promise<string> {
    const [defaultMetrics, openTelemetryMetrics] = await Promise.all([
      this.getPrometheusDefaultMetricsInPlainText(),
      this.getOpenTelemetryPrometheusMetricsInPlainText()
    ]);

    return `${defaultMetrics}\n${openTelemetryMetrics}`;
  }

  /** @inheritdoc */
  protected onForceFlush(): Promise<void> {
    // do nothing
    return Promise.resolve(undefined);
  }

  /** @inheritdoc */
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
