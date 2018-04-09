"use strict";

// Require modules
const fs = require('fs');
const Engine = require('../template/engine');

/**
 * Class: View
 */
module.exports = class View {

    /**
     * Constructor
     */
    constructor(website){

        // Website
        this.website = website;

    }

    /**
     * Render
     * @param {*} view
     * @param {*} headers
     * @param {*} status_code
     */
    render(view, data_layer, headers, status_code){

        // Set view
        this.view = view;

        // Data Layer
        this.data_layer = data_layer;

        // Set content
        this.content = '';

        // Set headers
        this.headers = headers || [];

        // Set status code
        this.status_code = status_code || 200;

        return this;

    }

    /**
     * Get Content
     */
    get_content(){
        return new Promise((resolve, reject) => {

            // Get view name
            this.view_name = this.view.toString().replace(".","/");

            // Check if the view exists
            fs.readFile( this.website.website_root + '/views/' + this.view_name + '.html', global._fibre_app.encoding.text, (err, data) => {
                if(err){
                    reject(`The view "${this.view_name}" does not exist in ${this.website.website_root + '/views/'}.`);
                }

                // Send the view HTML source to the template engine
                new Engine(data, this.data_layer, this.website).then((parsed_data) => {

                    resolve(parsed_data);

                }).catch((template_error) => {

                    // Log
                    console.log(template_error);

                    // Reject
                    reject(template_error);

                });

            });

        });
    }

}