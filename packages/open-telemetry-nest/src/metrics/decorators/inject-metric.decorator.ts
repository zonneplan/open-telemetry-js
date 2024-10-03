import { Inject } from '@nestjs/common';
import { getMetricProvideToken } from '../providers/create-metric-provider';

/**
 * Injects a metric by name
 * @param name
 * @returns {PropertyDecorator & ParameterDecorator} Nest injection token
 */
export function InjectMetric(name: string) {
  const token = getMetricProvideToken(name);

  return Inject(token);
}
