'use strict';

var Step = require('step');
var KEYFILE = '/home/strider/keyfile';

function getErrorFromExitCode(exitCode) {
  var err = null;
  if (exitCode !== 0) {
    err = `process exited with status ${exitCode}`;
  }
  return err;
}

function writeFiles(privKey, keyMode, cb, contextCmd) {
  return Step(
    function () {
      contextCmd({command: 'write-to-file', args: [privKey, KEYFILE], screen: `Dropping SSH key at '${KEYFILE}'...`}, this);
    },
    function () {
      contextCmd({command: 'chmod', args: [keyMode, KEYFILE] }, this);
    },
    function (exitCode) {
      cb(getErrorFromExitCode(exitCode));
    }
  );
}

function run(options, cb) {
  var contextCmd = options.contextCmd;
  var split = options.cmd.split(/\s+/);
  var cmd = split[0];
  var args = split.slice(1);

  Step(
    function () {
      writeFiles(options.privKey, '0600', this, contextCmd);
    },
    function (err) {
      if (err) {
        console.log('Error writing files: %s', err);
        return cb(err, null);
      }
      contextCmd({command: cmd, args: args}, this);
    },
    function (exitCode, stdout, stderr) {
      cb(getErrorFromExitCode(exitCode), stdout, stderr, exitCode);
    }
  );
}

module.exports = {
  run: run
};
