import { Controller, Get, Header, HttpCode } from '@nestjs/common';
import { PrometheusNestExporter } from '../exporters/prometheus-nest.exporter';
import { GlobalProviders } from '@zonneplan/open-telemetry-node';

@Controller('metrics')
export class PrometheusMetricsController {
  @Get()
  @HttpCode(200)
  @Header('Content-Type', 'text/plain')
  public async get(): Promise<string> {
    // Existence is forced by the module on init
    const metricReader = GlobalProviders.metricReaders?.find(
      (x) => x instanceof PrometheusNestExporter
    );

    if (!metricReader || !(metricReader instanceof PrometheusNestExporter)) {
      return '# Failed to collect OpenTelemetry metrics';
    }

    return (await metricReader.getMetricsResponseInPlainText()) ?? '';
  }
}
