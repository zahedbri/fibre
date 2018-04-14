#!/usr/bin/env node
"use strict";

// Set a global namespace for our app
global._fibre_app = {
    version: '1.1.1',
    os_win: process.platform === "win32",
    root: process.env.SNAP_DATA || require('path').dirname(require.main.filename),
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
const arguments_bypass_server_boot = ['manage','version', 'v', 'create-website'];
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

            console.log("-> Bypassing server boot.");
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
                if(key == 'create-website'){

                    // Check if directoy provided
                    if(arg.toString().trim() !== ''){

                        const project_path = global._fibre_app.root + '/sites/' + arg.toString().trim();

                        // Lognode
                        console.log(`-> Creating a new website in "${project_path}".`);

                        // Check if directory exists, if not create
                        fs.stat(project_path, (err, stats) => {
                            if(err){

                                // Create the directory
                                fs.ensureDir(project_path, (err) => {
                                    if(err){
                                        console.log(`-> Failed to create website directory at "${project_path}".`);
                                        console.log(err);
                                    }else{

                                        console.log(`-> Created directory successfully.`);

                                    }
                                });

                            }

                            // Copy
                            console.log(`-> Copying over skeleton files...`);
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
