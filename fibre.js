#!/usr/bin/env node
"use strict";

// Set a global namespace for our app
global._fibre_app = {
    version: '1.1.1',
    os_win: process.platform === "win32",
    root: process.env[(process.platform == 'win32') ? 'USERPROFILE' : '/var/snap/fibre-framework/common'],
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
const arguments_bypass_server_boot = ['version', 'v', 'create-project'];
let bypass = false;
let arguments_arr = [];

// Require modules
const exec = require('child_process').exec;
const http = require('http');
const StartupCheck = require('./core/kernel/startup_checks');
const Server = require('./core/kernel/server');
const fs = require('fs-extra');

// Execute startup checks
new StartupCheck().then(( args ) => {

    // Check for any arguments that bypass server boot
    arguments_bypass_server_boot.forEach(arg => {

        // Check
        if('undefined' !== typeof args[arg]){
            bypass = true;
        }

    });

    if(!bypass){

        new Server().then(() => {

            // Log
            console.log('-> Server running...');

        }).catch((server_error) => {
            console.error(server_error);
        });

    }else{

        for (const key in args) {
            if (args.hasOwnProperty(key)) {
                const arg = args[key];

                // Create Project
                if(key == 'create-project'){

                    // Check if directoy provided
                    if(arg.toString().trim() !== ''){

                        const project_path = arg.toString().trim();

                        // Check if directory exists, if not create
                        fs.stat(project_path, (err, stats) => {
                            if(err){

                                // Create the directory
                                fs.mkdir(path, (err) => {
                                    if(err){
                                        console.log(`Failed to create directory at "${project_path}".`);
                                    }
                                });

                            }

                            // Copy
                            fs.copy(require('path').dirname(require.main.filename) + '/core/storage/project-skeleton/', project_path).then(() => {
                                console.log(`-> Successfully created your project at "${project_path}".`);
                            }).catch(err => {
                                console.log(`-> There was an error copying over the project files:`);
                                console.log(err);
                            });

                        });

                    }else{
                        console.log(`-> Please provide a full path to where you would like Fibre to setup a project.`);
                    }

                }

                // Version
                if(['v','version'].indexOf(key) > -1){
                    console.log(`-> Fibre is running on version ${global._fibre_app.version}.`);
                }

            }
        }

    }

}).catch((startup_check_error) => {
    console.error(startup_check_error);
});