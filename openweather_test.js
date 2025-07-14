
// import http from 'k6/http';
// import { sleep } from 'k6';

// export default function () {
//     // GET weather for London
//     http.get('https://api.openweathermap.org/data/2.5/weather?q=London&appid=aff7c3f7f12d0036293e3a95179930f1');

//     // GET weather for Mumbai
//     http.get('https://api.openweathermap.org/data/2.5/weather?q=Mumbai&appid=aff7c3f7f12d0036293e3a95179930f1');

//     // GET weather for Delhi
//     http.get('https://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=aff7c3f7f12d0036293e3a95179930f1');

//     sleep(1);
// }

import http from 'k6/http';
import { sleep } from 'k6';

const API_KEY = 'aff7c3f7f12d0036293e3a95179930f1';
const cities = ['London', 'Mumbai', 'Delhi', 'Karachi', 'Lahore', 'New York', 'Tokyo', 'Sydney', 'Istanbul', 'Paris'];

export default function () {
  for (const city of cities) {
    const res = http.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`);
    console.log(`Weather fetched for ${city}: Status ${res.status}`);
  }

  sleep(1); // Wait for 1 second between iterations
}
