
import http from 'k6/http';
import { check, sleep } from 'k6';
import { logger } from '../../utils/logger.js'; 
/
export let options = {
  vus: 1,           
  iterations: 1,    
   duration: '10s', 
};

export default function () {
  
  const openWeatherApiKey = __ENV.K6_OPENWEATHER_API_KEY;

  if (!openWeatherApiKey) {
    logger.error('OpenWeatherMap API Key (K6_OPENWEATHER_API_KEY) must be set as an environment variable. Exiting VU.');
    
    check(false, { 'K6_OPENWEATHER_API_KEY environment variable is set': false });
    return; 
  }

  const cities = ['London', 'Mumbai', 'Delhi', 'Karachi', 'Lahore', 'New York', 'Tokyo', 'Sydney', 'Istanbul', 'Paris'];
  const baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

  for (const city of cities) {
    const url = `${baseUrl}?q=${city}&appid=${openWeatherApiKey}`;

    logger.apiCall('GET', url, { city: city }); // Log the API call details

    const res = http.get(url);

    // --- Pass/Fail Conditions (Checks) ---
    // 1. Check HTTP Status Code
    const isStatus200 = res.status === 200;
    logger.checkResult(`Weather for ${city}: Status is 200`, isStatus200, { status: res.status });

    // 2. Check Response Body Content (functional validation)
    let hasCorrectCityNameInResponse = false;
    let responseCityName = 'N/A';
    try {
      const jsonBody = res.json(); // Parse the JSON response
      responseCityName = jsonBody.name; // Get the city name from the response
      hasCorrectCityNameInResponse = (responseCityName && responseCityName.toLowerCase() === city.toLowerCase());
      logger.checkResult(`Weather for ${city}: Response contains correct city name`, hasCorrectCityNameInResponse, { responseCity: responseCityName });
    } catch (e) {
      logger.error(`Weather for ${city}: Failed to parse JSON response or check city name.`, e, { responseBody: res.body });
      logger.checkResult(`Weather for ${city}: Response contains correct city name`, false, { error: e.message }); 
    }

    const responseTimeUnder1s = res.timings.duration < 1000; 
    logger.checkResult(`Weather for ${city}: Response time < 1s`, responseTimeUnder1s, { duration: res.timings.duration });

    if (isStatus200 && hasCorrectCityNameInResponse && responseTimeUnder1s) {
      logger.info(`Weather for ${city}: Successfully fetched and validated.`);
    } else {
      logger.error(`Weather for ${city}: Failed one or more checks. Status: ${res.status}, Response: ${res.body}`);
    }

    sleep(1); 
  }
}