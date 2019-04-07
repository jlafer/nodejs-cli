#!/usr/bin/env node
/*
  rptexport - CLI for exporting a report
  The resulting file is stored in the /tmp folder.

  All of the command-line arguments are straightforward, with the exception of the
  --filters (-f) argument. It takes a JSON object with the following format:
    '[{"type":"list","filterId":<id>,"attributeId":<id>,"values":[<id>,...]}]'

  The parameter is an array of filters. Each filter has the following properties:
  "type" is one of: "list", "floating", or "interval".
  "filterId" is the attributeDisplyForm ID obtained with getmeta.
  "attributeId" is the attribute ID obtained with getmeta; only used with type=list
  "values" is an array of values or element IDs when type=list; for the other filter
    types, use nominal values. Normal JSON rules apply.
    
  A "list" filter on three color-codes might look like this:
    {"type":"list","filterId":<id>,"attributeId":<id>,"values":["red","blu","wht"]}

  An "interval" filter on two dates might look like this:
    {"type":"interval","filterId":<id>,"values":["2019-04-01","2019-04-30"]}

  A "floating" filter on the last 7 days would look like this:
    {"type":"floating","filterId":<id>,"values":[-7,0]}

  For other date filter formats, consult the GoodData help pages on filtering.

  Usage: see rptexport --help
*/
const pgm = require('commander');
const {login} = require('./access');
const {exportReport} = require('./reports');
const {writeToTextFile} = require('jlafer-node-util');

pgm
  .version('0.0.1');
pgm
  .command('export')
  .description('login to wfo api and export data')
  .option('-u, --user <username>', 'a user email address')
  .option('-p, --pswd <password>', 'password string')
  .option('-w, --wrkspc <workspace_id>', 'workspace (project) id')
  .option('-o, --obj <object_id>', 'report object_id')
  .option('-f, --filters [filters]', 'filters array JSON')
  .action(function (args) {
    const filterExprs = (args.filters) ? JSON.parse(args.filters) : null;
    const path = `/tmp/${args.wrkspc}_${args.obj}.csv`;
    login(args.user, args.pswd)
    .then((res) => {
      return exportReport(res.tempToken, args.wrkspc, args.obj, filterExprs);
    })
    .then((res) => {
      writeToTextFile(path, res.data);
    })
    .then(() => {
      console.log(`report file written to ${path}`)
    })
    .catch(err => console.log('CAUGHT ERROR:', err));
  });
pgm.parse(process.argv);
