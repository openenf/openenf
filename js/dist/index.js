#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ENFProcessorFactory_1 = require("./ENFProcessor/ENFProcessorFactory");
const fs = __importStar(require("fs"));
const cliProgress = __importStar(require("cli-progress"));
const downloadData_1 = require("./dataDownloader/downloadData");
const tcpLookupServerController_1 = require("./tcpClient/tcpLookupServerController");
const tcpClientUtils_1 = require("./tcpClient/tcpClientUtils");
const parseDateWithError = (opt) => {
    const result = Date.parse(opt);
    if (isNaN(result)) {
        throw new Error(`Unable to parse '${opt}' as date.`);
    }
    return new Date(result);
};
const argv = require('yargs/yargs')(process.argv.slice(2))
    .demandCommand(1)
    .array('grids')
    .alias('g', 'grids')
    .default('grids', ['DE', 'GB'])
    .alias('s', 'start')
    .coerce('start', parseDateWithError)
    .alias('e', 'end')
    .coerce('end', parseDateWithError)
    .argv;
const filepath = argv._[0];
if (!fs.existsSync(filepath)) {
    console.error(`Unable to find file at ${filepath}`);
}
else {
    (0, downloadData_1.verifyApplicationData)().then(async (grids) => {
        const port = 49170;
        let serverController;
        if (!await tcpLookupServerController_1.TcpLookupServerController.ServerRunningOnPort(port)) {
            console.log("No TCP lookup server found. I'll spin one up.");
            serverController = new tcpLookupServerController_1.TcpLookupServerController(49170, (0, tcpClientUtils_1.getDefaultExecutablePath)(), grids);
            await serverController.start().catch(e => {
                console.error(e);
                process.exit();
            });
        }
        const enfProcessor = await ENFProcessorFactory_1.ENFProcessorFactory.Build();
        const progressBar = new cliProgress.SingleBar({
            format: 'ENF Analysis |{bar}| {percentage}% || {log}',
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: false
        });
        progressBar.start(100, 0, { log: "Start" });
        enfProcessor.progressEvent.addHandler(p => {
            if (p) {
                progressBar.update(Math.round(p * 10000) / 100);
            }
        });
        enfProcessor.logEvent.addHandler(l => {
            if (l) {
                progressBar.update({ log: l });
            }
        });
        const result = await enfProcessor.performFullAnalysis(filepath, argv.grids, argv.start, argv.end);
        progressBar.stop();
        const noMatchReason = result.noMatchReason;
        if (noMatchReason) {
            console.log(`Unable to find a match. NoMatchReason: ${noMatchReason}`);
        }
        else {
            if (result.ENFAnalysisResults) {
                const r = result.ENFAnalysisResults[0];
                console.log(`Match found.\nBest guess for when this audio was recorded:\n${r.time}.\nScore: ${r.normalisedScore}\nGrid: ${r.gridId}`);
                if (result.analysisEndTime) {
                    const diffInSeconds = Math.floor((result.analysisEndTime?.getTime() - result.analysisStartTime.getTime()) / 1000);
                    console.log(`Total time: ${diffInSeconds} secs`);
                }
            }
        }
        await enfProcessor.dispose();
        await serverController?.stop();
        process.exit();
    }).catch(p => {
        console.error(p);
    });
}
