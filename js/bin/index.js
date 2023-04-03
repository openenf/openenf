#!/usr/bin/env node

const parseDateWithError = opt => {
    const result = Date.parse(opt);
    if (isNaN(result)) {
        throw new Error(`Unable to parse '${opt}' as date.`)
    }
    return result;
}

const argv = require('yargs/yargs')(process.argv.slice(2))
    .demandCommand(1)
    .array('grids')
    .alias('g','grids')
    .default('grids',['DE','GB'])
    .alias('s','start')
    .coerce('start', parseDateWithError)
    .alias('e','end')
    .coerce('end', parseDateWithError)
    .argv;

const filepath = argv._[0];

console.log(argv);
console.log('filepath', filepath);