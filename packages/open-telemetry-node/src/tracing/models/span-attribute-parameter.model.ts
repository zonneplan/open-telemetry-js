export interface SpanAttributeParameter {
    index: number;
    name: string;
    parseFn: (param: unknown) => string | number | boolean;
}
