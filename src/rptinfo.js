#!/usr/bin/env node
/*
  rptinfo - CLI for displaying object IDs used by rptexport

  Usage: see rptinfo --help
*/
const pgm = require('commander');
const {login} = require('./access');
const {getReport} = require('./report');

pgm
  .version('0.0.1');
pgm
  .command('list')
  .description('login to wfo api and get report info')
  .option('-u, --user <username>', 'a user email address')
  .option('-p, --pswd <password>', 'password string')
  .option('-w, --wrkspc <workspace_id>', 'workspace (project) id')
  .option('-o, --obj <object_id>', 'report object_id')
  .action(function (args) {
    login(args.user, args.pswd)
    .then((res) => {
      return getReport(res.tempToken, args.wrkspc, args.obj);
    })
    .then((res) => {
      console.log('report info:');
      console.log(res.data);
    })
    .catch(err => console.log('error:', err));
  });
pgm.parse(process.argv);
