import {LookupResult} from "../model/lookupResult";
import {ENFAnalysisResult} from "../model/ENFAnalysisResult";
import {RefineComponent} from "./refineComponent";
import {TcpServerComponentOptions} from "../lookup/tcpServerComponentOptions";
import {TcpRequestClient} from "../tcpClient/tcpRequestClient";
import {LookupCommand} from "../lookup/lookupCommand";
import {computeKurtosis, convertPositionToGridDate, getPeaks} from "./refineComponentUtils";
import {FreqDbMetaData} from "../wasmFreqDbReader/freqDbMetaData";
import {toPascalCase} from "../tcpClient/tcpClientUtils";

export class TcpServerRefineComponent implements RefineComponent {
    readonly implementationId: string = "TcpServerRefineComponentv0.0.1"
    private options: TcpServerComponentOptions;
    private client: TcpRequestClient;

    private buildGetMetaDataCommand(gridId:string) {
        return `${LookupCommand.getMetaData.toString()}${JSON.stringify(gridId)}`;
    }

    async getGridMetaData(lookupResults: LookupResult[]):Promise<{ [id: string]: FreqDbMetaData }> {
        const metaData:{ [id: string]: FreqDbMetaData } = {};
        const gridIds = Array.from(new Set(lookupResults.map(x => x.gridId)));
        for(const gridId of gridIds) {
            const {response} = await this.client.request(this.buildGetMetaDataCommand(gridId));
            metaData[gridId] = JSON.parse(response, toPascalCase);
        }
        return metaData;
    }

    async refine(lookupFrequencies: (number | null)[], lookupResults: LookupResult[]): Promise<ENFAnalysisResult[]> {
        await this.client.activateServer(this.options.executablePath, this.options.port);
        await this.client.loadGrids(this.options.grids);
        const nonNullDuration = lookupFrequencies.filter(x => x !== null).length;
        const peaks = getPeaks(lookupResults);
        const gridMetaData = await this.getGridMetaData(lookupResults);
        const results:ENFAnalysisResult[] = [];
        for (const r of peaks) {
            const command = this.buildComprehensiveLookupCommand(lookupFrequencies,r.gridId,12,r.position);
            const {response} = await this.client.request(command);
            const comprehensiveResults:any[] = JSON.parse(response, toPascalCase);
            const kurtosis =  computeKurtosis(comprehensiveResults.map(x => x.score));
            const startDate = new Date(gridMetaData[r.gridId].startDate * 1000);
            const result:ENFAnalysisResult = {
                gridId: r.gridId,
                kurtosis,
                normalisedScore: r.score / (nonNullDuration * 1.0),
                score: r.score,
                time: convertPositionToGridDate(r.position, startDate)
            }
            results.push(result);
        }
        return results.sort((a,b) => a.score - b.score);
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

    constructor(tcpServerComponentOptions?: TcpServerComponentOptions) {
        this.options = tcpServerComponentOptions || new TcpServerComponentOptions();
        this.client = new TcpRequestClient(this.options.port, this.options.host);
    }
}
