const pgm = require('commander');

module.exports = () => {

  pgm
  .version('0.0.1');

  pgm
  .command('cmd1')
  .description('cmd1 is a cool command')
  .option('-u, --user <username>', 'a user email address')
  .option('-p, --pswd <password>', 'password string')
  .option('-a, --anarg <arg>', 'an argument value')
  .action(function (args) {
    require('./cmds/cmd1')(args);
  });

  pgm.parse(process.argv);
}
 