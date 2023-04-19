"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TcpServerRefineComponent = void 0;
const lookupCommand_1 = require("../lookup/lookupCommand");
const refineComponentUtils_1 = require("./refineComponentUtils");
const tcpClientUtils_1 = require("../tcpClient/tcpClientUtils");
const fs_1 = __importDefault(require("fs"));
class TcpServerRefineComponent {
    async getGridMetaData(lookupResults) {
        const metaData = {};
        const gridIds = Array.from(new Set(lookupResults.map(x => x.gridId)));
        for (const gridId of gridIds) {
            metaData[gridId] = await this.client.getMetaData(gridId);
        }
        return metaData;
    }
    async refine(lookupFrequencies, lookupResults) {
        const nonNullDuration = lookupFrequencies.filter(x => x !== null).length;
        const peaks = (0, refineComponentUtils_1.getPeaks)(lookupResults);
        const gridMetaData = await this.getGridMetaData(lookupResults);
        const results = [];
        for (const r of peaks) {
            const command = this.buildComprehensiveLookupCommand(lookupFrequencies, r.gridId, 12, r.position);
            fs_1.default.writeFileSync("command.txt", command);
            const responses = await this.client.request(command).catch(e => {
                console.error(e);
                process.exit();
            });
            if (!responses) {
                console.error('No response from refine');
                throw new Error('No response from refine'); // Fixed: replace process.exit() with throw statement
            }
            const response = responses.response;
            let comprehensiveResults = [];
            try {
                comprehensiveResults = JSON.parse(response, tcpClientUtils_1.toPascalCase);
            }
            catch (e) {
                console.error('Unable to parse: ');
                console.error(response);
                throw e;
            }
            const kurtosis = (0, refineComponentUtils_1.computeKurtosis)(comprehensiveResults.map(x => x.score));
            const startDate = new Date(gridMetaData[r.gridId].startDate * 1000);
            const result = {
                gridId: r.gridId,
                kurtosis,
                normalisedScore: r.score / (nonNullDuration * 1.0),
                score: r.score,
                time: (0, refineComponentUtils_1.convertPositionToGridDate)(r.position, startDate)
            };
            results.push(result);
        }
        const sortedResults = results.sort((a, b) => a.score - b.score);
        return sortedResults;
    }
    buildComprehensiveLookupCommand(freqs, gridId, range, around) {
        const request = {
            freqs,
            gridId,
            range,
            around
        };
        return `${lookupCommand_1.LookupCommand.comprehensiveLookup.toString()}${JSON.stringify(request)}`;
    }
    constructor(tcpClient) {
        this.implementationId = "TcpServerRefineComponentv0.0.1";
        this.client = tcpClient;
    }
}
exports.TcpServerRefineComponent = TcpServerRefineComponent;
