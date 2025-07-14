
import http from 'k6/http';
import { check, sleep } from 'k6';
import { vu } from 'k6/execution';
import { logger } from '../../utils/logger.js'; // Logger ko import kiya gaya hai

// Original purpose of 'users' SharedArray:
// This SharedArray was used to load multiple user credentials (email, password)
// from a CSV file (data/users/usere.csv) into memory once at the start of the test.
// It allowed different Virtual Users (VUs) to pick different credentials for
// data-driven testing scenarios, preventing all VUs from using the same hardcoded user.
// However, for security, especially with sensitive data like user credentials,
// storing them directly in a file that might be version-controlled is not recommended.

// For enhanced security,  single user's credentials
// directly from environment variables are used. This approach is safer as environment variables
// are typically not committed to source control.


/*
// Original SharedArray for reading users from CSV (now commented out for security)
const users = new SharedArray('users_from_csv', function () {
  const data = open('../../data/users/usere.csv');

  return data.split('\n').slice(1)
    .map(line => {
      if (line.trim() === '') {
        logger.warn('Skipping empty CSV line.');
        return null;
      }
      const parts = line.split(',');
      if (parts.length < 2) {
        logger.warn(`Skipping malformed CSV line: "${line}"`, { lineContent: line });
        return null;
      }
      return { email: parts[0].trim(), password: parts[1].trim() };
    })
    .filter(user => user !== null);
});
*/

export default function () {
  const baseUrl = 'https://reqres.in/api';
  const apiKey = 'reqres-free-v1';
  const userEmail = __ENV.K6_EMAIL;
  const userPassword = __ENV.K6_PASSWORD;

  
  if (!userEmail || !userPassword) {
    logger.error('User credentials (K6_EMAIL and K6_PASSWORD) must be set as environment variables. Exiting VU.');
    
    check(false, { 'K6_EMAIL and K6_PASSWORD environment variables are set': false });
    return; 
  }

  
  const user = {
      email: userEmail,
      password: userPassword
  };

  logger.info(`VU ${vu.idInTest} - Processing user from ENV: ${user.email}`); // New log to indicate which user is being processed

  const loginUrl = `${baseUrl}/login`;
  const loginPayload = JSON.stringify({
    email: user.email,
    password: user.password,
  });
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  };

  logger.debug(`Sending login request for ${user.email} to ${loginUrl}`, { payload: loginPayload }); // Detailed debug log

  const res = http.post(loginUrl, loginPayload, { headers });

  logger.info(`Login response for ${user.email}: Status - ${res.status}, Body - ${res.body}`); // console.log replaced with logger.info

  // Checks for the login response
  const isStatus200 = res.status === 200;
  const isTokenPresent = res.json('token') !== undefined;

  // Using logger.checkResult 
  logger.checkResult(`Login for ${user.email} - status is 200`, isStatus200, { status: res.status });
  logger.checkResult(`Login for ${user.email} - token is present`, isTokenPresent, { token: res.json('token') });

  if (!isStatus200 || !isTokenPresent) {
      logger.error(`Login failed for user ${user.email}. Status: ${res.status}, Response: ${res.body}`);
  } else {
      logger.info(`Login successful for user ${user.email}.`);
  }

  sleep(1);
}