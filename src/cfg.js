// This is where configuration work can be placed.

// Many CLIs need to call an API, so we use axios.
// We define a function that sets up a base axios configuration with base API URL.
const YOUR_BASE_URL = 'https://your.api.baseUrl/';
const makeAxiosConfig = (tempToken) => {
  return {
    baseURL: YOUR_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cookie': tempToken
    }
  };
};

module.exports = {
  YOUR_BASE_URL,
  makeAxiosConfig
};