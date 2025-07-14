import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '10s', target: 50 },
    { duration: '10s', target: 100 },
    { duration: '10s', target: 0 },
  ],
};

export default function () {
  const res = http.get('https://test-api.k6.io/public/crocodiles/');
  console.log('Content-Type:', res.headers['Content-Type']); // Debug line

  check(res, {
    'status is 200': (r) => r.status === 200,
    'is JSON': (r) =>
      (r.headers['Content-Type'] || '').toLowerCase().includes('application/json'),
  });
}
