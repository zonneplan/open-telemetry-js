import { SpanOptions } from '../models/span-options.model';
import { span } from './span.decorator';

export function rootSpan(
    options?: Exclude<SpanOptions, 'newContext'>,
): MethodDecorator;
export function rootSpan(
    name?: string,
    options?: Exclude<SpanOptions, 'newContext'>,
): MethodDecorator;
export function rootSpan(
    nameOrOptions?: string | Exclude<SpanOptions, 'newContext'>,
    options?: Exclude<SpanOptions, 'newContext'>,
): MethodDecorator {
    if (typeof nameOrOptions === 'string') {
        return span(nameOrOptions, { ...options, newContext: true });
    }

    return span({ ...nameOrOptions, newContext: true });
}
