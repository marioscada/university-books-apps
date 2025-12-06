module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ["feat","fix","refactor","docs","chore","test"]],
    'scope-enum': [2, 'always', ["university-books-mobile","api-client","auth","ci"]],
    'scope-empty': [2, 'never']
  }
};
