#!/usr/bin/env node
"use strict";

// Require modules
const fs = require('fs');

/**
 * Class: RouteLoader
 */
module.exports = class RouteLoader {

    /**
     * Constructor
     * @param {*} website
     */
    constructor(website){
        return new Promise((resolve, reject) => {

            // Declare routes
            let routes = [];

            // Read file
            fs.readFile( global._fibre_app.root + '/sites/' + website.website_root + '/config/routes.json', global._fibre_app.encoding.text, function(err, data){
                if(err){

                    console.log("-> Error opening routes.json: ", err);

                    reject(err);
                }

                // Try and decode
                try {
                    resolve(JSON.parse(data.toString()));
                } catch (error) {
                    console.log("-> Error decoding routes.json: ", error);
                    reject(error);
                }

            });

        });
    }

}