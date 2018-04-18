#!/usr/bin/env node
"use strict";

// Require modules
const fs = require('fs');

/**
 * Class: Redirects
 */
module.exports = class Redirects {

    /**
     * Constructor
     */
    constructor(website, url_parts, is_ssl){

        // Set
        this.website = website;
        this.url_parts = url_parts;
        this.is_ssl = is_ssl;

        return new Promise((resolve, reject) => {

            // Get redirect file contents
            fs.stat(global._fibre_app.root + '/sites/' + website.website_root + '/config/redirects.json',(err, stat) => {
                if(err){
                    reject();
                }else{

                    // Log
                    console.log(`-> Getting redirects...`);

                    // Get contents
                    if(new Date(stat.mtime).getTime() !== global._fibre_app.redirects_lm){

                        // Log
                        console.log(`-> Getting redirects from file...`);

                        // Get file
                        fs.readFile(global._fibre_app.root + '/sites/' + website.website_root + '/config/redirects.json', global._fibre_app.encoding.text, (err, data) => {
                            if(err){

                                console.log(`-> Failed to get redirects from file.`);
                                reject();

                            }else{

                                // Try / Catch
                                try {

                                    let redirects_obj = JSON.parse(data);

                                    // Add to global
                                    global._fibre_app.redirects = redirects_obj;

                                    // Set lm
                                    global._fibre_app.redirects_lm = new Date(stat.mtime).getTime();

                                    // Check if redirect
                                    this.isRedirect().then((redirect) => {
                                        resolve(redirect);
                                    }).catch(() => {
                                        reject();
                                    });

                                } catch (error) {
                                    console.log(`-> Failed to load redirects.`)
                                    console.log(error);
                                    reject();
                                }

                            }
                        });
                    }else{

                        // Check if redirect
                        this.isRedirect().then((redirect) => {
                            resolve(redirect);
                        }).catch(() => {
                            reject();
                        });

                    }

                }
            });

        });
    }

    /**
     * isRedirect()
     */
    isRedirect(){
        return new Promise((resolve, reject) => {

            // Set current URL
            const current_url = this.url_parts.protocol + '//' + this.url_parts.host + this.url_parts.pathname;

            // Iterate
            for (const key in global._fibre_app.redirects) {
                if (global._fibre_app.redirects.hasOwnProperty(key)) {

                    // Get redirect
                    const redirect = global._fibre_app.redirects[key];

                    // Check
                    if(redirect.url === this.url_parts.pathname || redirect.url === current_url ){
                        if(false == redirect.require_https && false == this.is_ssl){

                            // Set URL
                            if(redirect.redirect_secure){
                                redirect.final_url = 'https://' + this.url_parts.host.toString().replace(':' + this.website.http.port, ':' + this.website.https.port) + redirect.redirect_to;
                            }else{
                                redirect.final_url = this.url_parts.protocol + '//' + this.url_parts.host + redirect.redirect_to;
                            }

                            // Log
                            console.log(`-> Redirect[${redirect.code}] client to: ${redirect.final_url}.`);

                            // Redirect
                            resolve(redirect);

                        }else if(true == redirect.require_https && true == this.is_ssl){

                            // Set final URL
                            if(true == redirect.redirect_secure && false == this.is_ssl){
                                redirect.final_url = 'https://' + this.url_parts.host.toString().replace(':' + this.website.http.port, ':' + this.website.https.port) + redirect.redirect_to;
                            }else{
                                redirect.final_url = 'https://' + this.url_parts.host + redirect.redirect_to;
                            }

                            // Log
                            console.log(`-> Redirect[${redirect.code}] client to: ${redirect.final_url}.`);

                            // Redirect
                            resolve(redirect);

                        }
                    }else if(redirect.url == 'all'){
                        if(redirect.redirect_to == 'current' && redirect.redirect_secure == true && false == this.is_ssl){

                            // Set
                            redirect.final_url = 'https://' + this.url_parts.host.toString().replace(':' + this.website.http.port, ':' + this.website.https.port) + this.url_parts.path;

                            // Log
                            console.log(`-> Redirect[${redirect.code}] client to: ${redirect.final_url}.`);

                            // Redirect
                            resolve(redirect);

                        }
                    }

                }
            }
            reject();
        });
    }

}