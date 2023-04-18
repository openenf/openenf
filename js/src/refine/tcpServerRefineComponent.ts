import {LookupResult} from "../model/lookupResult";
import {ENFAnalysisResult} from "../model/ENFAnalysisResult";
import {RefineComponent} from "./refineComponent";
import {TcpClient} from "../tcpClient/tcpClient";
import {LookupCommand} from "../lookup/lookupCommand";
import {computeKurtosis, convertPositionToGridDate, getPeaks} from "./refineComponentUtils";
import {FreqDbMetaData} from "./freqDbMetaData";
import {toPascalCase} from "../tcpClient/tcpClientUtils";
import fs from "fs";

export class TcpServerRefineComponent implements RefineComponent {
    readonly implementationId: string = "TcpServerRefineComponentv0.0.1"
    private client: TcpClient;

    async getGridMetaData(lookupResults: LookupResult[]): Promise<{ [id: string]: FreqDbMetaData }> {
        const metaData: { [id: string]: FreqDbMetaData } = {};
        const gridIds = Array.from(new Set(lookupResults.map(x => x.gridId)));
        for (const gridId of gridIds) {
            metaData[gridId] = await this.client.getMetaData(gridId);
        }
        return metaData;
    }

    async refine(lookupFrequencies: (number | null)[], lookupResults: LookupResult[]): Promise<ENFAnalysisResult[]> {
        const nonNullDuration = lookupFrequencies.filter(x => x !== null).length;
        const peaks = getPeaks(lookupResults);
        const gridMetaData = await this.getGridMetaData(lookupResults);
        const results: ENFAnalysisResult[] = [];
        for (const r of peaks) {
            const command = this.buildComprehensiveLookupCommand(lookupFrequencies, r.gridId, 12, r.position);
            fs.writeFileSync("command.txt", command);
            const responses = await this.client.request(command).catch(e => {
                console.error(e);
                process.exit();
            })
            if (!responses) {
                console.error('No response from refine');
                throw new Error('No response from refine'); // Fixed: replace process.exit() with throw statement
            }
            const response = responses.response;
            let comprehensiveResults: any[] = [];
            try {
                comprehensiveResults = JSON.parse(response, toPascalCase);
            } catch (e) {
                console.error('Unable to parse: ');
                console.error(response);
                throw e;
            }
            const kurtosis = computeKurtosis(comprehensiveResults.map(x => x.score));
            const startDate = new Date(gridMetaData[r.gridId].startDate * 1000);
            const result: ENFAnalysisResult = {
                gridId: r.gridId,
                kurtosis,
                normalisedScore: r.score / (nonNullDuration * 1.0),
                score: r.score,
                time: convertPositionToGridDate(r.position, startDate)
            }
            results.push(result);
        }
        const sortedResults = results.sort((a, b) => a.score - b.score);
        return sortedResults;
    }

    private buildComprehensiveLookupCommand(freqs: (number | null)[], gridId: string, range: number, around: number): string {
        const request = {
            freqs,
            gridId,
            range,
            around
        }
        return `${LookupCommand.comprehensiveLookup.toString()}${JSON.stringify(request)}`;
    }

    constructor(tcpClient: TcpClient) {
        this.client = tcpClient;
    }
}
