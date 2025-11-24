module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nuova funzionalità
        'fix',      // Bug fix
        'docs',     // Documentazione
        'style',    // Formattazione, semicolons, etc.
        'refactor', // Refactoring del codice
        'perf',     // Miglioramenti performance
        'test',     // Aggiunta test
        'chore',    // Manutenzione, build, CI
        'ci',       // Cambiamenti CI/CD
        'build',    // Build system
        'revert'    // Revert commit
      ]
    ],
    'scope-case': [2, 'always', 'kebab-case'],
    'subject-case': [0], // Permette qualsiasi case
    'body-max-line-length': [0] // Nessun limite
  }
};
