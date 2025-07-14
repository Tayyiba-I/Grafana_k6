import http from 'k6/http';
import { check, sleep } from 'k6';
import { logger } from '../../utils/logger.js'; 
export let options = {
  vus: 1,
  iterations: 1, 
};

export default function () {
  const url = 'https://reqres.in/api/login';

  
  const email = __ENV.K6_REQRES_EMAIL || 'eve.holt@reqres.in'; 
  const password = __ENV.K6_REQRES_PASSWORD || 'cityslicka'; 
  const apiKey = __ENV.K6_REQRES_API_KEY || 'reqres-free-v1'; 

  
  if (!__ENV.K6_REQRES_EMAIL || !__ENV.K6_REQRES_PASSWORD) {
      logger.warn('K6_REQRES_EMAIL or K6_REQRES_PASSWORD not set. Using default credentials (eve.holt@reqres.in).');
  }

  const payload = JSON.stringify({
    email: email,
    password: password,
  });

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  };

  logger.apiCall('POST', url, { email: email, payload: payload });

  const res = http.post(url, payload, { headers });

  
  let token;
  try {
    token = res.json('token');
  } catch (e) {
    logger.error('Failed to parse JSON response for token.', e, { responseBody: res.body });
  }

  logger.info(`Login response for ${email}: Status - ${res.status}, Body - ${res.body}`);
  logger.info(`Extracted Token for ${email}: ${token}`);

  
  const isStatus200 = res.status === 200;
  logger.checkResult(`Login for ${email} - status is 200`, isStatus200, { status: res.status });

  const isTokenPresent = token !== undefined && token !== null;
  logger.checkResult(`Login for ${email} - token is present`, isTokenPresent, { token: token });

  if (isStatus200 && isTokenPresent) {
    logger.info(`Login successful for user ${email}.`);
  } else {
    logger.error(`Login failed for user ${email}. Status: ${res.status}, Response: ${res.body}`);
  }

  sleep(1); 
}