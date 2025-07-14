
import http from 'k6/http';
import { check, sleep } from 'k6';
import { logger } from '../../utils/logger.js'; 

export let options = {
  vus: 1,         // Number of virtual users
  duration: '5s',
};

export default function () {
  const url = 'https://jsonplaceholder.typicode.com/posts';

  const payload = JSON.stringify({
    title: 'My K6 Test Post Title',
    body: 'This is the body content for my K6 test post.',
    userId: 5, 
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      // JSONPlaceholder does not require authentication for POST /posts
    },
  };

  logger.apiCall('POST', url, { payload: payload }); 

  const res = http.post(url, payload, params);

  // Check if the request was successful (status 201 Created)
  const isStatus201 = res.status === 201;
  logger.checkResult('Status is 201 (Created)', isStatus201, { status: res.status });

  // Check if the response body contains the title we sent
  const responseTitle = res.json('title');
  const hasCorrectTitle = responseTitle === 'My K6 Test Post Title';
  logger.checkResult('Response has correct title', hasCorrectTitle, { responseTitle: responseTitle });

  // Check if a new ID was assigned
  const postId = res.json('id');
  const hasPostId = postId !== undefined && postId !== null;
  logger.checkResult('Response has a new post ID', hasPostId, { id: postId });

  // Log overall success or failure
  if (isStatus201 && hasCorrectTitle && hasPostId) {
    logger.info(`Successfully created post. ID: ${postId}, Title: ${responseTitle}`, { response: res.body });
  } else {
    logger.error(`Failed to create post. Status: ${res.status}, Response: ${res.body}`);
  }

  sleep(1); 
}