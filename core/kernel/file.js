"use strict";

// Require modules


/**
 * Class: File
 */
module.exports = class File {

    /**
     * Constructor
     */
    constructor(path){
        return new Promise((resolve, reject) => {

            // Get file extension
            let file_parts = path.split(".");

            // Get the last part
            let file_extension = file_parts[file_parts.length - 1].toString().toLowerCase();

            // CSS
            if(file_extension == 'css'){
                resolve({encoding: global._fibre_app.encoding.text, content_type: "text/css"});
            }else if(file_extension == 'js'){
                resolve({encoding: global._fibre_app.encoding.text, content_type: "text/javascript"});
            }else if(file_extension == 'txt'){
                resolve({encoding: global._fibre_app.encoding.text, content_type: "text/plain"});
            }else if(file_extension == 'html'){
                resolve({encoding: global._fibre_app.encoding.text, content_type: "text/html"});
            }else if(file_extension == 'htm'){
                resolve({encoding: global._fibre_app.encoding.text, content_type: "text/html"});
            }else if(file_extension == 'jpg'){
                resolve({encoding: global._fibre_app.encoding.text, content_type: "image/jpeg"});
            }else if(file_extension == 'jpeg'){
                resolve({encoding: global._fibre_app.encoding.text, content_type: "image/jpeg"});
            }else if(file_extension == 'png'){
                resolve({encoding: global._fibre_app.encoding.text, content_type: "image/png"});
            }else if(file_extension == 'mpeg'){
                resolve({encoding: global._fibre_app.encoding.text, content_type: "audio/mpeg"});
            }else if(file_extension == 'ogg'){
                resolve({encoding: global._fibre_app.encoding.text, content_type: "audio/ogg"});
            }else if(file_extension == 'mp4'){
                resolve({encoding: global._fibre_app.encoding.text, content_type: "video/mp4"});
            }else if(file_extension == 'json'){
                resolve({encoding: global._fibre_app.encoding.text, content_type: "application/json"});
            }else if(file_extension == 'gif'){
                resolve({encoding: global._fibre_app.encoding.text, content_type: "image/gif"});
            }else if(file_extension == 'csv'){
                resolve({encoding: global._fibre_app.encoding.text, content_type: "text/csv"});
            }else if(file_extension == 'ico'){
                resolve({encoding: global._fibre_app.encoding.text, content_type: "image/x-icon"});
            }else if(file_extension == 'woff'){
                resolve({encoding: global._fibre_app.encoding.text, content_type: "font/woff"});
            }else if(file_extension == 'woff2'){
                resolve({encoding: global._fibre_app.encoding.text, content_type: "font/woff2"});
            }else if(file_extension == 'webp'){
                resolve({encoding: global._fibre_app.encoding.text, content_type: "image/webp"});
            }else if(file_extension == 'xml'){
                resolve({encoding: global._fibre_app.encoding.text, content_type: "application/xml"});
            }

            reject(`Unknown file type.`);

        });
    }

}