// import http from 'k6/http';
// import { check, sleep } from 'k6';
// import { Trend } from 'k6/metrics';
// import { logger } from '../../utils/logger.js';

// // Custom metric to track failure rate
// const failedRequests = new Trend('failed_requests');
// const avgResponseTime = new Trend('avg_response_time');

// const testCases = JSON.parse(open('../../config/tests.json'));

// export const options = {
//   // Define a single VUS and iteration for now. We will run each test case in a loop.
//   vus: 1,
//   iterations: 1,
// };

// export default function () {
//   testCases.forEach(testCase => {
//     logger.apiCall(testCase.method, testCase.url, { payload: testCase.payload });

//     // --- EXECUTE THE TEST CASE ---
//     let res;
//     const params = { headers: testCase.headers };

//     for (let i = 0; i < testCase.options.iterations; i++) {
//         switch (testCase.method) {
//           case 'GET':
//             res = http.get(testCase.url, params);
//             break;
//           case 'POST':
//             res = http.post(testCase.url, JSON.stringify(testCase.payload), params);
//             break;
//           case 'PUT':
//             res = http.put(testCase.url, JSON.stringify(testCase.payload), params);
//             break;
//           case 'DELETE':
//             res = http.del(testCase.url, null, params);
//             break;
//           default:
//             logger.error(`Unsupported HTTP method: ${testCase.method}`);
//             return;
//         }

//         // --- APPLY CHECKS AND THRESHOLDS ---
//         const allChecksPassed = check(res, {
//             [`${testCase.name} - status is ${testCase.checks[0].value}`]: (r) => r.status === testCase.checks[0].value,
//             [`${testCase.name} - body includes "${testCase.checks[1].value}"`]: (r) => r.body.includes(testCase.checks[1].value),
//         });

//         // Add a check to a custom metric for reporting
//         const requestFailed = !allChecksPassed;
//         failedRequests.add(requestFailed);
//         avgResponseTime.add(res.timings.duration);

//         // This check will show up in the final summary
//         check(res, {
//           [`${testCase.name} - Passed checks`]: (r) => allChecksPassed,
//         });

//         sleep(1);
//     }
    
//     // Output final result for the test case
//     logger.info(`[${testCase.name}] Test case completed.`);
    
//     // Add thresholds from JSON to the final k6 options
//     if (testCase.options.thresholds) {
//       if (!options.thresholds) {
//           options.thresholds = {};
//       }
      
//       const thresholds = testCase.options.thresholds;
      
//       if (thresholds.fail_rate !== undefined) {
//           options.thresholds['failed_requests'] = [`rate<=${thresholds.fail_rate}`];
//       }
//       if (thresholds.avg_response_time !== undefined) {
//           options.thresholds['avg_response_time'] = [`avg<=${thresholds.avg_response_time}`];
//       }
//     }
//   });
// }
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { logger } from '../../utils/logger.js';

// Custom metric to track failure rate
const failedRequests = new Trend('failed_requests');
const avgResponseTime = new Trend('avg_response_time');

const testCases = JSON.parse(open('../../config/tests.json'));

export const options = {
  // Define a single VUS and iteration for now. We will run each test case in a loop.
  vus: 1,
  iterations: 1,
};

export default function () {
  testCases.forEach(testCase => {
    logger.apiCall(testCase.method, testCase.url, { payload: testCase.payload });

    // --- EXECUTE THE TEST CASE ---
    let res;
    const params = { headers: testCase.headers };

    for (let i = 0; i < testCase.options.iterations; i++) {
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

      // --- APPLY CHECKS AND THRESHOLDS ---
      const allChecks = {};
      testCase.checks.forEach(testCheck => {
          switch (testCheck.type) {
              case 'status':
                  allChecks[`${testCase.name} - Status is ${testCheck.value}`] = (r) => r.status === testCheck.value;
                  break;
              case 'body-includes':
                  allChecks[`${testCase.name} - Body includes "${testCheck.value}"`] = (r) => r.body && r.body.includes(testCheck.value);
                  break;
              case 'body-length':
                  allChecks[`${testCase.name} - Body length is at least ${testCheck.min}`] = (r) => r.body.length >= testCheck.min;
                  break;
          }
      });
      
      const allChecksPassed = check(res, allChecks);

      // Add a check to a custom metric for reporting
      const requestFailed = !allChecksPassed;
      failedRequests.add(requestFailed);
      avgResponseTime.add(res.timings.duration);

      // This check will show up in the final summary
      check(res, {
        [`${testCase.name} - Passed checks`]: (r) => allChecksPassed,
      });

      sleep(1);
    }
    
    // Output final result for the test case
    logger.info(`[${testCase.name}] Test case completed.`);
    
    // Add thresholds from JSON to the final k6 options
    if (testCase.options.thresholds) {
      if (!options.thresholds) {
          options.thresholds = {};
      }
      
      const thresholds = testCase.options.thresholds;
      
      if (thresholds.fail_rate !== undefined) {
          options.thresholds['failed_requests'] = [`rate<=${thresholds.fail_rate}`];
      }
      if (thresholds.avg_response_time !== undefined) {
          options.thresholds['avg_response_time'] = [`avg<=${thresholds.avg_response_time}`];
      }
    }
  });
}