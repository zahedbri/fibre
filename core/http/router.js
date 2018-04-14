#!/usr/bin/env node
"use strict";

// Require modules
const fs = require("fs");
const crypto = require('crypto');
const Redirects = require('../kernel/redirects');

/**
 * Class: Router
 */
module.exports = class Router {

    /**
     * Constructor()
     * @param {*} url_parts
     * @param {*} routes
     */
    constructor(url_parts, website){
        return new Promise((resolve, reject) => {

            // Route data
            let route_data = {};

            // Set class variables
            this.website = website;
            this.url_parts = url_parts;

            // Log
            console.log("-> Finding route..");

            // Check redirects
            new Redirects(website, url_parts).then((redirect_data) => {
                
                resolve({
                    is_redirect: true,
                    item: redirect_data
                });

            }).catch(() => {

                // Check in cache
                this.in_cache().then((cache_item) => {

                    // Resolve
                    resolve(
                        {
                            is_cache: true,
                            item: cache_item
                        }
                    );

                }).catch(() => {

                    // Find object
                    this.find_object().then((route_data) => {
                        resolve(route_data);
                    }).catch(() => {

                        // Find route
                        this.find_route().then((route_data) => {
                            resolve(route_data);
                        }).catch(() => {

                            // Reject
                            reject({http_code: 404, message: ''});

                        });

                    });

                });

            });

        });
    }

    /**
     * In Cache
     * Checks if a path is in the cache.
     */
    in_cache(){
        return new Promise((resolve, reject) => {

            // Create MD5 hash of path
            const md5_of_path = crypto.createHash('md5').update(this.url_parts.pathname).digest('hex');

            // Check
            if(global._fibre_app.cache[md5_of_path]){
                resolve(global._fibre_app.cache[md5_of_path]);
            }else{
                reject();
            }

        });
    }

    /**
     * Find Object
     * Finds a file data about the route matched.
     */
    find_object(){
        return new Promise((resolve, reject) => {

            // Direct File match
            fs.stat( global._fibre_app.root + '/sites/' + this.website.document_root + this.url_parts.pathname, (err, stats) => {
                if(!err && stats.isFile()){

                    // Build the route as a file does not have one
                    let route = {
                        url: this.url_parts.pathname,
                        is_file: true,
                        location: global._fibre_app.root + '/sites/' + this.website.document_root + this.url_parts.pathname,
                        last_modified:  new Date(stats.mtime)
                    };

                    // Resolve
                    resolve(route);

                }else{
                    reject();
                }
            });

        });
    }

    /**
     * Find Route
     * Finds a route and returns data about the route matched.
     */
    find_route(){
        return new Promise((resolve, reject) => {

            // Routes
            const routes = this.website.routes;

            // Load the routes
            for (const key in routes) {
                if (routes.hasOwnProperty(key)) {

                    // Get route
                    const route = routes[key];

                    // Get url
                    const route_url = route.url.toString().toLowerCase().trim();

                    // Get script name
                    var path_name_split = this.url_parts.pathname.toString().split('/') || [''];

                    // Add the data layer
                    route['data_layer'] = {
                        PATHNAME: this.url_parts.pathname,
                        PATH: this.url_parts.path,
                        SEARCH: this.url_parts.search,
                        QUERY: this.url_parts.query,
                        PROTOCOL: this.url_parts.protocol,
                        HOST: this.url_parts.host,
                        PORT: this.url_parts.port,
                        SCRIPT_NAME: path_name_split[path_name_split.length - 1].toString()
                    };

                    // Route Match
                    if(route_url == this.url_parts.pathname){

                        // Resolve
                        resolve(route);

                    }

                    /**
                     *
                     * Dynamic Routing
                     *
                     */

                    // Get route parameters
                    let route_matched_pattern = route_url.match(/(:[a-zA-Z_-]+)/g);

                    // Check if we matched any parameters in the routes path
                    if('undefined' !== typeof route_matched_pattern){
                        if('object' == typeof route_matched_pattern && route_matched_pattern && Object.keys(route_matched_pattern).length > 0){

                            // Split the current URL into segments
                            let url_segments = this.url_parts.pathname.toString().split("/");

                            // Get the route segments
                            let route_segments = route_url.toString().split("/");
                            let real_path = [];

                            // Set counter
                            let counter = 0;

                            // Iterate over each segment
                            if(url_segments && url_segments.length > 0){

                                // Iterate
                                url_segments.forEach(segment => {
                                    segment = segment.toString().replace(' ','').trim();
                                    if(segment !== ''){

                                        // Check if this route segment if exists starts with :
                                        if('undefined' !== typeof route_segments[counter]){

                                            // Match a placeholder
                                            if(route_segments[counter].match(/^:/)){

                                                // Replace the route segment with the actual value
                                                real_path[counter] = segment;

                                                // Add to data layer
                                                route['data_layer'][route_segments[counter].replace(':','')] = segment;

                                            }else{

                                                // Check if current segment of URL matches the route segment
                                                if(route_segments[counter] == segment){

                                                    // Matched a normal segment
                                                    real_path.push(segment);

                                                }

                                            }

                                        }

                                    }else{

                                        // Push an empty string
                                        real_path.push("");

                                    }

                                    // Increment
                                    counter++;

                                });

                                // Check if real_path if good
                                if(real_path.length == route_segments.length){

                                    // The route matches
                                    resolve(route);

                                }

                            }

                        }
                    }

                }
            }

            reject();

        });
    }

}