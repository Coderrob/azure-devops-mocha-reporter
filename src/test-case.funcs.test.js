const { expect } = require('chai');
const { TestResults } = require('./ado.constants');
const {
  getTestCaseIdsFromTitle,
  mapResultToADOResult,
} = require('./test-case.funcs');

const mochaTestStates = {
  PASSED: 'passed',
  FAILED: 'failed',
  PENDING: 'pending',
};

describe('Test Case Functions', () => {
  describe('getTestCaseIdsFromTitle Tests', () => {
    it('TC-[12345] should return expected test case Id with dash after TC', () => {
      const testCaseIds = getTestCaseIdsFromTitle('TC-[12345] I like to test');
      expect(testCaseIds[0]).to.equal('12345');
    });

    it('should return expected test case Id with no dash after TC', () => {
      const testCaseIds = getTestCaseIdsFromTitle('TC[12345] I like to test');
      expect(testCaseIds[0]).to.equal('12345');
    });

    it('should return expected test case Ids', () => {
      const testCaseIds = getTestCaseIdsFromTitle('TC-[12345,67890] - I like to test');
      expect(testCaseIds[0]).to.equal('12345');
      expect(testCaseIds[1]).to.equal('67890');
    });
  });

  describe('mapResultToADOResult Tests', () => {
    it('should return passed state', () => {
      expect(mapResultToADOResult(mochaTestStates.PASSED)).to.equal(TestResults.PASSED);
    });

    it('should return failed state', () => {
      expect(mapResultToADOResult(mochaTestStates.FAILED)).to.equal(TestResults.FAILED);
    });

    it('should return failed state if pending test', () => {
      expect(mapResultToADOResult(mochaTestStates.PENDING)).to.equal(TestResults.FAILED);
    });
  });
});
