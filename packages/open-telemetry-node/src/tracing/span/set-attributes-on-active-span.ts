import { AttributeValue, trace } from '@opentelemetry/api';

/**
 * Sets an attribute on the active span.
 * @param key
 * @param value
 */
export const setAttributeOnActiveSpan = (
  key: string,
  value: AttributeValue
) => {
  trace.getActiveSpan()?.setAttribute(key, value);
};

/**
 * Sets attributes on the active span.
 * @param attributes
 */
export const setAttributesOnActiveSpan = (
  attributes: Record<string, AttributeValue>
) => {
  trace.getActiveSpan()?.setAttributes(attributes);
};
