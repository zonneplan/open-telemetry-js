/* eslint-disable */
export default {
  displayName: 'open-telemetry-zonneplan',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/open-telemetry-zonneplan',
  passWithNoTests: true
};
