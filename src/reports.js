const axios = require('axios');
const R = require('ramda');
const {makeGdAxiosConfig} = require('./cfg');

const makeFilterValueUri = R.curry((wrkspcId, attributeId, valueId) =>
  `/gdc/md/${wrkspcId}/obj/${attributeId}/elements?id=${valueId}`
);

const makeFilterFromExpr = R.curry((wrkspcId, filterExpr) => {
  const {type, filterId, attributeId, values} = filterExpr;
  if (! ['list', 'floating', 'interval'].includes(type)) {
    console.log(`ERROR: bad filter type: [${type}]`);
    return {};
  }
  const elements = values.map(makeFilterValueUri(wrkspcId, attributeId));
  const filter = {
    uri: `/gdc/md/${wrkspcId}/obj/${filterId}`,
    constraint: {
      type: type
    }
  };
  if (type === 'list')
    filter.constraint.elements = elements;
  else {
    const [from, to] = values;
    filter.constraint.from = from;
    filter.constraint.to = to;
  }
  return filter;
});

const exportReport = (tempToken, wrkspcId, objectId, filterExprs) => {
  const gdAxiosConfig = makeGdAxiosConfig(tempToken);
  const url = `gdc/app/projects/${wrkspcId}/execute/raw/`;
  const filters = (filterExprs)
    ? filterExprs.map(makeFilterFromExpr(wrkspcId))
    : [];
  const data = {
    report_req: {
      report: `/gdc/md/${wrkspcId}/obj/${objectId}`,
      context: {
        filters: filters
      }
    }
  };

  return axios({
    ...gdAxiosConfig,
    url,
    method: 'post',
    data: data
  })
  .then(res => {
    //console.log(`/report uri response:`, res.data);
    // strip leading slash for use with baseURL
    const uri = res.data.uri.substring(1);
    return axios({
      ...gdAxiosConfig,
      url: uri
    })
  })
  .then(res => res.data);
};

const getReport = (tempToken, wrkspcId, objectId) => {
  const gdAxiosConfig = makeGdAxiosConfig(tempToken);
  const url = `gdc/md/${wrkspcId}/obj/${objectId}`;
  return axios({...gdAxiosConfig, url})
};

module.exports = {
  exportReport,
  getReport
}