import http from 'k6/http';
import { check, sleep } from 'k6';
import { logger } from '../../utils/logger.js';


export let options = {
  vus: 1,           
  iterations: 1,    
   duration: '5s',
  
};

export default function () {
  const url = 'https://jsonplaceholder.typicode.com/posts';

  \
  const token = __ENV.K6_AUTH_TOKEN;

  \
  if (!token || token.trim() === '') {
    logger.error('Authentication token (K6_AUTH_TOKEN) is not set or is empty. Please set it as an environment variable.');
    
    check(false, { 'K6_AUTH_TOKEN environment variable is set': false });
    return; 
  }

  const payload = JSON.stringify({
    title: 'Secured POST',
    body: 'Learning POST with Bearer Token!',
    userId: 2,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, 
    },
  };

  logger.apiCall('POST', url, { payload: payload, headers: params.headers }); 

  const res = http.post(url, payload, params);

  
  logger.info(`Response status for POST to ${url}: ${res.status}`);
  logger.info(`Response body for POST to ${url}: ${res.body}`);

  
  const isStatus201 = res.status === 201;
  logger.checkResult('Status is 201 Created', isStatus201, { status: res.status });

  // JSONPlaceholder echoes the sent payload, so checking for the title is a good functional test.
  let isTitleCorrect = false;
  try {
      isTitleCorrect = res.body && res.body.includes('Secured POST');
      logger.checkResult('Response body contains correct title', isTitleCorrect, { bodyPreview: res.body.substring(0, 50) });
  } catch (e) {
      logger.error('Failed to check response body for title.', e, { responseBody: res.body });
      logger.checkResult('Response body contains correct title', false, { error: e.message });
  }


  
  const responseTimeUnder1s = res.timings.duration < 1000; 
  logger.checkResult(`Response time < 1s`, responseTimeUnder1s, { duration: res.timings.duration });


  // Overall success or failure logging
  if (isStatus201 && isTitleCorrect && responseTimeUnder1s) {
      logger.info('POST request successful and met all checks.');
  } else {
      logger.error('POST request failed one or more checks.', { status: res.status, body: res.body, duration: res.timings.duration });
  }

  sleep(1); 
}