"use strict";

// Require modules
const fs = require('fs');
const Engine = require('./engine');

/**
 * Class: Parser
 */
module.exports = class Parser {
    constructor(raw, data_layer, website){

        this.require_parse = 0;

        // Setup
        this.parser_actions = ['parse_variables', 'parse_includes', 'parse_if', 'parse_foreach'];
        this.parser_actions_completed = 0;

        // Raw source
        this.raw_source = raw;

        // Data Layer
        this.data_layer = data_layer;

        // Website
        this.website = website;

        // Errors
        this.errors = [];

        // Promise
        return new Promise((resolve, reject) => {

            // Iterate over each action to be performed
            this.parser_actions.forEach(parser_action => {
                this[parser_action]().then(() => {

                    // Good
                    this.parser_actions_completed++;

                    // Check for done
                    if(this.parser_actions_completed === this.parser_actions.length){

                        // Check for errors
                        if(this.errors.length == 0){
                            resolve({
                                require_another_pass: this.require_parse,
                                source: this.raw_source
                            });
                        }else{
                            reject(this.errors);
                        }

                    }

                }).catch((parse_error) => {

                    // Log
                    console.log(parse_error);

                });
            });

        });

    }

    /**
     * Parse Variables
     */
    parse_variables(){
        return new Promise((resolve, reject) => {

            // Get all the matches
            var variable_placeholders = this.raw_source.match(/{{\s[a-z].+\s}}/g);

            // Iterate
            if('undefined' !== typeof variable_placeholders && Array.isArray(variable_placeholders) && variable_placeholders.length > 0){
                variable_placeholders.forEach(item => {

                    // Get variable name
                    let var_name = item.toString().replace('{{','').replace('}}','').trim()

                    // Check the variable is in the data layer
                    try {

                        if('undefined' !== typeof this.data_layer[var_name]){

                            // Replace
                            this.raw_source = this.raw_source.replace(item, decodeURIComponent(this.data_layer[var_name]));

                        }else{

                            // Replace with nothing
                            this.raw_source = this.raw_source.replace(item, '');

                        }

                    } catch (variable_error) {
                        this.errors.push(`The variable ${var_name} is not defined in your data layer.`);
                    }

                });
            }

            resolve();

        });
    }

    /**
     * Parse Includes
     */
    parse_includes(){
        return new Promise((resolve, reject) => {

            // Include statements
            let include_statements = this.raw_source.match(/@include\s"[a-zA-Z._]+"/g);

            // Iterate
            if('undefined' !== typeof include_statements && Array.isArray(include_statements) && include_statements.length > 0){
                include_statements.forEach(include_statement => {

                    // Get view name
                    let view_name_matches = include_statement.match(/"([a-zA-Z._]+)"/);
                    if(view_name_matches && 'undefined' !== typeof view_name_matches[1]){

                        // Make the view name
                        let include_view_name = view_name_matches[1].toString().toLowerCase().replace(".","/");

                        // Check if the view exists
                        try {

                            let sub_view = fs.readFileSync( this.website.website_root + '/views/' + include_view_name + '.html', global._fibre_app.encoding.text);

                            // Replace
                            this.raw_source = this.raw_source.replace(include_statement, sub_view.toString(), 1);

                            // Require another pass through
                            this.require_parse = 1;

                        } catch (include_error) {
                            this.errors.push("The view does not exist.");
                        }

                    }else{

                        // Invalid Syntax
                        this.errors.push("There is a syntax error for an include statement.");

                    }

                });
            }

            resolve();

        });
    }

    parse_if(){
        return new Promise((resolve, reject) => {

            // Include statements
            let if_statements = this.raw_source.match(/(@if\(.+\))[\s\S]*?(@endif)/g);

            // Iterate
            if('undefined' !== typeof if_statements && Array.isArray(if_statements) && if_statements.length > 0){
                if_statements.forEach(if_statement => {

                    // Get match groups
                    let match_groups = if_statement.match(/@if\(.+\)([\s\S]*?)@endif/);
                    let replaced_content = '';
                    if(match_groups && match_groups.length >= 1){
                        replaced_content = match_groups[1].toString().trim();
                    }else{
                        replaced_content = '';
                    }

                    // Match the inner part of the IF condition and retrieve
                    let if_inner_match = if_statement.match(/(@if\((.+)\))/);
                    if(if_inner_match){

                        // The inner between brackets, "variable == true"
                        let if_to_evaulate = if_inner_match[2].toString().trim();

                        // Try
                        let result = false;
                        try {

                            result = ((dl) => {

                                return eval(if_to_evaulate);

                            })(this.data_layer);

                            // Check result
                            if(result || result.toString().trim() == 'true'){
                                this.raw_source = this.raw_source.replace(if_statement, replaced_content);
                            }else{
                                this.raw_source = this.raw_source.replace(if_statement, '');
                            }

                        } catch (error) {
                            this.raw_source = this.raw_source.replace(if_statement, '');
                            console.log(error);
                        }

                    }

                });
            }

            resolve();

        });
    }

    parse_foreach(){
        return new Promise((resolve, reject) => {

            // Include statements
            let foreach_statements = this.raw_source.match(new RegExp(/(@foreach)(\()([a-zA-Z]+)\s(in)\s([a-zA-Z.]+)(\))([\s\S]*?)(@endforeach)/g));

            // Iterate
            if('undefined' !== typeof foreach_statements && Array.isArray(foreach_statements) && foreach_statements.length > 0){
                foreach_statements.forEach(statement => {

                    // Get groups
                    let match_groups = statement.match(/(@foreach)(\()([a-zA-Z]+)\s(in)\s([a-zA-Z.]+)(\))([\s\S]*?)(@endforeach)/);

                    // Iterator variable name
                    const ite_var_name = match_groups[3].toString().trim();

                    // List var in data layer
                    const ite_list = match_groups[5].toString().trim();

                    // Parse the contents of group 7
                    const to_parse_on_iteration = match_groups[7].toString();

                    try {

                        ((dl) => {

                            // Get the list
                            var foreach_local = {
                                list: eval("dl." + ite_list),
                                value: null,
                                index: -1
                            }

                            // Declare html var
                            let _fibre_app_html = '';

                            foreach_local.list.forEach((element, i) => {

                                //foreach_local.value = element;
                                //foreach_local.index = i;

                                _fibre_app_html += to_parse_on_iteration;
                                //console.log(foreach_local.value);

                            });

                            // Replace
                            this.raw_source = this.raw_source.replace(statement, to_parse_on_iteration);
                            this.raw_source = this.raw_source.replace(to_parse_on_iteration, _fibre_app_html);

                        })(this.data_layer);

                        //this.require_parse = 1;

                    } catch (error) {
                        console.log(error);
                    }

                });
            }

            resolve();

        });
    }

}
