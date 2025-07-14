
import http from 'k6/http';
import { check, sleep } from 'k6';

export default function () {
  const res = http.get('https://jsonplaceholder.typicode.com/posts'); 

  console.log(`Response Status: ${res.status}`); 
  console.log(`Content-Type header: ${res.headers['Content-Type']}`); 

  check(res, {
    ' Status is 200': (r) => r.status === 200,
    'Response is JSON': (r) => {
      try {
        r.json();
        return true;
      } catch (e) {
        console.error(`Failed to parse JSON: ${e}`);
        return false;
      }
    },
    ' Contains at least one post': (r) => r.json().length > 0, 
    'First post has a title': (r) => r.json()[0].title !== undefined, 
  });

  sleep(1);
}