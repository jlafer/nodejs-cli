#!/usr/bin/env node
/*
  getmeta - CLI for querying and displaying GoodData report defns and other metadata
  The data returned is needed for executing the 'rptexport' script.

  The recommended usage is the following sequence of commands:
  getmeta list -u <user> -p <pswd> -w <wrkspc_id> -t reports
    to list all reports and their ID; note the ID of the report you want to run;
    it will be used in the next command
  getmeta get -u <user> -p <pswd> -w <wrkspc_id> --type report --object <obj_id>
    to get the report definitions for your report; normally you want the latest
    definition, which is normally listed first and has the highest ID number
  getmeta get -u <user> -p <pswd> -w <wrkspc_id> --type rptdefn --object <obj_id>
    to get the report definition and list of attributeDisplayForms; the latter are uses
    of attributes and you will need any of those that you wish to use in dynamic
    filters when the report is executed; for list-type filters, you will also need to
    note the attribute ID (printed at the end of each line) and use it in the next step
  getmeta get -u <user> -p <pswd> -w <wrkspc_id> --type attribForm --object <obj_id>
    (optional) to get the list of values that can be used in a 'list' filter; run this
    for each attributeDisplayForm upon which you will have a list filter; note the
    element ID(s) of any values (shown in brackets) that will be in the list of values

  Armed with the required IDs noted above, you can now create a command-line to run the
  'rptexport' script.

  NOTE: the GoodData gray pages can also get this data although not as conveniently.

  Usage: see getmeta --help
*/
const pgm = require('commander');
const {login} = require('./access');
const {getReports, getObjectTypes, getObject, getReportOutput, getReportDefnOutput,
  getAttribFormOutput, getObjIdFromUri}
  = require('./metadata');

pgm
.command('list')
.description('list objects of the designated type')
.option('-u, --user <username>', 'a user email address')
.option('-p, --pswd <password>', 'password string')
.option('-w, --wrkspc <workspace_id>', 'workspace (project) id')
.option('-t, --type <type>', 'type of listing')
.action(function (args) {
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
});
pgm
.command('get')
.description('show selected information about the requested object')
.option('-u, --user <username>', 'a user email address')
.option('-p, --pswd <password>', 'password string')
.option('-w, --wrkspc <workspace_id>', 'workspace (project) id')
.option('-o, --object <object_id>', 'object id')
.option('-t, --type <type>', 'object type')
.action(function (args) {
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
});
pgm.parse(process.argv);
