
import http from 'k6/http';
import { check, sleep, __ITER } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { testCaseHandlers } from './testCaseHandlers.js';
import { logger } from '../../utils/logger.js';

const failedRequests = new Rate('failed_requests');
const avgResponseTime = new Trend('avg_response_time');
const allTestResults = [];

const testCases = JSON.parse(open('../../config/tests.json'));

let options = {
    vus: 1,
    iterations: testCases.length,
    thresholds: {
        'failed_requests': ['rate<=0.1'],
        'http_req_duration': ['avg<=1000'],
    },
};

let isStressTest = false;
let stressTestCase = null;

// Scenario-based
for (const testCase of testCases) {
    if (testCase.options?.scenarios) {
        isStressTest = true;
        stressTestCase = testCase;
        options = {
            ...testCase.options,
            thresholds: testCase.options.thresholds || {
                'failed_requests': ['rate<=0.1'],
                'http_req_duration': ['avg<=1000'],
            },
        };
        break;
    }
}

// Load-based
if (!isStressTest) {
    const loadTestCase = testCases.find(tc => tc.users && tc.duration);
    if (loadTestCase) {
        isStressTest = true;
        stressTestCase = loadTestCase;
        options = {
            vus: loadTestCase.users,
            duration: loadTestCase.duration,
            thresholds: {
                'failed_requests': ['rate<=0.1'],
                'http_req_duration': ['avg<=1000'],
            },
        };
    }
}

export { options };

export default function () {
    if (isStressTest) {
        runTestCase(stressTestCase);
    } else {
        const testCase = testCases[__ITER % testCases.length];
        runTestCase(testCase);
    }
}

function runTestCase(testCase) {
    const handler = testCaseHandlers.get(testCase.type || 'http-request');
    if (!handler) {
        logger.error(`Unsupported test case type: ${testCase.type}`);
        failedRequests.add(1);
        return;
    }

    const result = handler.execute(testCase);

    failedRequests.add(!result.overallPassed);
    avgResponseTime.add(result.duration);

    check(null, {
        [`${testCase.name} - Overall Passed`]: () => result.overallPassed,
    });

    allTestResults.push(result);
    sleep(1);
}

export function handleSummary(data) {
    let passedCount = 0;
    let failedCount = 0;
    const lines = [];

    for (const result of allTestResults) {
        const icon = result.overallPassed ? '✅' : '❌';
        const statusText = result.overallPassed ? 'PASS' : 'FAIL';
        result.overallPassed ? passedCount++ : failedCount++;

        lines.push(`\n${icon} ${result.testCaseName}`);
        lines.push(`🔹 Method: ${result.method}`);
        lines.push(`🔗 URL: ${result.url}`);
        lines.push(`🕒 Duration: ${result.duration.toFixed(2)} ms`);
        lines.push(`📊 Status Code: ${result.status}`);
        lines.push(`🏁 Result: ${statusText}`);

        logger.info(`${icon} ${result.testCaseName} — ${statusText}`, {
            method: result.method,
            url: result.url,
            status: result.status,
            duration: `${result.duration.toFixed(2)}ms`,
        });

        if (result.checks?.length) {
            lines.push(`🔍 Checks:`);
            result.checks.forEach((check) => {
                const checkIcon = check.passed ? '✅' : '❌';
                const expected = check.expected !== undefined ? `expected: ${check.expected}` : '';
                const actual = check.actual !== undefined ? `actual: ${check.actual}` : '';
                const checkLine = `   ${checkIcon} ${check.type} — ${expected}${actual ? `, ${actual}` : ''}`;
                lines.push(checkLine);

                logger.checkResult(`${result.testCaseName} - ${check.type}`, check.passed, {
                    expected: check.expected,
                    actual: check.actual,
                });
            });
        } else {
            lines.push(`🔍 Checks: None`);
        }

        lines.push('──────────────────────────────────────────────');
    }

    const summaryFooter = `\n Final Summary: ✅ Passed: ${passedCount} | ❌ Failed: ${failedCount}`;
    lines.push(summaryFooter);

    logger.info(' Final Summary', {
        passed: passedCount,
        failed: failedCount,
    });

    const fullSummary = lines.join('\n');
    data.summaryText = fullSummary;

    return {
        'summary.html': htmlReport(data, {
            title: ' K6 Complete Test Report',
        }),
        'summary.txt': fullSummary,
    };
}
