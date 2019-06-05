const _ = require('lodash');
const { TestResults } = require('./ado.constants');

const MOCHA_STATE_PASSED = 'passed';

const getTestCaseIdsFromTitle = (testCaseTitle) => {
  // "TC-[12345] - Do some stuff."
  // "TC-[12345, 67890] - Do some stuff and other stuff."
  if (!_.startsWith(testCaseTitle, 'TC')) {
    return [];
  }

  try {
    return testCaseTitle
      .split(']')[0]
      .split('[')[1]
      .split(',')
      .map(value => value.trim());
  } catch (error) {
    return [];
  }
};

const mapResultToADOResult = (state) => {
  switch (state) {
    case MOCHA_STATE_PASSED:
      return TestResults.PASSED;
    default:
      return TestResults.FAILED;
  }
};

module.exports = {
  getTestCaseIdsFromTitle,
  mapResultToADOResult,
};
