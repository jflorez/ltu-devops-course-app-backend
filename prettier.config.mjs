/** @type {import('prettier').Config} */
const config = {
    tabWidth: 4,
    semi: true,
    singleQuote: true,
    printWidth: 120,
    bracketSpacing: true,
    trailingComma: 'all',
    arrowParens: 'avoid',
    overrides: [
        {
            files: ['*.yaml', '*.yml', '*.json', '.prettierrc'],
            options: {
                tabWidth: 2,
            },
        },
    ],
};
export default config;
