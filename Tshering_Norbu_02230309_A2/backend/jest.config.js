module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['**/*.js', '!node_modules/**', '!coverage/**', '!jest.config.js'],
  coverageDirectory: 'coverage',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathAsClassName: 'true'
    }]
  ]
};
