/*
  This module supports the 'get' command of the 'gdutil' CLI program.
  It currently can report selected data for the following metadata types,
  using the --type argument: 'report', 'rptdefn' and 'attribForm'.
*/
const ora = require('ora');
const {getObject, getReportOutput, getReportDefnOutput, getAttribFormOutput}
  = require('../src/metadata');
const {login} = require('../src/access');

module.exports = (args) => {
  const {user, pswd, wrkspc, object, type} = args;
  const spinner = ora().start();
  login(user, pswd)
  .then((res) => {
    return Promise.all(
      [res.tempToken, getObject(res.tempToken, wrkspc, object)]
    );
  })
  .then((fluid) => {
    const [tempToken, res] = fluid;
    switch (type) {
      case 'report':
        return getReportOutput(res.data, object);
      case 'rptdefn':
        return getReportDefnOutput(tempToken, wrkspc, res.data, object);
      case 'attribForm':
        return getAttribFormOutput(tempToken, wrkspc, res.data);
    }
  })
  .then((output) => {
    spinner.stop();
    console.log(output);
  })
  .catch(err => {
    spinner.stop();
    console.log('error:', err)
  });
}