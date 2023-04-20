import path from "path";
import * as cliProgress from "cli-progress";
import fs from "fs";
import {getENFDataDirectory} from "./ENFDataDirectory";

export const verifyApplicationData = async () => {
    const dataDirectory = getENFDataDirectory();
    await downloadIfNotExist("https://zenodo.org/record/7741427/files/GB_50_2014-2021.freqdb", path.resolve(dataDirectory,"GB.freqdb"));
    await downloadIfNotExist("https://zenodo.org/record/7809233/files/DE_50_2010-2021.freq.freqdb?download=1", path.resolve(dataDirectory, "DE.freqdb"));
}

const downloadIfNotExist = async(url:string, filepath:string) => {
    if (fs.existsSync(filepath)) {
        return;
    }
    await downloadFile(url, filepath);
}

const downloadFile = async (fileUrl:string, apiPath:string):Promise<void> => {
    return new Promise((resolve,reject) => {
        const url = require('url'),
            http = require('https'),
            p = url.parse(fileUrl),
            timeout = 10000;
        
        const dir = path.dirname(apiPath);
        fs.mkdirSync(dir, {recursive:true});
        const file = fs.createWriteStream(apiPath);

        var timeout_wrapper = function( req:any ) {
            return function() {
                req.abort();
                reject(new Error("File transfer timeout!"));
            };
        };

        var request = http.get(fileUrl).on('response', function(res:any) {
            var len = parseInt(res.headers['content-length'], 10);
            var downloaded = 0;

            const progressBar = new cliProgress.SingleBar({
                format: 'Downloading Grid Frequency Data |{bar}| {percentage}% || {log}',
                barCompleteChar: '\u2588',
                barIncompleteChar: '\u2591',
                hideCursor: false
            });
            progressBar.start(len,0, {log:`Downloading ${path.basename(apiPath)}`});
            
            res.on('data', function(chunk:any) {
                file.write(chunk);
                downloaded += chunk.length;
                progressBar.update(downloaded);
                // reset timeout
                clearTimeout( timeoutId );
                timeoutId = setTimeout( fn, timeout );
            }).on('end', function () {
                // clear timeout
                clearTimeout( timeoutId );
                file.end();
                progressBar.stop();
                resolve();
            }).on('error', function (err:any) {
                // clear timeout
                clearTimeout( timeoutId );
                reject(err);
            });
        });

        // generate timeout handler
        var fn = timeout_wrapper( request );

        // set initial timeout
        var timeoutId = setTimeout( fn, timeout );
    });
}
