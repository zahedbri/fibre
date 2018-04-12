"use strict";

// Require modules
const url = require('url');
const Router = require('./router');
const File = require('../kernel/file');
const fs = require('fs');
const crypto = require('crypto');
const ResponseController = require('./response');
const ViewController = require('./view');

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

        // Get client's ip address
        const client_ip = request.connection.remoteAddress || null;

        // Get URL parts
        const url_parts = url.parse(request.url, true);

        // Log
        console.log(`-> Handling request from ${client_ip} for website "${website.name}".`);

        // Send to the router
        new Router(url_parts, website).then((route_data) => {

            /**
             * Cache match
             */
            if('undefined' !== typeof route_data.is_cache && route_data.is_cache){

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

                // Require the controller
                delete require.cache[require.resolve(website.website_root + '/controllers/' + route_data.controller)];
                let RouteController = require( website.website_root + '/controllers/' + route_data.controller );

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
    display_http_error(http_code = 500, file_contents = ""){

        // Switch on HTTP Code
        switch(http_code){
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
        fs.readFile( this.website.website_root + '/views/error/' + http_code.toString() + '.html', global._fibre_app.encoding.text, (err, data) => {
            if(err){

                // File does not exist
                this.display_http_error(http_code);

            }else{
                this.display_http_error(http_code, data.toString());
            }
        });

    }

}