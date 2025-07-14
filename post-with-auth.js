import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const url = 'https://jsonplaceholder.typicode.com/posts';

  
  const payload = JSON.stringify({
    title: 'Secured POST',
    body: 'Learning POST with Bearer Token!',
    userId: 2,
  });

  
  const token = '1234567890abcdef'; 
  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  const res = http.post(url, payload, params);

  console.log('Response code:', res.status);
  console.log('Response body:', res.body);

  check(res, {
    'status is 201': (r) => r.status === 201,
    'title is correct': (r) => r.body.includes('Secured POST'),
  });
}
