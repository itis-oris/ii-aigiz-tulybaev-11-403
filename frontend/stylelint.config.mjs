const config = {
    extends: ['stylelint-config-standard'],
    rules: {
        'hue-degree-notation': null,
        'import-notation': null,
        'lightness-notation': null,
        'rule-empty-line-before': null,
        'at-rule-no-unknown': [
            true,
            {
                ignoreAtRules: [
                    'theme',
                    'source',
                    'utility',
                    'variant',
                    'custom-variant',
                    'plugin',
                    'apply',
                    'reference',
                    'config',
                ],
            },
        ],
    },
};

export default config;
