"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TcpServerRefineComponent = void 0;
const tcpServerComponentOptions_1 = require("../lookup/tcpServerComponentOptions");
const tcpClient_1 = require("../tcpClient/tcpClient");
const lookupCommand_1 = require("../lookup/lookupCommand");
const refineComponentUtils_1 = require("./refineComponentUtils");
const tcpClientUtils_1 = require("../tcpClient/tcpClientUtils");
class TcpServerRefineComponent {
    buildGetMetaDataCommand(gridId) {
        return `${lookupCommand_1.LookupCommand.getMetaData.toString()}${JSON.stringify(gridId)}`;
    }
    async getGridMetaData(lookupResults) {
        const metaData = {};
        const gridIds = Array.from(new Set(lookupResults.map(x => x.gridId)));
        for (const gridId of gridIds) {
            const { response } = await this.client.request(this.buildGetMetaDataCommand(gridId));
            metaData[gridId] = JSON.parse(response, tcpClientUtils_1.toPascalCase);
        }
        return metaData;
    }
    async refine(lookupFrequencies, lookupResults) {
        await this.client.activateServer(this.options.executablePath, this.options.port);
        await this.client.loadGrids(this.options.grids);
        const nonNullDuration = lookupFrequencies.filter(x => x !== null).length;
        const peaks = (0, refineComponentUtils_1.getPeaks)(lookupResults);
        const gridMetaData = await this.getGridMetaData(lookupResults);
        const results = [];
        for (const r of peaks) {
            const command = this.buildComprehensiveLookupCommand(lookupFrequencies, r.gridId, 12, r.position);
            const { response } = await this.client.request(command);
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
        await this.client.stop();
        return results.sort((a, b) => a.score - b.score);
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
    constructor(tcpServerComponentOptions) {
        this.implementationId = "TcpServerRefineComponentv0.0.1";
        this.options = tcpServerComponentOptions || new tcpServerComponentOptions_1.TcpServerComponentOptions();
        this.client = new tcpClient_1.TcpClient(this.options.port, this.options.host);
    }
}
exports.TcpServerRefineComponent = TcpServerRefineComponent;
