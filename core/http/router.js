"use strict";

// Require modules
const fs = require("fs");
const crypto = require('crypto');

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
    }

    /**
     * In Cache
     * Checks if a path is in the cache.
     */
    in_cache(){
        return new Promise((resolve, reject) => {

            // Create MD5 hash of path
            const md5_of_path = crypto.createHash('md5').update(this.url_parts.path).digest('hex');

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
            fs.stat( this.website.document_root + this.url_parts.path, (err, stats) => {
                if(!err && stats.isFile()){

                    // Build the route as a file does not have one
                    let route = {
                        url: this.url_parts.path,
                        is_file: true,
                        location: this.website.document_root + this.url_parts.path
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

                    // Route Match
                    if(route_url == this.url_parts.pathname){

                        // Add the data layer
                        route['data_layer'] = {};

                        // Resolve
                        resolve(route);

                    }

                    // Dynamic placeholder match

                }
            }

            reject();

        });
    }

}