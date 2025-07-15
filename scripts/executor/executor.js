import http from 'k6/http';
import { check, sleep } from 'k6';
import { logger } from '../../utils/logger.js';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

// NOTE: k6 does not have a native way to read a file during runtime (outside of the init context).
// A common workaround is to use the `exec` module to read the file into an environment variable
// or a file. For simplicity, we'll demonstrate using a hardcoded string or a `data-provider.js`
// script to fetch the JSON from a public URL. A better way is to use k6's `init` context.

// For this example, we will import the data directly from a file. In a real-world scenario,
// you might load it from a service or an environment variable.
const testCases = JSON.parse(open('../../config/tests.json'));
export const options = {
  vus: 1,
  iterations: 1,
};

export default function () {
  testCases.forEach(testCase => {
    logger.apiCall(testCase.method, testCase.url, { payload: testCase.payload });

    let res;
    const params = { headers: testCase.headers };
    
    switch (testCase.method) {
      case 'GET':
        res = http.get(testCase.url, params);
        break;
      case 'POST':
        res = http.post(testCase.url, JSON.stringify(testCase.payload), params);
        break;
      case 'PUT':
        res = http.put(testCase.url, JSON.stringify(testCase.payload), params);
        break;
      case 'DELETE':
        res = http.del(testCase.url, null, params);
        break;
      default:
        logger.error(`Unsupported HTTP method: ${testCase.method}`);
        return;
    }

    // Dynamic checks based on the config file
    let allChecksPassed = true;
    testCase.checks.forEach(testCheck => {
      let isCheckPassed = false;
      let checkMessage = `[${testCase.name}] Check failed for ${testCheck.type}`;

      try {
        switch (testCheck.type) {
          case 'status':
            isCheckPassed = res.status === testCheck.value;
            checkMessage = `[${testCase.name}] Status is ${testCheck.value}`;
            break;
          case 'body-includes':
            isCheckPassed = res.body && res.body.includes(testCheck.value);
            checkMessage = `[${testCase.name}] Body includes "${testCheck.value}"`;
            break;
          case 'body-length':
            isCheckPassed = res.body.length >= testCheck.min;
            checkMessage = `[${testCase.name}] Body length is at least ${testCheck.min}`;
            break;
        }
      } catch (e) {
          logger.error(`Error during check: ${e.message}`, { testCase: testCase.name, checkType: testCheck.type });
          isCheckPassed = false;
      }
      
      logger.checkResult(checkMessage, isCheckPassed);
      if (!isCheckPassed) allChecksPassed = false;
    });

    if (allChecksPassed) {
        logger.info(`[${testCase.name}] All checks passed.`);
    } else {
        logger.error(`[${testCase.name}] Failed one or more checks.`);
    }

    sleep(1);
  });
}