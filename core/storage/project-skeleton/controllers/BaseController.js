"use strict";
module.exports = class BaseController {

    constructor(data_layer, View, Response, website){
        this.data_layer = data_layer;
        this.View = new View(website);
        this.Response = new Response(website);
    }

}