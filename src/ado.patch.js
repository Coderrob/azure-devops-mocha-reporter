/* eslint-disable func-names */
/* eslint-disable no-param-reassign */
const addFunctionDowngradePatch = (testApi) => {
  // Patch to handle: https://github.com/microsoft/azure-devops-node-api/issues/318  
  testApi.addTestResultsToTestRun = function (results, project, runId) {
    return new Promise(async (resolve, reject) => {
      const routeValues = {
        project,
        runId,
      };
      try {
        const verData = await this.vsoClient.getVersioningData(
          '5.0-preview.5',
          'Test',
          '4637d869-3a76-4468-8057-0bb02aa385cf',
          routeValues,
        );
        const url = verData.requestUrl;
        const options = this.createRequestOptions('application/json', verData.apiVersion);
        const res = await this.rest.create(url, results, options);
        resolve(res);
      } catch (err) {
        reject(err);
      }
    });
  };
  return testApi;
};

module.exports = {
  addFunctionDowngradePatch,
};
