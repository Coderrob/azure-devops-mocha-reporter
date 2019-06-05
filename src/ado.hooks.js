/* eslint-disable func-names */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
const devops = require('azure-devops-node-api');
const moment = require('moment');
const { TestRunStates } = require('./ado.constants');
const config = require('../config/ado.json');
const { addFunctionDowngradePatch } = require('./ado.patch');
const { getTestCaseIdsFromTitle, mapResultToADOResult } = require('./test-case.funcs');

const { defaultUri, project, personalAccessToken } = config;
const { plan } = project;

const createTestApi = async () => {
  const token = process.env.AZURE_PERSONAL_ACCESS_TOKEN || personalAccessToken;
  const authHandler = devops.getPersonalAccessTokenHandler(token);
  const connection = new devops.WebApi(defaultUri, authHandler);
  const api = await connection.getTestApi();
  return addFunctionDowngradePatch(api);
};

const createTestRun = (testApi, startTime) => testApi
  .createTestRun({
    name: config.name,
    plan,
    state: TestRunStates.IN_PROGRESS,
    startDate: startTime,
    pointIds: [],
  }, project.name);

const endTestRun = (testApi, testRun, endTime) => testApi.updateTestRun({
  state: TestRunStates.COMPLETED,
  completeDate: endTime,
}, project.name, testRun.id);

const reportTestResults = (testApi, testRun, suite, test, outcome) => {
  const testCaseIds = getTestCaseIdsFromTitle(test.title);
  if (testCaseIds.length === 0) return Promise.resolve();
  return Promise.all(testCaseIds.map(testCaseId => testApi
    .getPoints(project.name, plan.id, suite.id, null, null, testCaseId)
    .then((points) => {
      if (!points || points.length === 0) return Promise.resolve();
      return testApi
        .addTestResultsToTestRun([{
          testPlan: { id: plan.id },
          testSuite: { id: suite.id },
          testCase: { id: testCaseId },
          testPoint: { id: points[0].id },
          state: TestRunStates.IN_PROGRESS,
          outcome,
        }], project.name, testRun.id)
        .catch((err) => { console.log(err); });
    })
    .catch((err) => { console.log(err); })));
};

let testApi;
let testRun;

before(async () => {
  const startTime = moment().utc().toISOString();
  testApi = await createTestApi();
  testRun = await createTestRun(testApi, startTime);
});

// Function required to scope `this` to access currentTest.
afterEach(function () {
  const { state } = this.currentTest;
  return reportTestResults(
    testApi,
    testRun,
    plan.suites[0],
    this.currentTest,
    mapResultToADOResult(state),
  ).catch((err) => { console.log(err); });
});

after(() => {
  const endTime = moment().utc().toISOString();
  // Known bug in the Azure DevOps implementation - requires calling end test run twice.
  return endTestRun(testApi, testRun, endTime).then(() => endTestRun(testApi, testRun, endTime));
});
