const {getReports, getObjectTypes, getObjIdFromUri}
  = require('../src/metadata');
const {login} = require('../src/access');

module.exports = (args) => {
  const {user, pswd, wrkspc, type} = args;
  login(user, pswd)
  .then((res) => {
    if (type === 'reports')
      return getReports(res.tempToken, wrkspc);
    else if (type === 'types')
      return getObjectTypes(res.tempToken, wrkspc);
  })
  .then((res) => {
    console.log(`listing for: ${type}`);
    if (type === 'reports')
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
  .catch(err => console.log('error:', err));
};
