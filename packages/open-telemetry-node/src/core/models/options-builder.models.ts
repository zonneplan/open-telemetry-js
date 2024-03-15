export interface OptionsBuilder<T> {
    build(): T;
}

export type OptionsBuilderOptions<
    TBuilder extends OptionsBuilder<TOptions>,
    TOptions extends object,
> = TOptions | OptionsBuilderFn<TBuilder>;

export type OptionsBuilderFn<TBuilder> = (
    options: Omit<TBuilder, 'build'>,
) => void;
