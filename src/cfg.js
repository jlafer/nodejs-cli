const BASE_GD_URL = 'https://analytics.ytica.com/';

const makeGdAxiosConfig = (tempToken) => {
  return {
    baseURL: BASE_GD_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cookie': tempToken
    }
  };
};

module.exports = {
  BASE_GD_URL,
  makeGdAxiosConfig
};