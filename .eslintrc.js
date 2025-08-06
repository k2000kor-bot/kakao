module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'no-template-curly-in-string': 'warn',
    'import/no-anonymous-default-export': 'warn',
    'no-useless-escape': 'warn'
  }
}; 