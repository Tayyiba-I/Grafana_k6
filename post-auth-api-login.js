import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const url = 'https://reqres.in/api/login';
  const payload = JSON.stringify({
    email: 'eve.holt@reqres.in',
    password: 'cityslicka',
  });

  const headers = {
    'Content-Type': 'application/json',

    'x-api-key': 'reqres-free-v1', 
  };

  const res = http.post(url, payload, { headers });

  console.log(' Login response body:', res.body);

  const token = res.json('token');
  console.log(' Token:', token);

  check(res, {
    'login status is 200': (r) => r.status === 200,
    'token is present': () => token !== undefined,
  });
}