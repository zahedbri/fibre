# Fibre


[![Snap Status](https://build.snapcraft.io/badge/Fibre-Framework/fibre.svg)](https://build.snapcraft.io/user/Fibre-Framework/fibre)

[![Known Vulnerabilities](https://snyk.io/test/github/fibre-framework/fibre/badge.svg?targetFile=package.json)](https://snyk.io/test/github/fibre-framework/fibre?targetFile=package.json)

# Installation

## Installing via Snap

Take a look at [Fibre Framework on the Snap Store](https://snapcraft.io/fibre-framework).

Run the following command to install via Ubuntu Snap.

```
sudo snap install fibre-framework
```

## Updating

Run the following command.

```
sudo snap refresh fibre-framework
```

# Server Commands

## Create an empty website

Once Fibre is installed you can create a new website using the following command, you might need to run this command as "root".

```
sudo fibre-framework.manage create-website=hello-world
```

Next, edit your server.json file to reflect your new website directory, you can edit the file at:

```
sudo nano /var/snap/fibre-framework/current/server.json
```

## Start Fibre Server

You can start the fibre server using the command below.

```bash
sudo systemctl start snap.fibre-framework.server
```

## Stopping the server

```bash
sudo systemctl stop snap.fibre-framework.server
```

## Checking the status of the server

```bash
sudo systemctl status snap.fibre-framework.server
```

# Read the manual

## Table of contents

1. [Server Settings](#server-settings)
    * [Multiple Websites](#multiple-websites)
    * [Website Settings](#website-settings)
2. [Server Redirects](#server-redirects)
3. [Website Structure](#website-structure)
4. [Routes](#routes)
5. [Controllers](#controllers)

# Server Settings
The server settings is where you can define all of your websites configuration including hosting multiple websites, it's as easy as editing a simple JSON file.

If you have installed Fibre via Ubuntu Snap then you will find the **server.json** file at **/var/snap/fibre-framework/current/server.json**, you can edit this file with a simple text editor.

An example server settings file:

```json
{
    "websites": {
        "default": {
            "name": "My default website",
            "website_root": "test/",
            "document_root": "test/public/",
            "default_document": [".html"],
            "network": {
                "bind_address": "0.0.0.0"
            },
            "http": {
                "port": 80,
                "enabled": true
            },
            "https": {
                "port": 443,
                "use_ssl_on_load_balancer": false,
                "certificate_path": "/certs/",
                "private_key": "private.key",
                "certificate": "certificate.cert",
                "enabled": false
            },
            "extensions": {

            }
        }
    }
}
```

# Multiple Websites
Fibre Framework can host multiple websites out of the box, all you need to do is define each website in your **server.json** file. Each website is defined in the "websites" object as seen below:

```json
{
    "websites": {
        "default": {

        },
        "myblog": {

        }
    }
}
```

The **default** is the name of your website, this name is for your purposes only and does not display to the end user, this name must be unique to other websites within the "websites" object.

# Website Settings
Each website has a collection of settings that can be configured to match your requirements, take a look at the below example, this example is what every website will get when they create a new website using the command line tool.

```json
"default": {
    "name": "My default website",
    "website_root": "test/",
    "document_root": "test/public/",
    "default_document": [".html"],
    "network": {
        "bind_address": "0.0.0.0"
    },
    "http": {
        "port": 80,
        "enabled": true
    },
    "https": {
        "port": 443,
        "use_ssl_on_load_balancer": false,
        "certificate_path": "/certs/",
        "private_key": "private.key",
        "certificate": "certificate.cert",
        "enabled": false
    },
    "extensions": {

    }
}
```

See the below table for more information on each setting.

| Setting | Data Type | Description                                   |
| ------- | --------- | -----------------------------------------------
| name    | String    | A user friendly name of the website.          |
| website_root | String | A relative path to the website root. |
| document_root | String | A relative path to the document root, where public files are hosted. |
| default_document | Array | An array of file extensions, the first being the most important. (not used) |
| network | Object | An object to hold network properties. |
| network.bind_address | String | An IP address to bind the server to and listen for connections on. |
| http | Object | An object to hold HTTP properties. |
| http.port | Integer | The port number to use for HTTP connections. |
| http.enabled | Boolean | Whether or not HTTP is enabled. |
| https | Object | An object to hold HTTPS properties. |
| https.port | Integer | The port number to use for HTTPS connections. |
| https.use_ssl_on_load_balancer | Boolean | If you set this to *true* the HTTPS server will ignore local certificates, this is a good option for a load balancer setup in AWS for example.
| https.certificate_path | String | A relative path to a folder where certificates are held. |
| https.private_key | String | The file name including extension of a private key. |
| https.certificate | String | The file name including extension of a certificate file. |
| https.enabled | Boolean | Whether or not HTTPS is enabled. |
| extensions | Object | Not used as of yet. |

> **Note:** Any changes made to the *server.json* file won't take affect until Fibre is restarted.

# Server Redirects
Your website may have already a list of redirects that need to be implemented server side, Fibre has a simple and easy syntax for adding redirects. Each website has it's own redirects module, the redirects are stored in a plain text file named **redirects.conf**, you can find this file in your website directory under **config/**, if your website does not have a redirects.conf file then created an empty one.

### Syntax
Each redirect must be on it's own line, each line is space delimited, every value must be entered even if you do not need it, and in order to the below:

```
{from}(String) {to}(String) {http redirect code}(integer) {http|https}
```

**Example:**
Below is an example for a redirect from "/about" to "/about-us" with a 301 response code.

```
/about /about-us 301 http
```

If we wanted to redirect the above to HTTPS then we would use the following rule:

```
/about /about-us 301 https
```

# Website Structure
To get started you will need to use the below command to create a new website, the command will create a skeleton project with all the required files needed to run a website.

> **Note:** You may need to run this command as the root user.

```
sudo fibre-framework.manage create-website=my-first-blog
```

If the command above has executed successfully you will see a new folder within the **sites** directory, located at:

```
/var/snap/fibre-framework/current/sites/
```

Your new website you created will have the path of:

*/var/snap/fibre-framework/current/sites/my-first-blog/*

If you have a look inside your new website you will see the following structure:

```
my-first-blog
└───config
│   └───certs
│
└───controllers
|
└───public
│   └───css
│   └───js
|
└───views
│   └───error
```

### Structure details

| Folder | Description |
| ------- | ---------- |
| config | This folder holds files relating to your website configuration and is not accessible publicly. |
| config/certs/ | This folder holds your certificate files, you can change the location of certificates through the **server.json** file. |
| controllers | This is where your controllers live for your views. |
| public | This directory is publicly accessible and where your assets such as css, javascript and images should go. |
| views | This folder is where your views and templates live. |

# Routes
Routes define where a request will end up and what controller it will call and so on, every website must have a **routes.json** file in order to serve a web page or resource to clients.

You can edit the **routes.json** file under your website directory inside the config folder. E.g: */var/snap/fibre-framework/current/sites/my-first-blog/config/routes.json*.

> **Note:** Fibre requires to be restarted when you add new routes. This is only temporary.

**Example routes.json file:**

```
{
    "home": {
        "url": "/",
        "controller": "HomeController"
    }
}
```

In the above example you can see a route named "home", this route will be executed when the URL matches "/", the root of a website. The controller "HomeController" will be intiated and the "init" method called.

### Dynamic URLs

```
{
    "blogpost": {
        "url": "/blog/:category/:post",
        "controller": "BlogPostController"
    }
}
```

In the above example we have added dynamic placeholders, these are prefixed with a colon ":". All dynamic placeholders will be available in the data layer for you to use in your controller and view.

The above route will be execute in the following example:

```
https://www.mywebsite/blog/nodejs/my-first-nodejs-app
```

the below variables will be available to use in the data layer:

- category = "nodejs"
- post = "my-first-nodejs-app"

# Controllers
Controllers are where your application logic is kept, the controller calls either a view or response. You must always extend the BaseController class to use the in-built methods that Fibre Framework provides such as the data layer, View and Response classes.

**Example Controller:**
```javascript
"use strict";
const BaseController = require('./BaseController');
module.exports = class HomeController extends BaseController {

    init(){

        return this.View.render('welcome', {version: '1.2.0'});

    }

    // You can write more methods here...

}
```

The above controller has one method, "init", every Controller must have an "init" method. In this simple controller we are returning a View using the "View" class with the method "render", simply pass the view name and a javascript object as your view data.

> **Note:** View names/paths are written with the dot syntax for path seperator instead of a forward slash.

Example:

```
return this.View.render('support.index', {version: '1.2.0'});
```

The above view will have the below folder structure:

- support/
    - index.html
