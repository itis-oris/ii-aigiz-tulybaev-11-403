const config = {
    extends: ['stylelint-config-standard'],
    rules: {
        'import-notation': null,
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
