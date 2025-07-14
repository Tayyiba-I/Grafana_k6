import http from 'k6/http';
import { check, sleep } from 'k6';

export default function () {
  const baseUrl = 'https://reqres.in/api';
  const apiKey = 'reqres-free-v1'; 

  // --- 1. Login Request ---
  const loginUrl = `${baseUrl}/login`;
  const loginPayload = JSON.stringify({
    email: 'eve.holt@reqres.in',
    password: 'cityslicka',
  });
  const commonHeaders = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey, 
  };

  const loginRes = http.post(loginUrl, loginPayload, { headers: commonHeaders });

  // Login checks
  check(loginRes, {
    'Login - status is 200': (r) => r.status === 200,
    'Login - token is present': (r) => r.json('token') !== undefined,
  });

  if (loginRes.status === 200) {
    const authToken = loginRes.json('token');
    console.log(`Auth Token: ${authToken}`);

    sleep(1);

    
    const listUsersUrl = `${baseUrl}/users?page=2`; 

    const listUsersRes = http.get(listUsersUrl, { headers: commonHeaders });


    check(listUsersRes, {
      'List Users - status is 200': (r) => r.status === 200,
      'List Users - data array is not empty': (r) => r.json('data') && r.json('data').length > 0,
    });

    console.log('👥 Users data:', JSON.stringify(listUsersRes.json('data')));

    sleep(1); 
  } else {

    console.error(`Login failed with status ${loginRes.status}: ${loginRes.body}`);
  }
}