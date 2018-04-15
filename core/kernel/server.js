#!/usr/bin/env node
"use strict";

// Require modules
const os = require( 'os' );
const fs = require('fs');
const http = require('http');
const https = require('https');
const HandleRequest = require('../http/handle_request');
const RouteLoader = require('../kernel/route_loader');

/**
 * Class: Server
 */
module.exports = class Server {

    /**
     * ServeWebsite()
     * @param {*} website
     */
    ServeWebsite( website ){

        // Get the bind address
        let bind_address = website.network.bind_address;

        // Check there is nothing running on that address already
        if(global._fibre_app.network.in_use.indexOf(bind_address) < 0){

            // Log
            console.log(`-> Bringing up website "${website.name}".`);

            /**
             *
             * HTTPS
             *
             */
            if(website.https.enabled){

                // HTTPS Options
                const options = {
                    key: fs.readFileSync(global._fibre_app.root + '/sites/' + website.website_root + '/config/' + website.https.certificate_path + 'private.key'),
                    cert: fs.readFileSync(global._fibre_app.root + '/sites/' + website.website_root + '/config/' + website.https.certificate_path + 'certificate.cert')
                };

                // Create the server
                const server = https.createServer(options, (req, res) => {

                    // Set default headers
                    res.setHeader('Server', 'Fibre/1.2.0');
                    res.setHeader("Vary", "Accept-Encoding");

                    // Handle the request
                    new HandleRequest(website, req, res, true);

                }).on('error', (e) => {
                    console.log("-> HTTPS Server Error: ", e);
                });

                // Listen for requests
                server.listen(website.https.port, bind_address);

                // Log
                console.log(`-> Running HTTPS.`);

            }

            /**
             *
             * HTTP
             *
             */
            if(website.http.enabled){

                // Create the server
                const http_server = http.createServer((req, res) => {

                    // Set default headers
                    res.setHeader('Server', 'Fibre/1.2.0');
                    res.setHeader("Vary", "Accept-Encoding");

                    // Handle the request
                    try {
                        new HandleRequest(website, req, res, false);   
                    } catch (error) {
                        console.log(`-> [ERROR] Request failed to process and respond to client.`);
                        console.log(error);
                    }                    

                }).on('error', (e) => {
                    console.log("-> HTTP Server Error: ", e);
                });

                // Listen for requests
                http_server.listen(website.http.port, bind_address);

                // Log
                console.log(`-> "${website.name}" OK.`);

            }

            // Add to global
            global._fibre_app.network.in_use.push(bind_address);

        }else{
            console.log(`-> Unable to start website "${website.name}" on address "${website.network.bind_address}":${website.http.port}, another website is using the address.`);
        }

    }

    /**
     * Constructor()
     */
    constructor(){
        return new Promise((resolve, reject) => {
            if(global._fibre_app.server_configuration && global._fibre_app.server_configuration.websites){

                // Get websites
                const websites = global._fibre_app.server_configuration.websites;

                // Check if we have any websites setup
                if(Object.keys(websites).length > 0){
                    for (const key in websites) {
                        if (websites.hasOwnProperty(key)) {

                            // Get website
                            const website = websites[key];

                            // Log
                            console.log(`-> Validating website "${website.name}"...`);

                            // Check website settings
                            if(website.document_root.toString().trim() !== ''){

                                // Check the bind address
                                if(website.network && website.network.bind_address && website.network.bind_address.toString().trim() !== ''){

                                    // Check http
                                    if(website.http && parseInt(website.http.port) > 0 && website.http.enabled.toString().toLowerCase() === 'true'){

                                        // Check https
                                        if(website.https && website.https.enabled.toString().toLowerCase() === 'true'){
                                            if(!parseInt(website.https.port) > 0){
                                                reject(`-> The website "${website.name}" has an invalid "https.port" property.`);
                                            }
                                        }

                                        // Check the document root exists
                                        try {

                                            // Test read access
                                            var dir_exists = fs.statSync( global._fibre_app.root + '/sites/' + website.document_root.toString() ).isDirectory();

                                            // Load the routes
                                            new RouteLoader(website).then((routes) => {

                                                // Add the routes
                                                website['routes'] = routes;

                                                // Start the server
                                                this.ServeWebsite(website);

                                                // Resolve
                                                resolve();

                                            }).catch((route_loader_error) => {
                                                console.log(`-> Unable to load routes for website "${website.name}".`, route_loader_error);
                                            });

                                        } catch (fs_doc_root_read_error) {
                                            reject(`-> The website "${website.name}", "document_root" path does not exist.\n${fs_doc_root_read_error}`);
                                        }

                                    }else{
                                        reject(`-> The website "${website.name}" has an invalid "http.port" property.`);
                                    }

                                }else{
                                    reject(`-> The website "${website.name}" has an invalid "network.bind_address" property.`);
                                }

                            }else{
                                reject(`-> The website "${website.name}" has an invalid "document_root" property.`);
                            }

                        }
                    }
                }else{

                    // Log
                    reject('-> There are no websites setup in your configuration file.');

                }

            }

        });
    }

}
