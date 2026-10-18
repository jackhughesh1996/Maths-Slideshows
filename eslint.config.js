export default [
  {
    ignores: [
      'src/generated/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'lessons/*/index.html',
      'public/downloads/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  {
    files: ['src/**/*.{js,mjs,cjs}', 'scripts/**/*.{js,mjs,cjs}', 'tests/**/*.{js,mjs,cjs}', '*.{js,mjs,cjs}'],
    rules: {
      'no-debugger': 'error',
      'no-unreachable': 'error',
      'no-duplicate-case': 'error',
      'no-dupe-keys': 'error',
      'no-dupe-args': 'error',
      'no-const-assign': 'error',
      'no-unsafe-finally': 'error',
      'valid-typeof': 'error',
    },
  },
];
