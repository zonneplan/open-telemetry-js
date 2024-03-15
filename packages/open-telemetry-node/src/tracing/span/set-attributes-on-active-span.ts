import { AttributeValue, trace } from '@opentelemetry/api';

export const setAttributeOnActiveSpan = (
    key: string,
    value: AttributeValue,
) => {
    trace.getActiveSpan()?.setAttribute(key, value);
};

export const setAttributesOnActiveSpan = (
    attributes: Record<string, AttributeValue>,
) => {
    trace.getActiveSpan()?.setAttributes(attributes);
};
