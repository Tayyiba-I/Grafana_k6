
import http from 'k6/http';
import { sleep } from 'k6';

export default function () {
    const headers = { 'Content-Type': 'application/json' };

    let getResponse = http.get('https://jsonplaceholder.typicode.com/posts/1');
    console.log('GET Status:', getResponse.status);
    console.log('GET Body:', getResponse.body);
    sleep(1);

    let payloadPost = JSON.stringify({
        title: 'foo',
        body: 'bar',
        userId: 1
    });
    let postResponse = http.post('https://jsonplaceholder.typicode.com/posts', payloadPost, { headers: headers });
    console.log('POST Status:', postResponse.status);
    console.log('POST Body:', postResponse.body);
    sleep(1);

    let payloadPut = JSON.stringify({
        id: 1,
        title: 'foo updated',
        body: 'bar updated',
        userId: 1
    });
    let putResponse = http.put('https://jsonplaceholder.typicode.com/posts/1', payloadPut, { headers: headers });
    console.log('PUT Status:', putResponse.status);
    console.log('PUT Body:', putResponse.body);
    sleep(1);
}
