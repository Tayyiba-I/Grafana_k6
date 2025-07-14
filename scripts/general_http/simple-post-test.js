import http from 'k6/http';
import { check } from 'k6';
import { logger } from '../../utils/logger.js'; 
export default function () {
  const url = 'https://jsonplaceholder.typicode.com/posts';

  const payload = JSON.stringify({
    title: 'Hello Tayyiba',
    body: 'This is my first POST test!',
    userId: 1,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  
  logger.apiCall('POST', url, { payload: payload, headers: params.headers });

  const res = http.post(url, payload, params);

  
  logger.info(`Response status for POST to ${url}: ${res.status}`);
  logger.info(`Response body for POST to ${url}: ${res.body}`);

  
  const isStatus201 = res.status === 201;
  logger.checkResult('Status is 201 (Created)', isStatus201, { status: res.status });

 
  let isTitlePresentInBody = false;
  try {
      isTitlePresentInBody = res.body && res.body.includes('Hello Tayyiba');
      logger.checkResult('Response body contains title "Hello Tayyiba"', isTitlePresentInBody, { bodyPreview: res.body.substring(0, Math.min(res.body.length, 50)) });
  } catch (e) {
      logger.error('Failed to parse response body or check for title.', e, { responseBody: res.body });
      logger.checkResult('Response body contains title "Hello Tayyiba"', false, { error: e.message });
  }

  
  if (isStatus201 && isTitlePresentInBody) { 
      logger.info('POST request successful and all checks passed.');
  } else {
      logger.error('POST request failed one or more checks.', { status: res.status, body: res.body });
  }
}