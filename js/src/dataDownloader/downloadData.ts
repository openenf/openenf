import path from "path";
import * as cliProgress from "cli-progress";
import fs from "fs";
import {getENFDataDirectory} from "./ENFDataDirectory";
import crypto from "crypto";

const staticFreqDbLocationData:{[id:string]:remoteFreqDb} = {
    "XX":{
        gridId: "XX",
        url:"https://zenodo.org/record/7768353/files/TestFreqDb.freqdb",
        md5:"ddc138b743874940c9577e03df5b21db"
    },
    "GB":{
        gridId:"GB",
        url:"https://zenodo.org/record/7741427/files/GB_50_2014-2021.freqdb",
        md5:"5686bc6fcc53b9d172ed617f77c8e2c3"
    }
}

interface remoteFreqDb {
    gridId: string;
    url:string;
    md5:string
}

const getMD5 = async (filePath:string):Promise<string> => {
    return new Promise((resolve, reject) => {
        const fileHash = crypto.createHash('md5');
        const stream = fs.createReadStream(filePath);

        stream.on('data', function(data) {
            fileHash.update(data);
        });

        stream.on('end', function() {
            const md5sum = fileHash.digest('hex');
            resolve(md5sum);
        });

        stream.on('error', function(err) {
            reject(err)
        });
    })
}

export const downloadData = async (gridId:string):Promise<void> => {
    return new Promise(async (resolve,reject) => {
        if (!staticFreqDbLocationData[gridId]) {
            throw new Error(`Grid id ${gridId} not known"`)
        }
        const fileName = `${gridId}.freqdb`;
        const filePath = path.join(getENFDataDirectory(), fileName);
        const remoteFreqDb = staticFreqDbLocationData[gridId];

        if (fs.existsSync(filePath)) {
            const md5 = await getMD5(filePath);
            if (md5 == remoteFreqDb.md5) {
                //File is already downloaded and verified so:
                resolve();
            } else {
                console.warn(`For file ${fileName} expected MD5 ${remoteFreqDb.md5} but got ${md5}. Re-downloading`)
                //fs.rmSync(filePath);
                resolve();
            }
        }

        const url = remoteFreqDb.url;
        fs.mkdir(getENFDataDirectory(),() => {});
        const fetchResponse = await fetch(url);
        const contentLength = fetchResponse.headers.get('content-length');
        let total = -1;
        let loaded = 0;
        if (contentLength) {
            total = parseInt(contentLength, 10);
        }

        const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        bar.start(100, 0);

        const response = new Response(new ReadableStream({
            async start(controller) {
                if (fetchResponse.body) {
                    const reader = fetchResponse.body.getReader();
                    for (;;) {
                        const {done, value} = await reader.read();
                        if (done) break;
                        loaded += value.byteLength;
                        bar.update(loaded/total * 100);
                        fs.writeFile(filePath, value, { flag: "a" }, function (err) {
                            if (err) return console.log(err);
                        });
                        controller.enqueue(value);
                    }
                    controller.close();
                    bar.stop();
                    const md5 = await getMD5(filePath);
                    if (md5 !== remoteFreqDb.md5) {
                        reject(new Error(`For file ${fileName} expected MD5 ${remoteFreqDb.md5} but got ${md5}. File may be corrupted`))
                    }
                    resolve();
                }

            },
        }));
    })
}
