const pgm = require('commander');

module.exports = () => {

  pgm
  .version('0.0.1');

  pgm
  .command('list')
  .description('list metadata objects of the designated type')
  .option('-u, --user <username>', 'a user email address')
  .option('-p, --pswd <password>', 'password string')
  .option('-w, --wrkspc <workspace_id>', 'workspace (project) id')
  .option('-t, --type <type>', 'type of listing')
  .action(function (args) {
    require('./cmds/listmeta')(args);
  });

  pgm
  .command('get')
  .description('show selected data about the requested metadata object')
  .option('-u, --user <username>', 'a user email address')
  .option('-p, --pswd <password>', 'password string')
  .option('-w, --wrkspc <workspace_id>', 'workspace (project) id')
  .option('-o, --object <object_id>', 'object id')
  .option('-t, --type <type>', 'object type')
  .action(function (args) {
    require('./cmds/getmeta')(args);
  });

  pgm
  .command('report')
  .description('execute and export the data for a report')
  .option('-u, --user <username>', 'a user email address')
  .option('-p, --pswd <password>', 'password string')
  .option('-w, --wrkspc <workspace_id>', 'workspace (project) id')
  .option('-o, --obj <object_id>', 'report object_id')
  .option('-f, --filters [filters]', 'filters array JSON')
  .action(function (args) {
    require('./cmds/report')(args);
  });

  pgm.parse(process.argv);
}
 