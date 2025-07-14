import http from 'k6/http';
import { check, sleep } from 'k6';
import { logger } from '../../utils/logger.js';

export default function () {
  const url = 'https://jsonplaceholder.typicode.com/posts';

  
  logger.apiCall('GET', url);

  const res = http.get(url);

  
  logger.info(`Response Status: ${res.status}`);
  logger.info(`Content-Type header: ${res.headers['Content-Type']}`);

  // Prepare a flag for overall success for the final log message
  let allChecksPassed = true;


  const isStatus200 = res.status === 200;
  logger.checkResult('Status is 200', isStatus200, { status: res.status });
  if (!isStatus200) allChecksPassed = false;

  let isResponseJSON = false;
  try {
    res.json(); 
    isResponseJSON = true;
    logger.checkResult('Response is JSON', isResponseJSON);
  } catch (e) {
    
    logger.error(`Failed to parse JSON: ${e}`, { responseBody: res.body });
    logger.checkResult('Response is JSON', false, { error: e.message });
    allChecksPassed = false;
  }


  if (isResponseJSON) {
    const jsonBody = res.json(); 

    const containsAtLeastOnePost = jsonBody.length > 0;
    logger.checkResult('Contains at least one post', containsAtLeastOnePost, { arrayLength: jsonBody.length });
    if (!containsAtLeastOnePost) allChecksPassed = false;

    const firstPostHasTitle = jsonBody.length > 0 && jsonBody[0].title !== undefined;
    logger.checkResult('First post has a title', firstPostHasTitle, { firstPostTitle: jsonBody.length > 0 ? jsonBody[0].title : 'N/A' });
    if (!firstPostHasTitle) allChecksPassed = false;
  } else {
    
      logger.checkResult('Contains at least one post', false, { reason: 'JSON parsing failed' });
      logger.checkResult('First post has a title', false, { reason: 'JSON parsing failed' });
      allChecksPassed = false;
  }

  
  if (allChecksPassed) {
    logger.info('GET request successful and all checks passed.');
  } else {
    logger.error('GET request failed one or more checks.', { status: res.status, url: url, bodyPreview: res.body.substring(0, Math.min(res.body.length, 100)) });
  }

  sleep(1);
}