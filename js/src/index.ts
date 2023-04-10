#!/usr/bin/env node

import {ENFProcessorFactory} from "./ENFProcessor/ENFProcessorFactory";
import * as fs from "fs";
import * as cliProgress from "cli-progress";
import {ENFProcessor} from "./ENFProcessor/ENFProcessor";
import {verifyApplicationData} from "./dataDownloader/downloadData";

const parseDateWithError = (opt: string) => {
    const result = Date.parse(opt);
    if (isNaN(result)) {
        throw new Error(`Unable to parse '${opt}' as date.`)
    }
    return new Date(result);
}

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
} else {
    console.log(`Running from: ${__filename}`)
    verifyApplicationData().then(() => {
        ENFProcessorFactory.Build().then((enfProcessor: ENFProcessor) => {
            const progressBar = new cliProgress.SingleBar({
                format: 'ENF Analysis |{bar}| {percentage}% || {log}',
                barCompleteChar: '\u2588',
                barIncompleteChar: '\u2591',
                hideCursor: false
            });
            progressBar.start(100, 0, {log: "Start"});
            enfProcessor.progressEvent.addHandler(p => {
                if (p) {
                    progressBar.update(Math.round(p * 10000) / 100);
                }
            })
            enfProcessor.logEvent.addHandler(l => {
                if (l) {
                    progressBar.update({log: l});
                }
            })
            enfProcessor.performFullAnalysis(filepath, argv.grids, argv.start, argv.end).then((result) => {
                progressBar.stop();
                const noMatchReason = result.noMatchReason;
                if (noMatchReason) {
                    console.log(`Unable to find a match. NoMatchReason: ${noMatchReason}`)
                } else {
                    if (result.ENFAnalysisResults) {
                        const r = result.ENFAnalysisResults[0];
                        console.log(`Match found.\nBest guess for when this audio was recorded:\n${r.time}.\nScore: ${r.normalisedScore}\nGrid: ${r.gridId}`);
                    }
                }
                process.exit();
            })
        })
    }).catch(p => {
        console.error(p)
    })
}