const axios = require('axios');
const {BASE_API_URL} = require('./cfg');

const login = (username, password) => {
  const gdAxiosConfig = {
    baseURL: BASE_API_URL
  };
  const gdData = {
    "postUserLogin": {
      "login": username,
      "password": password
    }
  };
  return axios({
    ...gdAxiosConfig,
    url: `gdc/account/login`,
    method: 'post',
    headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
    data: gdData
  })
  .then(res => {
    const cookies = res.headers['set-cookie'];
    //console.log(`/login response set-cookie: ${cookies}`);
    const sstCookie = cookies
      .find(cookie => cookie.split('=')[0] === 'GDCAuthSST');
    return axios({
      ...gdAxiosConfig,
      url: `gdc/account/token`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cookie': sstCookie
      }
    })
  })
  .then(res => {
    const cookie = res.headers['set-cookie'][0];
    //console.log(`/token response cookie: ${cookie}`);
    return {tempToken: cookie}
  })
};

module.exports = {
  login
};