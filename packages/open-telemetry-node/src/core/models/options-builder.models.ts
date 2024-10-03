export interface OptionsBuilder<T> {
  /**
   * Conditionally applies the provided function to the builder.
   * @param condition true to apply the function, false to skip it.
   * @param fn The function to apply.
   */
  $if(condition: boolean, fn: OptionsBuilderFn<this>): this;

  /**
   * Builds the options object.
   */
  build(): T;
}

export type OptionsBuilderOptions<
  TBuilder extends OptionsBuilder<TOptions>,
  TOptions extends object,
> = TOptions | OptionsBuilderFn<TBuilder>;

export type OptionsBuilderFn<TBuilder> = (
  options: Omit<TBuilder, 'build'>
) => void;
