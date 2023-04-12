import { LookupResult } from "../model/lookupResult";
import { ENFAnalysisResult } from "../model/ENFAnalysisResult";
import { RefineComponent } from "./refineComponent";
import { TcpServerComponentOptions } from "../lookup/tcpServerComponentOptions";
import { FreqDbMetaData } from "./freqDbMetaData";
export declare class TcpServerRefineComponent implements RefineComponent {
    readonly implementationId: string;
    private options;
    private client;
    private buildGetMetaDataCommand;
    getGridMetaData(lookupResults: LookupResult[]): Promise<{
        [id: string]: FreqDbMetaData;
    }>;
    refine(lookupFrequencies: (number | null)[], lookupResults: LookupResult[]): Promise<ENFAnalysisResult[]>;
    private buildComprehensiveLookupCommand;
    constructor(tcpServerComponentOptions?: TcpServerComponentOptions);
    stopServer(): Promise<void>;
}
