import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 1,
  iterations: 1,
};

export default function () {
  const url = 'https://jsonplaceholder.typicode.com/posts';

  const payload = JSON.stringify({
    title: 'Hello',
    body: 'This is Tayyiba testing k6',
    userId: 1,
  });

  const headers = {
    'Content-Type': 'application/json',
  };

  const res = http.post(url, payload, { headers });

  check(res, {
    'status is 201': (r) => r.status === 201,
    'body contains title': (r) => r.body.includes('Hello'),
  });

  console.log('Response:', res.body);
}
