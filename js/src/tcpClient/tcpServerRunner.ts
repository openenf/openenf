#!/usr/bin/env ts-node

// ts-node options are read from tsconfig.json

import path from "path";
import {TcpRequestClient} from "./tcpRequestClient";
import {getENFDataDirectory} from "../dataDownloader/ENFDataDirectory";
import os from "os";

const getDefaultExecutablePath = () => {
    let executablePath = path.join(getENFDataDirectory(),"serverExecutable");
    switch (os.platform()) {
        case "win32":
            executablePath = path.join(executablePath,"windows","ENFLookupServer.exe");
            break;
        case "darwin":
            executablePath = path.join(executablePath,"macos","ENFLookupServer");
            break;
        default:
            executablePath = path.join(executablePath,"linux","ENFLookupServer");
    }
    return path.resolve(executablePath.replace(' ','\\ '));
}

const keypress = async () => {
    process.stdin.setRawMode(true)
    return new Promise<void>(resolve => process.stdin.once('data', () => {
        process.stdin.setRawMode(false)
        resolve()
    }))
}

const client = new TcpRequestClient(49170, '127.0.0.1');
console.log('Starting server');
client.fireExecutable(getDefaultExecutablePath(), 49170).then(async () => {
    console.log('Loading grids');
    const grids = {
        "GB":path.join(getENFDataDirectory(),"GB.freqdb"),
        "DE":path.join(getENFDataDirectory(),"DE.freqdb")
    }
    await client.loadGrids(grids);
    console.log('ENF Lookup Server Ready. Press any key to quit');
    await keypress();
    process.exit();
    /*while(true) {
        await new Promise(r => setTimeout(r, 2000));
    }*/
})
