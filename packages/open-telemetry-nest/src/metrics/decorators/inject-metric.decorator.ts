import { Inject } from '@nestjs/common';
import { getMetricProvideToken } from '../providers/create-metric-provider';

export function InjectMetric(name: string) {
    const token = getMetricProvideToken(name);

    return Inject(token);
}
