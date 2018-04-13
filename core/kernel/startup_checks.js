#!/usr/bin/env node
"use strict";

// Require modules
const fs = require('fs');

/**
 * Class: StartupCheck
 * @returns Array Arguments
 */
module.exports = class StartupCheck {

    /**
     * GetServerConfiguration()
     */
    GetServerConfiguration(){
        return new Promise((resolve, reject) => {

            // Log
            console.log('-> Attempting to open file "' + global._fibre_app.root + '/server.json' + '" for reading...');

            // Attempt to get configuration file
            fs.readFile( global._fibre_app.root + '/server.json', global._fibre_app.encoding.text,function(err, data){
                if(err){
                    console.log(err);
                    reject('No "server.json" file was found, please make sure this file exists before running Fibre.');
                }

                // Data
                try{

                    // Get server configuration
                    global._fibre_app.server_configuration = JSON.parse(data);

                    // Resolve
                    resolve();

                }catch(err){
                    reject('The "server.json" configuration file is invalid JSON.');
                }

            });

        });
    }

    /**
     * HandleArguments()
     * Argument syntax: parameter=value
     */
    HandleArguments(){
        if(this.arguments && this.arguments.length > 0){

            // Return args
            let return_args = {};

            // Iterate
            this.arguments.forEach((arg, index) => {

                if(arg.match(/=/g)){

                    // Split on equals symbol
                    let arg_x = arg.split('=', 2);

                    // Check length,, should match 2
                    if(arg_x.length == 2){

                        // Add to our list
                        return_args[arg_x[0]] = arg_x[1];

                    }

                }else{
                    if(index > 1){
                        return_args[arg] = arg;
                    }
                }

            });

            return return_args;

        }

        return [];
    }

    /**
     * Constructor()
     */
    constructor(){

        // Set class variables
        this.arguments = [];

        // Return a promise
        return new Promise((resolve, reject) => {

            // Check arguments
            if(process.argv && Array.isArray(process.argv)){
                process.argv.forEach((val, index, array) => {
                    this.arguments.push(val);
                });
            }

            // Handle arguments
            console.log('-> Handling arguments...');
            let handled_arguments = this.HandleArguments();

            // Get the server configuration
            console.log('-> Reading server configuration...');
            this.GetServerConfiguration().then(() => {

                // Startup checks have passed
                resolve( handled_arguments );

            }).catch((server_config_err) => {
                reject(server_config_err);
            });

        });
    }
}