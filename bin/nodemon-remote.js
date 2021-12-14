#!/usr/bin/env node

process.env.DEBUG = "remote mon"; // enable logging
const logger = require("debug")("mon");

const cli = require("nodemon/lib/cli");
const nodemon = require("nodemon/lib/nodemon");
const remote = require("../lib/");
const options = cli.parse(process.argv);

const mon = nodemon(options);
mon.on("log", (msg) => {
  if (!options.quiet) {
    logger(msg.message);
  }
});

remote({ nodemon: mon });

const fs = require("fs");

// checks for available update and returns an instance
const pkg = JSON.parse(fs.readFileSync(__dirname + "/../package.json"));

if (pkg.version.indexOf("0.0.0") !== 0 && options.noUpdateNotifier !== true) {
  require("update-notifier")({ pkg }).notify();
}
