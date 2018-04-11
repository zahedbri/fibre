"use strict";

// Require modules
const Parser = require('./parser');

/**
 * Class: Engine
 */
module.exports = class Engine {
    constructor(raw_source, data_layer, website){

        // Set to null
        this.err = null;

        // Promise
        return new Promise((resolve, reject) => {

            this.execute(raw_source, data_layer, website, (parsed_data) => {

                if(false !== parsed_data){
                    resolve(parsed_data.source);
                }else{
                    reject(this.err);
                }

            });

        });

    }

    execute(raw_source, data_layer, website, fn){

        // Send to the parser
        new Parser(raw_source, data_layer, website).then((parse_data) => {
            if(parse_data.require_another_pass === 1){
                this.execute(parse_data.source, parse_data.data_layer, website, fn);
            }else{
                fn(parse_data);
            }
        }).catch((err) => {

            // Log
            this.err = err;

            fn(false);

        });

    }

}
