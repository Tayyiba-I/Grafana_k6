
 import http from 'k6/http';
import { check, __VU, __ITER } from 'k6';

export const testCaseHandlers = new Map();

const httpRequestHandler = {
    execute(testCase) {
        let res;
        const params = { headers: testCase.headers || {} };
        const payload = testCase.payload ? JSON.stringify(testCase.payload) : null;

        // Execute the HTTP request based on the method
        switch (testCase.method) {
            case 'GET':
                res = http.get(testCase.url, params);
                break;
            case 'POST':
                res = http.post(testCase.url, payload, params);
                break;
            case 'PUT':
                res = http.put(testCase.url, payload, params);
                break;
            case 'DELETE':
                res = http.del(testCase.url, null, params);
                break;
            default:
                console.error(`Unsupported HTTP method: ${testCase.method}`);
                return { overallPassed: false, duration: 0, status: 0 };
        }

        let allChecksPassed = true;
        const executedChecks = [];

        // Iterate over the checks defined in the test case configuration
        testCase.checks?.forEach(c => {
            let checkResult = false;
            let checkName = '';
            let actualValue = '';

            if (c.type === 'status') {
                checkName = `Status is ${c.value}`;
                checkResult = check(res, {
                    [checkName]: (r) => r.status === c.value
                });
                actualValue = res.status;
            } else if (c.type === 'body-includes') {
                checkName = `Body includes '${c.value}'`;
                checkResult = check(res, {
                    [checkName]: (r) => r.body && r.body.includes(c.value)
                });
                actualValue = res.body?.includes(c.value);
            } else if (c.type === 'body-length') {
                checkName = `Body length >= ${c.min}`;
                checkResult = check(res, {
                    [checkName]: (r) => r.body && r.body.length >= c.min
                });
                actualValue = res.body?.length;
            } else {
                console.warn(`Unsupported check type: ${c.type}`);
                checkResult = false; // Fails the check explicitly
                actualValue = 'Unsupported check type';
            }

            executedChecks.push({
                type: c.type,
                name: checkName,
                expected: c.value || c.min,
                actual: actualValue,
                passed: checkResult
            });

            if (!checkResult) {
                allChecksPassed = false;
            }
        });

        return {
            testCaseName: testCase.name,
            type: testCase.type,
            method: testCase.method,
            url: testCase.url,
            requestPayload: testCase.payload || null,
            status: res.status,
            duration: res.timings.duration,
            overallPassed: allChecksPassed,
            checks,
            responseBody: res.body?.substring(0, 500) || '',
            vu: __VU,
            iter: __ITER
        };
    }
};

testCaseHandlers.set('http-request', httpRequestHandler);