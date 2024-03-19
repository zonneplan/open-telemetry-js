import { ExportResult } from '@opentelemetry/core';
import { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs';

export class CompositeLogRecordExporter implements LogRecordExporter {
  private readonly _exporters: LogRecordExporter[];

  constructor(...exporters: LogRecordExporter[]) {
    this._exporters = exporters;
  }

  public export(
    logs: ReadableLogRecord[],
    resultCallback: (result: ExportResult) => void
  ): void {
    for (const exporter of this._exporters) {
      exporter.export(logs, resultCallback);
    }
  }

  public async shutdown(): Promise<void> {
    await Promise.all(
      this._exporters.map((exporter) => exporter.shutdown())
    );
  }
}
