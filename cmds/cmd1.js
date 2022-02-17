/*
  This module provides the 'cmd1' command of the 'nodejs-cli' CLI program.
  Like many CLIs, it takes a user and password plus other arguments.
  It writes data to the filesystem.
  The (possibly long-running) work is done while a spinner is shown to the user.
*/
const {writeToTextFile} = require('jlafer-node-util');
const error = require('../src/error');
const {cmd1Fn} = require('../src/cmdlogic');

module.exports = (args) => {
  const {user, pswd, anarg} = args;
  const path = `/tmp/nodejs-cli-cmd1.txt`;
  const data = cmd1Fn(anarg);
  writeToTextFile(path, data)
  .then(() => {
    console.log(`data written to ${path}`)
  })
  .catch(err => {
    console.log('error:', err)
    error(`${err}`, true);
  });
};