#!/usr/bin/env node
"use strict";

// Require modules
const url = require('url');
const Router = require('./router');
const File = require('../kernel/file');
const fs = require('fs');
const crypto = require('crypto');
const ResponseController = require('./response');
const ViewController = require('./view');
const os = require('os');

/**
 * Class: HandleRequest
 */
module.exports = class HandleRequest {

    /**
     * Constructor()
     * @param {*} website
     * @param {*} request
     * @param {*} response
     * @param {*} is_ssl
     */
    constructor(website, request, response, is_ssl){

        // Increment requests
        global._fibre_app.stats.requests++;
        global._fibre_app.stats.get++;

        // Set response
        this.response = response;

        // Set website
        this.website = website;

        // Declare options
        let options = {};

        // Get client's ip address
        const client_ip = request.connection.remoteAddress || null;

        // Add client_ip to options
        options.client_ip = client_ip;

        // Get URL parts
        let url_parts = url.parse((is_ssl ? 'https': 'http') + '://' + request.headers.host + request.url, true);

        // Log
        console.log(`-> Handling request "${request.url}" from "${client_ip}" for website "${website.name}".`);

        // Send to the router
        new Router(url_parts, website, options).then((route_data) => {

            // Redirect
            if('undefined' !== typeof route_data.is_redirect && route_data.is_redirect === true){

                // Log
                console.log(`-> Redirecting client.`);

                // Set to address
                let redirect_to = route_data.item.to;
                if(route_data.item.https === 'https'){
                    if(url_parts.host !== null){
                        redirect_to = 'https://' + url_parts.host + route_data.item.to;
                    }
                }

                console.log(`-> Redirecting to URL: ${redirect_to}`);

                // Set
                response.setHeader("Location", redirect_to);

                // Set Status Code
                response.writeHead(route_data.item.code);

                // Write data
                response.end();

            }else if('undefined' !== typeof route_data.is_cache && route_data.is_cache){

                /**
                 * Cache match
                 */

                // Log
                console.log(`-> Sending a cached response.`);

                // Set header
                if(route_data.item.content_type){

                    // Set
                    response.setHeader("Content-Type", route_data.item.content_type);

                }

                // Set Status Code
                response.writeHead(200);

                // Write data
                response.end(route_data.item.data.toString());

            }else if('undefined' !== typeof route_data.is_file && route_data.is_file){

                /**
                 * File Match
                 */

                // Get the file extension and encoding
                new File(route_data.location).then((file) => {

                    // Read file
                    fs.readFile(route_data.location, file.encoding, (err, data) => {
                        if(!err){

                            // Set header
                            if(file.content_type){

                                // Set
                                response.setHeader("Content-Type", file.content_type);

                            }

                            // Set vary header
                            if(['js','css','xml','gz','html'].indexOf(file.extension) > -1){
                                response.setHeader("Vary", "Accept-Encoding");
                                response.setHeader("Cache-Control", "max-age=604800, public");
                                response.setHeader('Last-Modified', route_data.last_modified);
                                response.setHeader('Expires', new Date().setFullYear(new Date().getFullYear() + 1));
                            }

                            // Set Status Code
                            response.writeHead(200);

                            // Write data
                            response.end(data.toString());

                            // MD5 of path
                            const md5_of_path = crypto.createHash('md5').update(route_data.url).digest('hex');

                            // Add to cache
                            // Disabled cache for now.
                            /*global._fibre_app.cache[md5_of_path] = {
                                route_data: route_data,
                                content_type: file.content_type,
                                encoding: file.encoding,
                                data: data.toString()
                            };*/

                        }
                    });

                }).catch((file_error) => {

                    // Throw a 500
                    this.throw_http_error(500);

                });

            }else{

                /**
                 * Route Match
                 */

                // Check if server status page
                if('undefined' !== typeof route_data.is_server_status && route_data.is_server_status){

                    // Set header
                    response.setHeader("Content-Type", "text/plain");

                    // Get Avg CPU Usage
                    let cpus = os.cpus();

                    /**
                     * Plain
                     */

                    // Get server status
                    let server_status_string = '';

                    // Output date and time
                    server_status_string += new Date().toString() + `\n`;
                    server_status_string += 'reqs ' + global._fibre_app.stats.requests + `\n`;
                    server_status_string += 'get ' + global._fibre_app.stats.get + `\n`;
                    server_status_string += 'post ' + global._fibre_app.stats.post + `\n`;
                    server_status_string += 'memory rss used ' + process.memoryUsage().rss + `\n`;
                    server_status_string += 'memory heap total ' + process.memoryUsage().heapTotal + `\n`;
                    server_status_string += 'memory heap used ' + process.memoryUsage().heapUsed + `\n`;
                    for(var i = 0, len = cpus.length; i < len; i++) {
                        server_status_string += 'cpu ' + i + '\n';
                        var cpu = cpus[i], total = 0;

                        for(var type in cpu.times) {
                            total += cpu.times[type];
                        }

                        for(type in cpu.times) {
                            server_status_string += '\t' + type + ' ' +  Math.round(100 * cpu.times[type] / total) + '\n';
                        }
                    }

                    // Set Status Code
                    response.writeHead(200);

                    // Set data
                    response.end(server_status_string);

                }else{

                    // Require the controller
                    delete require.cache[require.resolve(global._fibre_app.root + '/sites/' + website.website_root + '/controllers/' + route_data.controller)];
                    let RouteController = require(global._fibre_app.root + '/sites/' + website.website_root + '/controllers/' + route_data.controller );

                    // Start a new instance
                    let RouteControllerInstance = new RouteController(route_data.data_layer, ViewController, ResponseController, website);

                    // Check if the controller has an init method
                    if('undefined' !== typeof RouteControllerInstance.init){
                        try {

                            // Get return data
                            let raw_data = RouteControllerInstance.init();

                            // Check for any headers
                            if(raw_data.headers && Array.isArray(raw_data.headers) && raw_data.headers.length > 0){
                                raw_data.headers.forEach(header => {
                                    response.setHeader(header.name, header.value);
                                });
                            }else{

                                // Set header
                                response.setHeader("Content-Type", "text/html");

                            }

                            // Write data
                            raw_data.get_content().then((raw) => {

                                // Set Status Code
                                response.writeHead(raw_data.status_code);

                                // Set data
                                response.end(raw);

                            }).catch((response_error) => {

                                // Throw a 500 error
                                this.throw_http_error(500);

                            });

                        } catch (error) {

                            console.log(error);

                            // Throw a 500 error
                            this.throw_http_error(500);

                        }
                    }

                }

            }

            // Log
            console.log(`-> Sending response for ${client_ip} for website "${website.name}".`);

        }).catch((router_error) => {

            // Router error
            // Object: {http_code, message}

            // Send http error response
            this.throw_http_error(router_error.http_code);

        });

    }

    /**
     * Display HTTP Error
     * @param {*} file_contents
     */
    display_http_error(http_code, file_contents){

        http_code = http_code || 500;
        file_contents = file_contents || '';

        // Switch on HTTP Code
        switch(http_code){
            case 403:
                this.response.writeHead(http_code);
                this.response.end(file_contents);
            break;
            case 404:
                this.response.writeHead(http_code);
                this.response.end(file_contents);
            break;
            default:
                this.response.writeHead(500);
                this.response.end(file_contents);
        }

    }

    /**
     * http_error()
     * @param {*} http_code
     */
    throw_http_error(http_code){

        // Set header
        this.response.setHeader('Content-Type', 'text/html');

        // Check for a static file
        fs.readFile( global._fibre_app.root + '/sites/' + this.website.website_root + '/views/error/' + http_code.toString() + '.html', global._fibre_app.encoding.text, (err, data) => {
            if(err){

                // File does not exist
                this.display_http_error(http_code);

            }else{
                this.display_http_error(http_code, data.toString());
            }
        });

    }

}