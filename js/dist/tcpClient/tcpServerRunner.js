#!/usr/bin/env ts-node
"use strict";
// ts-node options are read from tsconfig.json
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const tcpClient_1 = require("./tcpClient");
const ENFDataDirectory_1 = require("../dataDownloader/ENFDataDirectory");
const tcpClientUtils_1 = require("./tcpClientUtils");
const keypress = async () => {
    process.stdin.setRawMode(true);
    return new Promise(resolve => process.stdin.once('data', () => {
        process.stdin.setRawMode(false);
        resolve();
    }));
};
const client = new tcpClient_1.TcpClient(49170, '127.0.0.1');
console.log('Starting server');
client.fireExecutable((0, tcpClientUtils_1.getDefaultExecutablePath)(), 49170).then(async () => {
    console.log('Loading grids');
    const grids = {
        "GB": path_1.default.join((0, ENFDataDirectory_1.getENFDataDirectory)(), "GB.freqdb"),
        "DE": path_1.default.join((0, ENFDataDirectory_1.getENFDataDirectory)(), "DE.freqdb")
    };
    await client.loadGrids(grids);
    console.log('ENF Lookup Server Ready. Press any key to quit');
    await keypress();
    process.exit();
    /*while(true) {
        await new Promise(r => setTimeout(r, 2000));
    }*/
});
