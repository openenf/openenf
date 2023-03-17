import { app } from 'electron';
import * as os from "os";
import path from "path";
import * as cliProgress from "cli-progress";
import fs from "fs";

const gbFreqDbUrl = "https://zenodo.org/record/7741427/files/GB_50_2014-2021.freqdb";
export const downloadData = async () => {
    const urlParts = gbFreqDbUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];
    fs.mkdir(getDataFilePath(),() => {});
    const filePath = path.join(getDataFilePath(), fileName);
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
                    fs.writeFile(filePath, value, { flag: "a" }, function (err) {
                        if (err) return console.log(err);
                    });
                    controller.enqueue(value);
                }
                controller.close();
                bar.stop();
            }

        },
    }));
}

export const getDataPath = async () => {
    const urlParts = gbFreqDbUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const filePath = path.join(getDataFilePath(), fileName);
    if (fs.existsSync(filePath)) {
        return filePath;
    }
    console.log('Downloading default grid data. This may take a while.');
    await downloadData();
    return filePath;
}

export const getDataFilePath = (): string => {
    const platform = os.platform();
    const appDataPath = app ? app.getPath('userData') : os.homedir();
    const appDirectoryName = "OpenENF";
    if (platform === 'win32') {
        return path.join(appDataPath, 'AppData', 'Roaming', appDirectoryName);
    } else if (platform === 'darwin') {
        return path.join(appDataPath, 'Library', 'Application Support', appDirectoryName);
    } else {
        return path.join(appDataPath, '.config', appDirectoryName.toLowerCase());
    }
};
