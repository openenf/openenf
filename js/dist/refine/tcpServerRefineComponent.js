import { TcpServerComponentOptions } from "../lookup/tcpServerComponentOptions";
import { TcpClient } from "../tcpClient/tcpClient";
import { LookupCommand } from "../lookup/lookupCommand";
import { computeKurtosis, convertPositionToGridDate, getPeaks } from "./refineComponentUtils";
import { toPascalCase } from "../tcpClient/tcpClientUtils";
export class TcpServerRefineComponent {
    buildGetMetaDataCommand(gridId) {
        return `${LookupCommand.getMetaData.toString()}${JSON.stringify(gridId)}`;
    }
    async getGridMetaData(lookupResults) {
        const metaData = {};
        const gridIds = Array.from(new Set(lookupResults.map(x => x.gridId)));
        for (const gridId of gridIds) {
            const { response } = await this.client.request(this.buildGetMetaDataCommand(gridId));
            metaData[gridId] = JSON.parse(response, toPascalCase);
        }
        return metaData;
    }
    async refine(lookupFrequencies, lookupResults) {
        await this.client.activateServer(this.options.executablePath, this.options.port);
        await this.client.loadGrids(this.options.grids);
        const nonNullDuration = lookupFrequencies.filter(x => x !== null).length;
        const peaks = getPeaks(lookupResults);
        const gridMetaData = await this.getGridMetaData(lookupResults);
        const results = [];
        for (const r of peaks) {
            const command = this.buildComprehensiveLookupCommand(lookupFrequencies, r.gridId, 12, r.position);
            const { response } = await this.client.request(command);
            let comprehensiveResults = [];
            try {
                comprehensiveResults = JSON.parse(response, toPascalCase);
            }
            catch (e) {
                console.error('Unable to parse: ');
                console.error(response);
                throw e;
            }
            const kurtosis = computeKurtosis(comprehensiveResults.map(x => x.score));
            const startDate = new Date(gridMetaData[r.gridId].startDate * 1000);
            const result = {
                gridId: r.gridId,
                kurtosis,
                normalisedScore: r.score / (nonNullDuration * 1.0),
                score: r.score,
                time: convertPositionToGridDate(r.position, startDate)
            };
            results.push(result);
        }
        return results.sort((a, b) => a.score - b.score);
    }
    buildComprehensiveLookupCommand(freqs, gridId, range, around) {
        const request = {
            freqs,
            gridId,
            range,
            around
        };
        return `${LookupCommand.comprehensiveLookup.toString()}${JSON.stringify(request)}`;
    }
    constructor(tcpServerComponentOptions) {
        this.implementationId = "TcpServerRefineComponentv0.0.1";
        this.options = tcpServerComponentOptions || new TcpServerComponentOptions();
        this.client = new TcpClient(this.options.port, this.options.host);
    }
    async stopServer() {
        if (this.client) {
            await this.client.stop();
        }
        else {
            console.warn('No attached TCP client');
        }
    }
}
