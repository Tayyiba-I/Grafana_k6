import http from 'k6/http';
import { check, sleep } from 'k6';
import { logger } from '../../utils/logger.js';

export default function () {
  
  const geminiApiKey = __ENV.K6_GEMINI_API_KEY;

  if (!geminiApiKey) {
    logger.error('Gemini API Key (K6_GEMINI_API_KEY) must be set as an environment variable. Exiting VU.');
    
    check(false, { 'K6_GEMINI_API_KEY environment variable is set': false });
    return;
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`;

  const headers = {
    'Content-Type': 'application/json',
  };

  const requestBody = JSON.stringify({
    contents: [{
      parts: [{
        text: 'Tell me a short, interesting fact about the universe.'
      }]
    }]
  });

  
  logger.apiCall('POST', geminiUrl, { requestBody: requestBody });

  const res = http.post(geminiUrl, requestBody, { headers: headers });

  
  logger.info(`Gemini API Response Status: ${res.status}`);
  logger.info(`Gemini API Response Body: ${res.body}`);

  
  const isStatus200 = res.status === 200;
  logger.checkResult('Gemini API status is 200', isStatus200, { status: res.status });

  let containsCandidates = false;
  try {
    const jsonBody = JSON.parse(res.body);
    containsCandidates = jsonBody.candidates && jsonBody.candidates.length > 0;
    logger.checkResult('Gemini API response contains candidates', containsCandidates, { candidatesCount: jsonBody.candidates ? jsonBody.candidates.length : 0 });
  } catch (e) {
    logger.error('Failed to parse Gemini API response body or check candidates:', e, { responseBody: res.body });
    logger.checkResult('Gemini API response contains candidates', false, { error: e.message }); // Explicitly fail this check
  }

  const responseTimeUnder2s = res.timings.duration < 2000;
  logger.checkResult('Gemini API response time < 2s', responseTimeUnder2s, { duration: res.timings.duration }); 

  
  if (isStatus200 && containsCandidates && responseTimeUnder2s) {
      logger.info('Gemini API call successful and met all checks.');
  } else {
      logger.error('Gemini API call failed one or more checks.', { status: res.status, body: res.body, duration: res.timings.duration });
  }


  sleep(1);
}