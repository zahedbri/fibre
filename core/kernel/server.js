#!/usr/bin/env node
"use strict";

// Require modules
const os = require( 'os' );
const fs = require('fs');
const http = require('http');
const https = require('https');
const HandleRequest = require('../http/handle_request');
const RouteLoader = require('../kernel/route_loader');
const crypto = require("crypto");

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

                // Set key paths
                const private_key_path = global._fibre_app.root + '/sites/' + website.website_root + '/config/' + website.https.certificate_path + website.https.private_key;
                const certificate_key_path = global._fibre_app.root + '/sites/' + website.website_root + '/config/' + website.https.certificate_path + website.https.certificate;

                // Check if user is using SSL on load balancer
                if(website.https.use_ssl_on_load_balancer){

                    // Log
                    console.log(`-> Using SSL from a load balancer.`);

                    // Create the server
                    const server = https.createServer((req, res) => {

                        // Set
                        let lob_ssl = false;

                        // Check for forwarded ssl header
                        for (const key in req.headers) {
                            if (req.headers.hasOwnProperty(key)) {

                                // Header
                                const header = req.headers[key];

                                // X Forwarded Proto
                                if(key.toString().match(/X-Forwarded-Proto/gi)){
                                    if(header.match(/https/gi)){
                                        lob_ssl = true;
                                    }
                                }

                                // x-forwarded-for
                                if(key.toString().match(/X-Forwarded-For/gi)){
                                    if(header.toString().trim() !== ''){
                                        req.connection.client_ip = header;
                                    }
                                }

                            }
                        }

                        // Set default headers
                        global._fibre_app.default_headers.server.forEach(header => {
                            if(header.enabled){
                                res.setHeader(header.name, header.value);
                            }
                        });

                        global._fibre_app.default_headers.custom.forEach(header => {
                            if(header.enabled){
                                res.setHeader(header.name, header.value);
                            }
                        });

                        // Create a request ID.
                        const request_id = crypto.randomBytes(16).toString("hex");

                        // Create in req
                        req._fibre_request_id = request_id;

                        // Add to requests
                        global._fibre_app.requests[request_id] = {
                            id: request_id,
                            stack_trace: [],
                            errors: [],
                            start: new Date()
                        };

                        // Handle the request
                        new HandleRequest(website, req, res, req.socket.encrypted || lob_ssl || false);

                    }).on('error', (e) => {
                        console.log("-> HTTPS Server Error: ", e);
                    });

                    // Listen for requests
                    server.listen(website.https.port, bind_address);

                    // Log
                    console.log(`-> Running HTTPS.`);

                }else{

                    // Check keys exist
                    fs.stat(private_key_path, (err, pk_stat) => {
                        if(err){

                            // Log
                            console.log(`-> [ERROR] Private key does not exist at "${private_key_path}", unable to start HTTPS.`);

                        }else{

                            fs.stat(certificate_key_path, (err, crt_stat) => {
                                if(err){

                                    // Log
                                    console.log(`-> [ERROR] Certificate does not exist at "${certificate_key_path}", unable to start HTTPS.`);

                                }else{

                                    // Read key and certificate

                                    // HTTPS Options
                                    const options = {
                                        key: fs.readFileSync(private_key_path),
                                        cert: fs.readFileSync(certificate_key_path)
                                    };

                                    // Create the server
                                    const server = https.createServer(options, (req, res) => {

                                        // Set
                                        let lob_ssl = false;

                                        // Check for forwarded ssl header
                                        for (const key in req.headers) {
                                            if (req.headers.hasOwnProperty(key)) {

                                                // Header
                                                const header = req.headers[key];

                                                // X Forwarded Proto
                                                if(key.toString().match(/X-Forwarded-Proto/gi)){
                                                    if(header.match(/https/gi)){
                                                        lob_ssl = true;
                                                    }
                                                }

                                                // x-forwarded-for
                                                if(key.toString().match(/X-Forwarded-For/gi)){
                                                    if(header.toString().trim() !== ''){
                                                        req.connection.client_ip = header;
                                                    }
                                                }

                                            }
                                        }

                                        // Set default headers
                                        global._fibre_app.default_headers.server.forEach(header => {
                                            if(header.enabled){
                                                res.setHeader(header.name, header.value);
                                            }
                                        });

                                        global._fibre_app.default_headers.custom.forEach(header => {
                                            if(header.enabled){
                                                res.setHeader(header.name, header.value);
                                            }
                                        });

                                        // Create a request ID.
                                        const request_id = crypto.randomBytes(16).toString("hex");

                                        // Create in req
                                        req._fibre_request_id = request_id;

                                        // Add to requests
                                        global._fibre_app.requests[request_id] = {
                                            id: request_id,
                                            stack_trace: [],
                                            errors: [],
                                            start: new Date()
                                        };

                                        // Handle the request
                                        new HandleRequest(website, req, res, req.socket.encrypted || lob_ssl || false);

                                    }).on('error', (e) => {
                                        console.log("-> HTTPS Server Error: ", e);
                                    });

                                    // Listen for requests
                                    server.listen(website.https.port, bind_address);

                                    // Log
                                    console.log(`-> Running HTTPS.`);

                                }
                            });

                        }
                    });

                }

            }

            /**
             *
             * HTTP
             *
             */
            if(website.http.enabled){

                // Create the server
                const http_server = http.createServer((req, res) => {

                    // Set
                    let lob_ssl = false;

                    // Check for forwarded ssl header and IP address
                    for (const key in req.headers) {
                        if (req.headers.hasOwnProperty(key)) {

                            // Header
                            const header = req.headers[key];

                            // X Forwarded Proto
                            if(key.toString().match(/X-Forwarded-Proto/gi)){
                                if(header.match(/https/gi)){
                                    lob_ssl = true;
                                }
                            }

                            // x-forwarded-for
                            if(key.toString().match(/X-Forwarded-For/gi)){
                                if(header.toString().trim() !== ''){
                                    req.connection.client_ip = header;
                                }
                            }

                        }
                    }

                    // Set default headers
                    global._fibre_app.default_headers.server.forEach(header => {
                        if(header.enabled){
                            res.setHeader(header.name, header.value);
                        }
                    });

                    global._fibre_app.default_headers.custom.forEach(header => {
                        if(header.enabled){
                            res.setHeader(header.name, header.value);
                        }
                    });

                    // Create a request ID.
                    const request_id = crypto.randomBytes(16).toString("hex");

                    // Create in req
                    req._fibre_request_id = request_id;

                    // Add to requests
                    global._fibre_app.requests[request_id] = {
                        id: request_id,
                        stack_trace: [],
                        errors: [],
                        start: new Date()
                    };

                    // Handle the request
                    try {
                        new HandleRequest(website, req, res, req.socket.encrypted || lob_ssl || false);
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

                                                // Merge default headers
                                                try {
                                                    global._fibre_app.default_headers.custom = Object.assign(global._fibre_app.default_headers.custom, website.default_headers);
                                                } catch (error) {

                                                    // Log
                                                    console.log(`-> Error in "default_headers", server.json, unable to set user headers.`);
                                                    console.log(`-> `, error);

                                                }

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
