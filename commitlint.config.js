module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ["feat","fix","refactor","docs","chore","test"]],
    'scope-enum': [2, 'always', ["cicd-test","cicd-second-project","cicd-third-project","auth"]],
    'scope-empty': [2, 'never']
  }
};
