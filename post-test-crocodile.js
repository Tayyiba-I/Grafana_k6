import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 1,
  duration: '5s',
};

export default function () {
  const url = 'https://test-api.k6.io/my/crocodiles/';
  const payload = JSON.stringify({
    name: 'Tayyiba Croc',
    sex: 'F',
    date_of_birth: '2010-01-01',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer 56a99595a05a07a95c67e6cbf6b88dfb9f4b21c1',
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 201 (Created)': (r) => r.status === 201,
    'response has crocodile name': (r) => r.json('name') === 'Tayyiba Croc',
  });

  console.log('Created Crocodile ID:', res.json('id'));
}
