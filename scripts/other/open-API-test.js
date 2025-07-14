import http from 'k6/http';
import { check, sleep } from 'k6'; // Import 'check'
import { logger } from '../../utils/logger.js'; // Import your logger utility

// Define test options
export let options = {
  vus: 1,           // Use 1 Virtual User for functional testing
  iterations: 1,    // Run the entire sequence (GET, POST, PUT) once
  // duration: '10s', // Alternatively, you could use duration to loop this sequence
};

export default function () {
  const baseUrl = 'https://jsonplaceholder.typicode.com/posts';
  const headers = { 'Content-Type': 'application/json' };

  // --- GET Request Test Case ---
  const getUrl = `${baseUrl}/1`; // Get a specific post
  logger.apiCall('GET', getUrl);
  let getResponse = http.get(getUrl);

  logger.info(`GET Status for ${getUrl}: ${getResponse.status}`);
  logger.info(`GET Body for ${getUrl}: ${getResponse.body}`);

  let getChecksPassed = true;
  const isGetStatus200 = getResponse.status === 200;
  logger.checkResult(`GET ${getUrl}: Status is 200`, isGetStatus200, { status: getResponse.status });
  if (!isGetStatus200) getChecksPassed = false;

  let isGetBodyJSON = false;
  let getResponseBody = {};
  try {
    getResponseBody = getResponse.json();
    isGetBodyJSON = true;
    logger.checkResult(`GET ${getUrl}: Response is JSON`, isGetBodyJSON);
  } catch (e) {
    logger.error(`GET ${getUrl}: Failed to parse JSON response.`, e, { responseBody: getResponse.body });
    logger.checkResult(`GET ${getUrl}: Response is JSON`, false, { error: e.message });
    getChecksPassed = false;
  }

  if (isGetBodyJSON) {
    const getHasId = getResponseBody.id !== undefined;
    logger.checkResult(`GET ${getUrl}: Response has 'id'`, getHasId, { id: getResponseBody.id });
    if (!getHasId) getChecksPassed = false;

    const getHasTitle = getResponseBody.title !== undefined;
    logger.checkResult(`GET ${getUrl}: Response has 'title'`, getHasTitle, { title: getResponseBody.title });
    if (!getHasTitle) getChecksPassed = false;
  } else {
    logger.checkResult(`GET ${getUrl}: Response has 'id'`, false, { reason: 'JSON parsing failed' });
    logger.checkResult(`GET ${getUrl}: Response has 'title'`, false, { reason: 'JSON parsing failed' });
    getChecksPassed = false;
  }

  if (getChecksPassed) {
    logger.info(`GET ${getUrl}: All checks passed successfully.`);
  } else {
    logger.error(`GET ${getUrl}: Failed one or more checks.`, { status: getResponse.status, bodyPreview: getResponse.body.substring(0, Math.min(getResponse.body.length, 100)) });
  }
  sleep(1);

  // --- POST Request Test Case ---
  let payloadPost = JSON.stringify({
    title: 'New Post by k6',
    body: 'This is a test post created by a k6 script.',
    userId: 1
  });
  logger.apiCall('POST', baseUrl, { payload: payloadPost });
  let postResponse = http.post(baseUrl, payloadPost, { headers: headers });

  logger.info(`POST Status for ${baseUrl}: ${postResponse.status}`);
  logger.info(`POST Body for ${baseUrl}: ${postResponse.body}`);

  let postChecksPassed = true;
  const isPostStatus201 = postResponse.status === 201;
  logger.checkResult(`POST ${baseUrl}: Status is 201 (Created)`, isPostStatus201, { status: postResponse.status });
  if (!isPostStatus201) postChecksPassed = false;

  let isPostBodyJSON = false;
  let postResponseBody = {};
  try {
    postResponseBody = postResponse.json();
    isPostBodyJSON = true;
    logger.checkResult(`POST ${baseUrl}: Response is JSON`, isPostBodyJSON);
  } catch (e) {
    logger.error(`POST ${baseUrl}: Failed to parse JSON response.`, e, { responseBody: postResponse.body });
    logger.checkResult(`POST ${baseUrl}: Response is JSON`, false, { error: e.message });
    postChecksPassed = false;
  }

  if (isPostBodyJSON) {
    const postHasId = postResponseBody.id !== undefined;
    logger.checkResult(`POST ${baseUrl}: Response has new 'id'`, postHasId, { id: postResponseBody.id });
    if (!postHasId) postChecksPassed = false;

    const postTitleMatches = postResponseBody.title === 'New Post by k6';
    logger.checkResult(`POST ${baseUrl}: Response title matches sent title`, postTitleMatches, { responseTitle: postResponseBody.title });
    if (!postTitleMatches) postChecksPassed = false;
  } else {
    logger.checkResult(`POST ${baseUrl}: Response has new 'id'`, false, { reason: 'JSON parsing failed' });
    logger.checkResult(`POST ${baseUrl}: Response title matches sent title`, false, { reason: 'JSON parsing failed' });
    postChecksPassed = false;
  }

  if (postChecksPassed) {
    logger.info(`POST ${baseUrl}: All checks passed successfully.`);
  } else {
    logger.error(`POST ${baseUrl}: Failed one or more checks.`, { status: postResponse.status, bodyPreview: postResponse.body.substring(0, Math.min(postResponse.body.length, 100)) });
  }
  sleep(1);

  // --- PUT Request Test Case ---
  const putUrl = `${baseUrl}/1`; // Update an existing post
  let payloadPut = JSON.stringify({
    id: 1, // Important for PUT to specify the ID being updated
    title: 'Updated Post Title',
    body: 'This post has been updated by k6.',
    userId: 1
  });
  logger.apiCall('PUT', putUrl, { payload: payloadPut });
  let putResponse = http.put(putUrl, payloadPut, { headers: headers });

  logger.info(`PUT Status for ${putUrl}: ${putResponse.status}`);
  logger.info(`PUT Body for ${putUrl}: ${putResponse.body}`);

  let putChecksPassed = true;
  const isPutStatus200 = putResponse.status === 200;
  logger.checkResult(`PUT ${putUrl}: Status is 200`, isPutStatus200, { status: putResponse.status });
  if (!isPutStatus200) putChecksPassed = false;

  let isPutBodyJSON = false;
  let putResponseBody = {};
  try {
    putResponseBody = putResponse.json();
    isPutBodyJSON = true;
    logger.checkResult(`PUT ${putUrl}: Response is JSON`, isPutBodyJSON);
  } catch (e) {
    logger.error(`PUT ${putUrl}: Failed to parse JSON response.`, e, { responseBody: putResponse.body });
    logger.checkResult(`PUT ${putUrl}: Response is JSON`, false, { error: e.message });
    putChecksPassed = false;
  }

  if (isPutBodyJSON) {
    const putTitleMatches = putResponseBody.title === 'Updated Post Title';
    logger.checkResult(`PUT ${putUrl}: Response title matches updated title`, putTitleMatches, { responseTitle: putResponseBody.title });
    if (!putTitleMatches) putChecksPassed = false;

    const putBodyMatches = putResponseBody.body === 'This post has been updated by k6.';
    logger.checkResult(`PUT ${putUrl}: Response body matches updated body`, putBodyMatches, { responseBody: putResponseBody.body });
    if (!putBodyMatches) putChecksPassed = false;
  } else {
    logger.checkResult(`PUT ${putUrl}: Response title matches updated title`, false, { reason: 'JSON parsing failed' });
    logger.checkResult(`PUT ${putUrl}: Response body matches updated body`, false, { reason: 'JSON parsing failed' });
    putChecksPassed = false;
  }

  if (putChecksPassed) {
    logger.info(`PUT ${putUrl}: All checks passed successfully.`);
  } else {
    logger.error(`PUT ${putUrl}: Failed one or more checks.`, { status: putResponse.status, bodyPreview: putResponse.body.substring(0, Math.min(putResponse.body.length, 100)) });
  }
  sleep(1);
}