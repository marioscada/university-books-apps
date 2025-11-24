module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nuova funzionalità
        'fix',      // Bug fix
        'refactor'  // Refactoring del codice
      ]
    ],
    'scope-enum': [2, 'always', ['cicd-test']],
    'scope-empty': [2, 'never'],
    'subject-case': [0],
    'body-max-line-length': [0]
  }
};
