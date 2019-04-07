const BASE_API_URL = 'https://analytics.ytica.com/';

const makeGdAxiosConfig = (tempToken) => {
  return {
    baseURL: BASE_API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cookie': tempToken
    }
  };
};

module.exports = {
  BASE_API_URL,
  makeGdAxiosConfig
};