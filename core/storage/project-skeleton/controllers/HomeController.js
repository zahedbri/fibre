"use strict";
const BaseController = require('./BaseController');
module.exports = class HomeController extends BaseController {

    init(){

        return this.View.render('welcome', {version: '1.3.0'});

    }

}