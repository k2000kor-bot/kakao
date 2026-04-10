module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'no-template-curly-in-string': 'warn',
    'import/no-anonymous-default-export': 'warn',
    'no-useless-escape': 'warn'
  },
  overrides: [
    {
      // Jest: jest.mock·installJestFetchMock 등이 import 앞에 올 수 있고, setupTests는 소스맵 해제 후 import가 필요함
      files: [
        'src/setupTests.ts',
        'src/**/*.test.{ts,tsx,js,jsx}',
        'src/**/__tests__/**/*.{ts,tsx,js,jsx}',
      ],
      rules: {
        'import/first': 'off',
      },
    },
    {
      files: ['e2e/**/*.spec.ts', 'e2e/**/*.spec.js'],
      rules: {
        // E2E 테스트에서는 조건부 expect가 필요할 수 있음
        'jest/no-conditional-expect': 'off',
        'jest/valid-title': 'warn',
        // E2E 테스트에서는 동일한 제목이 다른 describe 블록에서 사용될 수 있음
        'jest/no-identical-title': 'warn'
      }
    }
  ]
}; 