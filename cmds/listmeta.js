/*
  This module supports the 'list' command of the 'gdutil' CLI program.
  It currently supports the listing of the following metadata types,
  using the --type argument: 'dataSet', 'report' and 'type'.
*/
const ora = require('ora');
const {getDatasets, getDimensions, getReports, getObjectTypes, getObjIdFromUri}
  = require('../src/metadata');
const error = require('../src/error');
const {login} = require('../src/access');

const validTypes = [
  'dataSet', 'dimension', 'report', 'type'
];

module.exports = (args) => {
  const {user, pswd, wrkspc, type} = args;
  if (! validTypes.includes(type)) {
    error(`ERROR: invalid type -${type}- supplied; must be one of: ${validTypes}`);
    return;
  }
  const spinner = ora().start();
  login(user, pswd)
  .then((res) => {
    if (type === 'report')
      return getReports(res.tempToken, wrkspc);
    else if (type === 'dataSet')
      return getDatasets(res.tempToken, wrkspc);
    else if (type === 'dimension')
      return getDimensions(res.tempToken, wrkspc);
    else if (type === 'type')
      return getObjectTypes(res.tempToken, wrkspc);
  })
  .then((res) => {
    spinner.stop();
    console.log(`listing for: ${type}`);
    if (['dataSet', 'dimension', 'report'].includes(type) )
      res.data.query.entries.forEach(entry => {
        const objId = getObjIdFromUri(entry.link);
        console.log(`${objId} ${entry.title}`);
      })
    else
      res.data.about.links.forEach(entry => {
        console.log(entry.title);
        console.log(`  ${entry.link}`);
      })
  })
  .catch(err => {
    spinner.stop();
    error(`${err}`);
  });
};
