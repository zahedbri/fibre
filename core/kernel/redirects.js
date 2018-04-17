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
    constructor(website, url_parts){
        return new Promise((resolve, reject) => {

            // Get redirect file contents
            fs.stat(global._fibre_app.root + '/sites/' + website.website_root + '/config/redirects.conf',(err, stat) => {
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
                        fs.readFile(global._fibre_app.root + '/sites/' + website.website_root + '/config/redirects.conf', global._fibre_app.encoding.text, (err, data) => {
                            if(err){

                                console.log(`-> Failed to get redirects from file.`);
                                reject();

                            }else{

                                // Try / Catch
                                try {

                                    let lines = data.split("\n");
                                    let redirects = [];

                                    // Iterate
                                    lines.forEach(line => {

                                        if(!line.match(/^#/g)){

                                            // Get parts
                                            // x3
                                            let redirect_part = line.split(" ",4);
                                            redirects.push({
                                                from: redirect_part[0],
                                                to: redirect_part[1],
                                                code: parseInt(redirect_part[2]),
                                                https: redirect_part[3]
                                            });

                                        }

                                    });

                                    // Add to global
                                    global._fibre_app.redirects = redirects;

                                    // Set lm
                                    global._fibre_app.redirects_lm = new Date(stat.mtime).getTime();

                                    // Loop redirects
                                    redirects.forEach(redirect => {

                                        if(url_parts.pathname === redirect.from){

                                            resolve(redirect);

                                        }
                                    });

                                    reject('The route did not match any redirects.');

                                } catch (error) {
                                    console.log(`-> Failed to load redirects.`)
                                    console.log(error);
                                    reject();
                                }

                            }

                        });

                    }else{

                        // Return cached version
                        global._fibre_app.redirects.forEach(redirect => {
                            if(url_parts.pathname === redirect.from){

                                resolve(redirect);

                            }
                        });

                        reject();

                    }

                }
            });

        });
    }

}