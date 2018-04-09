"use strict";

// Set a global namespace for our app
global._fibre_app = {
    os_win: process.platform === "win32",
    encoding: {
        text: "utf8"
    },
    network: {
        in_use: []
    },
    server_configuration: {},
    sites: {},
    cache: [],
    stats: {
        requests: 0,
        get: 0,
        post: 0
    }
};

// Setup a list of arguments that will bypass server start
const arguments_bypass_server_boot = ['enable_extension', 'disable_extension'];

// Require modules
const exec = require('child_process').exec;
const http = require('http');
const StartupCheck = require('./core/kernel/startup_checks');
const Server = require('./core/kernel/server');

// Execute startup checks
new StartupCheck().then(( args ) => {

    new Server().then(() => {

        // Log
        console.log('-> Server running...');

    }).catch((server_error) => {
        console.error(server_error);
    });

}).catch((startup_check_error) => {
    console.error(startup_check_error);
});