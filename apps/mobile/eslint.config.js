// Flat ESLint config (CommonJS) with local custom plugin for hex color guarding
module.exports = [
  {
    files: ['**/*.{js,ts,tsx}'],
    ignores: ['node_modules/**', 'dist/**'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: require('@typescript-eslint/parser'),
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    plugins: {
      hexguard: require('./scripts/eslint-plugin-hexguard')
    },
    rules: {
      'hexguard/no-raw-hex': ['warn', {
        allowInPaths: ['src/design-system', 'assets'],
        pattern: '#(?:[0-9a-fA-F]{3}){1,2}',
        message: 'Evita hex directos fuera del design-system; usa tokens de colores'
      }]
    }
  }
];
