import {
    OptionsBuilder,
    OptionsBuilderOptions,
} from '../models/options-builder.models';

export function getOptions<
    TBuilder extends OptionsBuilder<TOptions>,
    TOptions extends object,
>(
    builderType: new () => TBuilder,
    optionsBuilderOrOptions: OptionsBuilderOptions<TBuilder, TOptions>,
): TOptions {
    if (typeof optionsBuilderOrOptions === 'function') {
        const builder = new builderType();
        optionsBuilderOrOptions(builder);
        return builder.build();
    }

    return optionsBuilderOrOptions;
}
