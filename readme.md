# Fibre


[![Snap Status](https://build.snapcraft.io/badge/Fibre-Framework/fibre.svg)](https://build.snapcraft.io/user/Fibre-Framework/fibre) [![Known Vulnerabilities](https://snyk.io/test/github/fibre-framework/fibre/badge.svg?targetFile=package.json)](https://snyk.io/test/github/fibre-framework/fibre?targetFile=package.json)

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
    * [Server Status Page](#server-status-page)
    * [Default Security Headers](#default-security-headers)
    * [Developer Toolbar](#developer-toolbar)
2. [Server Redirects](#server-redirects)
3. [Website Structure](#website-structure)
4. [Routes](#routes)
5. [Controllers](#controllers)
6. [View Class](#view-class)
7. [Response Class](#response-class)
7. [Template Engine](#template-engine)
    * [Data Layer](#data-layer)
    * [Using data from the data_layer in your HTML file](#using-data-from-the-data_layer-in-your-html-file)
    * [Include sub views/templates](#include-sub-views/templates)
    * [IF Conditions](#if-conditions)
    * [Foreach Loops](#foreach-loops)

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

# Server Status Page

You can enable a server status page via the **server.json** configuration file, the server status page shows some useful information about memory usage and average usage per CPU. This page can be restricted down to a CIDR block or allow all, the latter is not recommend as this mean your server status page will be publicly accessible.

### Enabling the server status page
Open up your **server.json** file and look for the JSON object named "server_status":

```json
"server_status": {
    "enabled": false,
    "route": "/server-status",
    "security": {
        "allow_all": false,
        "ip_address_block": "10.0.0.0/8"
    }
}
```

Simply change the setting "enabled" to true and change the security settings to match your requirements. By default the "server_status" module will be disabled.

| Setting | Data Type | Description                                   |
| ------- | --------- | -----------------------------------------------
| enabled    | Boolean    | Whether or not the server status page is enabled. |
| route | String | The URL you want your server status page to appear under. This route cannot be a dynamic route. |
| security | Object | Holds security properties for the server status module. |
| security.allow_all | Boolean | If this setting is **true** your server status page will be publicly accessible, meaning anyone can view it. |
| security.ip_address_block | String | A CIDR block to allow IP address within this range to view the server status page. |

You can read about CIDR blocks on the Wikipedia page [Classless Inter-Domain Routing](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing).

# Default Security Headers
By default Fibre will set the below headers to improve security, you can change these values through the **server.json** configuration file, or disable them entirley.

**Default Security Headers**

| Name | Value | Description | Read more |
| ---- | ----- | ----------- | --------- |
| X-Frame-Options | deny | X-Frame-Options response header improve the protection of web applications against Clickjacking. It declares a policy communicated from a host to the client browser on whether the browser must not display the transmitted content in frames of other web pages. | [Read more](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#xfo)
| X-XSS-Protection | 1; mode=block | This header enables the Cross-site scripting (XSS) filter in your browser. Rather than sanitize the page, when a XSS attack is detected, the browser will prevent rendering of the page. | [Read more](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#xxxsp)
| X-Content-Type-Options | nosniff | Setting this header will prevent the browser from interpreting files as something else than declared by the content type in the HTTP headers. | [Read more](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#xcto)

Here is an example of what the default security headers look like in **server.json**, you can edit these or add new headers, headers will be applied to every response.
```json
"default_headers": [
    {
        "name": "X-Frame-Options",
        "value": "deny",
        "enabled": true
    },
    {
        "name": "X-XSS-Protection",
        "value": "1; mode=block",
        "enabled": true
    },
    {
        "name": "X-Content-Type-Options",
        "value": "nosniff",
        "enabled": true
    }
]
```

> **Note:** A server restart is required for any changes to take affect.

# Developer Toolbar
You can enable the developer toolbar by adding or modifying the setting "dev" to the value of true in your "server.json" file, example:

```json
"websites": {
    "default": {
        "dev": true,
        "name": "My default website",
        "website_root": "test/",
        "document_root": "test/public/",
        ...
```

# Server Redirects
Your website may have already a list of redirects that need to be implemented server side, Fibre has a simple and easy syntax for adding redirects. Each website has it's own redirects module, the redirects are stored in a JSON file named **redirects.json**, you can find this file in your website directory under **config/**, if your website does not have a redirects.json file then create an empty one with the following contents:

```json
[

]
```

### Example
Take a look at the below example, this will redirect the user to the homepage if they try and visit the URL "/about".

```json
[
    {
        "url": "/about",
        "redirect_to": "/",
        "code": 301,
        "require_https": false,
        "redirect_secure": false
    }
]
```

### Redirect from HTTP to HTTPS
Use the redirect below to redirect all requests that are not secure (HTTP) to HTTPS.

```json
[
    {
        "url": "all",
        "redirect_to": "current",
        "code": 301,
        "require_https": false,
        "redirect_secure": false
    }
]
```

### Properties

| Name | Data Type | Description |
| ---- | --------- | ----------- |
| url | String | The relative path to redirect from. |
| redirect_to | String | The relative path to redirect to. |
| code | Integer | A valid HTTP response code. |
| require_https | Boolean | Whether or not the request requires to be on HTTPS before the redirect can take place. |
| redirect_secure | Boolean | Redirect the user with HTTPS. |

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

        return this.View.render('welcome', this.data_layer);

    }

    // You can write more methods here...

}
```

The above controller has one method, "init", every Controller must have an "init" method. In this simple controller we are returning a View using the "View" class with the method "render", simply pass the view name and a javascript object as your view data.

> **Note:** View names/paths are written with the dot syntax for path seperator instead of a forward slash.

Example:

```
return this.View.render('support.index', this.data_layer);
```

The above view will have the below folder structure:

- support/
    - index.html

# View Class
The View class renders a HTML page before it's output is shown to the user. When you extend your own custom controller from the BaseController you will automatically gain access to the View class.

## Methods

### Render

```javascript
View.render( @view_name(String), @data_layer(Object) );
```

**Example:**

```javascript
return this.View.render('support.index', {
    page_title: 'Support | My Website',
    page_description: 'A short description for the page.'
});
```

# Response Class
The response class will output data back to the user, you can set custom headers, status code and the data. When you extend your own custom controller from the BaseController you will automatically gain access to the Response class.

## Methods

### Render

```javascript
Response.render( @content(String), @headers(Array of Objects), status_code(Integer));
```

**Example:**

```javascript
return this.Response.render('Hello World', [ { "Content-Type": "text/plain" } ], 200);
```

# Template Engine
Fibre uses it's own templating engine, you can use the templating engine simply by rendering a View from within your Controller. An example of this is below.

## Example
The below example is the home controller and the very first page you see when you install Fibre Framework and navigate to your host, ie: 127.0.0.1 for example.

```javascript
"use strict";
const BaseController = require('./BaseController');
module.exports = class HomeController extends BaseController {

    init(){

        return this.View.render('welcome', this.data_layer);

    }

    // You can write more methods here...

}
```

The controller's init method is called, when this is called we return a new **View**, we are telling the View Class to use the **welcome** view which relates to **welcome.html** within your **views/** directory. The view name supports path seperation using the dot character, for example imagine you had the file structure below:

```
views/
    /support/
        index.html
```

You would simply type "support.index" to return the index.html file inside the support folder.

```javascript
"use strict";
const BaseController = require('./BaseController');
module.exports = class HomeController extends BaseController {

    init(){

        return this.View.render('support.index', {});

    }

    // You can write more methods here...

}
```

## Data Layer

When your **Controller** is initiated Fibre passes along a data layer prefilled with some useful variables that you can use in your Controller and View.

```
PATHNAME:    The path of the request such as "/about",
PATH:        The path of the request including SEARCH,
SEARCH:      The query string,
QUERY:       The query string as an Object,
PROTOCOL:    The protocol used for this request,
HOST:        The host name,
PORT:        The port this request was made on,
SCRIPT_NAME: The last part of the pathname, usually the name of the file
```

You can access the above variables through the data layer, see below for an example.

```javascript
"use strict";
const BaseController = require('./BaseController');
module.exports = class HomeController extends BaseController {

    init(){

        return this.View.render('index', {
            page_name: this.data_layer.SCRIPT_NAME // <--- Using SCRIPT_NAME from the data layer object.
        });

    }

    // You can write more methods here...

}
```

## Using data from the data_layer in your HTML file

Below is an example of the Fibre homepage when you first install Fibre.

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Fibre</title>
    </head>
    <body>
        <div class="flex-center position-ref full-height">

            <div class="content">
                <div class="title m-b-md">
                    Fibre
                    <small style="font-size:1.5rem;display:block;">version {{ VERSION }}</small>
                </div>
            </div>
        </div>
    </body>
</html>
```

When displaying variables Fibre uses the curly braces x2 on either side of the variable name, there also needs to be one space either side of the variable name, this is to keep code consistent and clean. Variables can only contain characters between A-Z and are case sensitive.

### Correct

```HTML
{{ my_variable }}
{{ MY_VARIABLE }} <!-- Different variable than above -->
```

### Wrong

```HTML
{{my_variable}}
{ my_variable }
```

### Display an Object

```HTML
{{ QUERY }}
```

The above will display the query object, if there are any parameters in the request you will see them outputted. Try navigating to the following URL: "http://127.0.0.1/?foo=bar&hello=world".

### Get a value from an Object

```HTML
{{ QUERY.SCRIPT_NAME }}
```

The above will output the script name being executed.

## Include sub views/templates
You can include another HTML file within your view by using the following syntax:

```HTML
@include "templates.html_head"
```

You must specify the keyword @include followed by one space and then your view name in double quotes, the view name here follows the same path seperation as when you call a view within your Controller, using the dot character.

# IF Conditions
You can use if conditions within your views but they are very basic and do not include an else block as of yet. See the following example of an IF Condition in use.

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Fibre</title>

    </head>
    <body>
        <div class="flex-center position-ref full-height">

            <div class="content">
                <div class="title m-b-md">
                    Fibre
                    @if( version ) // <--- IF Condition
                    	<small style="font-size:1.5rem;display:block;">version {{ version }}</small>
                    @endif
                </div>
            </div>
        </div>
    </body>
</html>
```

# Foreach Loops
You can use foreach loops within your HTML files, you can not nest foreach loops yet but this will be available in future releases. Take a look at the example Controller and View below:

## Controller

```javascript
"use strict";
const BaseController = require('./BaseController');
module.exports = class HomeController extends BaseController {

    init(){

        // Static user data
        this.data_layer.users = [
            {
                id: 1,
                name: "Ben",
                location: "London"
            },
            {
                id: 2,
                name: "Dave",
                location: "Paris"
            },
            {
                id: 3,
                name: "Marissa",
                location: "New York"
            }
        ];

        return this.View.render('welcome', this.data_layer);

    }

}
```

## View
The **users** variable in the View below relates to the users array in the **this.data_layer** above.

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Fibre</title>

    </head>
    <body>
        <div class="flex-center position-ref full-height">

            <div class="content">
                <div class="title m-b-md">
                    Fibre
                    <small style="font-size:1.5rem;display:block;font-weight: 300;">version</small>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>id</th>
                            <th>Name</th>
                            <th>Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach(users as key => user)
                            <tr>
                                <td>{{ user.id }}</td>
                                <td>{{ user.name }}</td>
                                <td>{{ user.location }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>

            </div>
        </div>
    </body>
</html>
```