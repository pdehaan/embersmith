(function() {
  var async, build, colors, commonOptions, commonUsage, extend, fileExistsSync, fs, loadEnv, logger, options, path, rimraf, usage, _ref, _ref1;

  async = require('async');

  colors = require('colors');

  fs = require('fs');

  path = require('path');

  rimraf = require('rimraf');

  _ref = require('./../core/utils'), extend = _ref.extend, fileExistsSync = _ref.fileExistsSync;

  _ref1 = require('./common'), loadEnv = _ref1.loadEnv, commonOptions = _ref1.commonOptions, commonUsage = _ref1.commonUsage;

  logger = require('./../core/logger').logger;

  usage = "\nusage: embersmith build [options]\n\noptions:\n\n  -o, --output [path]           directory to write build-output (defaults to ./build)\n  -X, --clean                   clean before building (warning: will recursively delete everything at output path)\n  " + commonUsage + "\n\n  all options can also be set in the config file\n\nexamples:\n\n  build using a config file (assuming config.json is found in working directory):\n  $ embersmith build\n\n  build using command line options:\n  $ embersmith build -o /var/www/public/ -T extra_data.json -C ~/my-blog\n\n  or using both (command-line options will override config options):\n  $ embersmith build --config another_config.json --clean\n";

  options = {
    output: {
      alias: 'o'
    },
    clean: {
      alias: 'X',
      "default": false
    }
  };

  extend(options, commonOptions);

  build = function(argv) {
    var prepareOutputDir, start;
    start = new Date();
    logger.info('building site');
    prepareOutputDir = function(env, callback) {
      var exists, outputDir;
      outputDir = env.resolvePath(env.config.output);
      exists = fileExistsSync(outputDir);
      if (exists) {
        if (argv.clean) {
          logger.verbose("cleaning - running rimraf on " + outputDir);
          return async.series([
            function(callback) {
              return rimraf(outputDir, callback);
            }, function(callback) {
              return fs.mkdir(outputDir, callback);
            }
          ], callback);
        } else {
          return callback();
        }
      } else {
        logger.verbose("creating output directory " + outputDir);
        return fs.mkdir(outputDir, callback);
      }
    };
    return async.waterfall([
      function(callback) {
        return loadEnv(argv, callback);
      }, function(env, callback) {
        return prepareOutputDir(env, function(error) {
          return callback(error, env);
        });
      }, function(env, callback) {
        return env.build(callback);
      }
    ], function(error) {
      var delta, stop;
      if (error) {
        return logger.error(error.message, error);
      } else {
        stop = new Date();
        delta = stop - start;
        return logger.info("done in " + (delta.toString().bold) + " ms\n");
      }
    });
  };

  module.exports = build;

  module.exports.usage = usage;

  module.exports.options = options;

}).call(this);
