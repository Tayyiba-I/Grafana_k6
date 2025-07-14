import http from 'k6/http';
import { check } from 'k6';

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

  const res = http.post(url, payload, params);

  console.log('Response code:', res.status);
  console.log('Response body:', res.body);

  check(res, {
    'status is 201 (Created)': (r) => r.status === 201,
  });
}
