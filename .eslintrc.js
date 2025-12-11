module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:security/recommended',
        'prettier',
    ],
    plugins: ['@typescript-eslint', 'security'],
    env: {
        node: true,
        es2022: true,
        jest: true,
    },
    rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'security/detect-object-injection': 'off',
        'security/detect-non-literal-fs-filename': 'off',
    },
    ignorePatterns: ['dist', 'node_modules', 'coverage', '*.js'],
};
