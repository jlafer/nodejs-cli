const {getObject, getReportOutput, getReportDefnOutput, getAttribFormOutput}
  = require('../src/metadata');
const {login} = require('../src/access');

module.exports = (args) => {
  const {user, pswd, wrkspc, object, type} = args;
  login(user, pswd)
  .then((res) => {
    return Promise.all(
      [res.tempToken, getObject(res.tempToken, wrkspc, object)]
    );
  })
  .then((fluid) => {
    //console.log(`fluid:`, fluid);
    const [tempToken, res] = fluid;
    //console.log(`object:`, res.data);
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
    console.log(output);
  })
  .catch(err => console.log('error:', err));
}