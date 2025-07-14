import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { vu } from 'k6/execution';

const users = new SharedArray('users_from_csv', function () {

  const data = open('C:/Users/tayyi/OneDrive/Desktop/usere.csv'); // <--- YEH LINE CHANGE KI HAI

  return data.split('\n').slice(1)
    .map(line => {
      const parts = line.split(',');
      return { email: parts[0], password: parts[1] };
    });
});

export default function () {
  const baseUrl = 'https://reqres.in/api';
  const apiKey = 'reqres-free-v1';

  const user = users[vu.idInTest % users.length];

  const loginUrl = `${baseUrl}/login`;
  const loginPayload = JSON.stringify({
    email: user.email,
    password: user.password,
  });
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  };

  const res = http.post(loginUrl, loginPayload, { headers });

  console.log(`Login response for ${user.email}: ${res.body}`);

  check(res, {
    [`Login for ${user.email} - status is 200`]: (r) => r.status === 200,
    [`Login for ${user.email} - token is present`]: (r) => r.json('token') !== undefined,
  });

  sleep(1);
}