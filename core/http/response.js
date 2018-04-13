#!/usr/bin/env node
"use strict";

// Require modules


/**
 * Class: Response
 */
module.exports = class Response {

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
    render(content, headers, status_code){

        // Set content
        this.content = content || '';

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

            resolve(this.content);

        });
    }

}