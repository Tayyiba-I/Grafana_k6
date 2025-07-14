import http from 'k6/http';
import { sleep } from 'k6';

export default function () {
  http.get('https://test.k6.io/public/crocodiles/?limit=5');
  sleep(1);
}
