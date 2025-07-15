// import http from 'k6/http';
// import { check } from 'k6';

// export let options = {
//   stages: [
//     { duration: '10s', target: 50 },
//     { duration: '10s', target: 100 },
//     { duration: '10s', target: 0 },
//   ],
// };

// export default function () {
//   const res = http.get('https://test-api.k6.io/public/crocodiles/');
//   console.log('Content-Type:', res.headers['Content-Type']); // Debug line

//   check(res, {
//     'status is 200': (r) => r.status === 200,
//     'is JSON': (r) =>
//       (r.headers['Content-Type'] || '').toLowerCase().includes('application/json'),
//   });
// }
import http from 'k6/http';
import { check, sleep } from 'k6';


export const options = {
  
  scenarios: {
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        // Ramp up to 20 VUs over 2 minutes
        { duration: '2m', target: 20 },
        // Stay at 20 VUs for 3 minutes to see sustained performance
        { duration: '3m', target: 20 },
        // Ramp up to 50 VUs over 1 minute to stress the system
        { duration: '1m', target: 50 },
        // Stay at 50 VUs for 1 minute
        { duration: '1m', target: 50 },
        // Ramp down to 0 VUs
        { duration: '1m', target: 0 },
      ],
      
      tags: { test_type: 'stress_test' }, 
      gracefulStop: '5s',
    },
  },
  
  thresholds: {
    
    http_req_failed: ['rate<0.01'], 
    http_req_duration: ['p(95)<400'],
  },
};

export default function () {
  //"Get a single post" test case 
  const url = 'https://jsonplaceholder.typicode.com/posts/1';
  const headers = { 'Accept': 'application/json' };

  const res = http.get(url, { headers: headers });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'body includes specific text': (r) => r.body.includes('sunt aut facere repellat provident occaecati excepturi optio reprehenderit'),
  });
  sleep(1);
}