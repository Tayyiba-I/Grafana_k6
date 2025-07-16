import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { logger } from '../../utils/logger.js';

// Custom metrics to track failure rate and average response time
const failedRequests = new Trend('failed_requests');
const avgResponseTime = new Trend('avg_response_time');

const testCases = JSON.parse(open('../../config/tests.json'));

export let options = {};

// Find the first test case with a 'scenarios' block to configure the test
const stressTestConfig = testCases.find(tc => tc.options && tc.options.scenarios);
if (stressTestConfig) {
    options = stressTestConfig.options;
} else {
    // Default options for functional tests if no stress test is defined
    options = {
        vus: 1,
        iterations: 1,
    };
    // Add default thresholds if not present
    if (!options.thresholds) {
        options.thresholds = {
            'failed_requests': [`rate<=${0.1}`],
            'avg_response_time': [`avg<=${1000}`]
        };
    }
}

const testCaseMap = new Map(testCases.map(tc => [tc.name, tc]));

export default function () {
    // If a stress test is configured, run only that test case
    if (stressTestConfig) {
        const testCase = stressTestConfig;
        runTestCase(testCase);
    } else {
        // Otherwise, loop through all functional tests
        testCases.forEach(testCase => {
            runTestCase(testCase);
        });
    }
}

function runTestCase(testCase) {
    logger.apiCall(testCase.method, testCase.url, { payload: testCase.payload });

    const params = { headers: testCase.headers };
    let res;

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
    
    failedRequests.add(!allChecksPassed);
    avgResponseTime.add(res.timings.duration);

    check(res, {
        [`${testCase.name} - Passed checks`]: (r) => allChecksPassed,
    });
    
    sleep(1);
}

import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export function handleSummary(data) {
  return {
    "summary.html": htmlReport(data),
  };
}