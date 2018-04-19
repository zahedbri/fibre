"use strict";
const BaseController = require('./BaseController');
module.exports = class HomeController extends BaseController {

    init(){

        return this.View.render('welcome', this.data_layer);

    }

}