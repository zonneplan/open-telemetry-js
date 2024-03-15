import { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { CompositeLogRecordExporter } from './composite-log-record.exporter';

describe('CompositeLogRecordExporter', () => {
    let exporter: CompositeLogRecordExporter;
    let exporter1: LogRecordExporter;
    let exporter2: LogRecordExporter;

    beforeEach(() => {
        exporter1 = {
            export: jest.fn(),
            shutdown: jest.fn(),
        };

        exporter2 = {
            export: jest.fn(),
            shutdown: jest.fn(),
        };

        exporter = new CompositeLogRecordExporter(exporter1, exporter2);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('export', () => {
        it('should call export method of all exporters', () => {
            const logs: ReadableLogRecord[] = [];

            const resultCallback = jest.fn();

            exporter.export(logs, resultCallback);

            expect(exporter1.export).toHaveBeenCalledWith(logs, resultCallback);
            expect(exporter2.export).toHaveBeenCalledWith(logs, resultCallback);
        });
    });

    describe('shutdown', () => {
        it('should call shutdown method of all exporters', async () => {
            await exporter.shutdown();

            expect(exporter1.shutdown).toHaveBeenCalled();
            expect(exporter2.shutdown).toHaveBeenCalled();
        });
    });
});
