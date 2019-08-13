/*
  This module defines the command(s) supported by the CLI program.
  It shows how arguments are defined, using the 'commander' package.
*/
const pgm = require('commander');

module.exports = () => {

  pgm
  .version('0.0.1');

  // define a command for the CLI and the arguments it supports
  pgm
  .command('cmd1')
  .description('cmd1 is a cool command')
  .option('-u, --user <username>', 'a user email address')
  .option('-p, --pswd <password>', 'password string')
  .option('-a, --anarg <arg>', 'an argument value')
  .action(function (args) {
    require('./cmds/cmd1')(args);
  });

  // parse the command line and pass arguments into the correct "action" function
  pgm.parse(process.argv);
}
 