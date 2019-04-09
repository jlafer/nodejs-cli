/*
  This module supports the 'list' command of the 'gdutil' CLI program.
  It currently supports the listing of the following metadata types,
  using the --type argument: 'datasets', 'reports' and 'types'.
*/
const ora = require('ora');
const {getDatasets, getReports, getObjectTypes, getObjIdFromUri}
  = require('../src/metadata');
const {login} = require('../src/access');

module.exports = (args) => {
  const {user, pswd, wrkspc, type} = args;
  const spinner = ora().start();
  login(user, pswd)
  .then((res) => {
    if (type === 'reports')
      return getReports(res.tempToken, wrkspc);
    else if (type === 'datasets')
      return getDatasets(res.tempToken, wrkspc);
    else if (type === 'types')
      return getObjectTypes(res.tempToken, wrkspc);
  })
  .then((res) => {
    spinner.stop();
    console.log(`listing for: ${type}`);
    if (['datasets', 'reports'].includes(type) )
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
    console.log('error:', err)
  });
};
