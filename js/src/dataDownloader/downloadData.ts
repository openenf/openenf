import { app } from 'electron';
import * as os from "os";
import path from "path";
import * as cliProgress from "cli-progress";
import fs from "fs";
import {getENFDataDirectory} from "./ENFDataDirectory";

const gbFreqDbUrl = "https://zenodo.org/record/7741427/files/GB_50_2014-2021.freqdb";
export const downloadData = async ():Promise<void> => {
    return new Promise(async resolve => {
        const urlParts = gbFreqDbUrl.split("/");
        const fileName = urlParts[urlParts.length - 1];
        fs.mkdir(getENFDataDirectory(),() => {});
        const filePath = path.join(getENFDataDirectory(), fileName);
        const response = await fetch(gbFreqDbUrl);
        const contentLength = response.headers.get('content-length');
        let total = -1;
        let loaded = 0;
        if (contentLength) {
            total = parseInt(contentLength, 10);
        }
        const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        bar.start(100, 0);

        const res = new Response(new ReadableStream({
            async start(controller) {
                if (response.body) {
                    const reader = response.body.getReader();
                    for (;;) {
                        const {done, value} = await reader.read();
                        if (done) break;
                        loaded += value.byteLength;
                        bar.update(loaded/total * 100);
                        bar.render();
                        fs.writeFile(filePath, value, { flag: "a" }, function (err) {
                            if (err) return console.log(err);
                        });
                        controller.enqueue(value);
                    }
                    controller.close();
                    bar.stop();
                    resolve();
                }

            },
        }));
    })
}

export const getDataPath = async () => {
    const urlParts = gbFreqDbUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const filePath = path.join(getENFDataDirectory(), fileName);
    if (fs.existsSync(filePath)) {
        return filePath;
    }
    console.log('Downloading default grid data. This may take a while.');
    await downloadData();
    return filePath;
}
