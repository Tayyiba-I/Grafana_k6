import http from 'k6/http';
import { check, sleep } from 'k6';

export default function () {
  
  const geminiApiKey = 'AIzaSyCSzomv0DWcUw9dbf5iLdC7F9uB0ucn3yE'; 
  
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`;

  const headers = {
    'Content-Type': 'application/json',
  };

  const requestBody = JSON.stringify({
    contents: [{
      parts: [{
        text: 'Tell me a short, interesting fact about the universe.'
      }]
    }]
  });

  
  const res = http.post(geminiUrl, requestBody, { headers: headers });


  console.log(' Gemini API Response Status:', res.status);
  console.log('Gemini API Response Body:', res.body);

  check(res, {
    'Gemini API status is 200': (r) => r.status === 200,
    'Gemini API response contains candidates': (r) => {
      try {
        const jsonBody = JSON.parse(r.body);
        return jsonBody.candidates && jsonBody.candidates.length > 0;
      } catch (e) {
        console.error('Failed to parse Gemini API response body:', e);
        return false;
      }
    },
    'Gemini API response time < 2s': (r) => r.timings.duration < 2000, // Example SLA
  });

  sleep(1);
}