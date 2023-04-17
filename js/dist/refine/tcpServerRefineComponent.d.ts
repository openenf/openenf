import { LookupResult } from "../model/lookupResult";
import { ENFAnalysisResult } from "../model/ENFAnalysisResult";
import { RefineComponent } from "./refineComponent";
import { TcpClient } from "../tcpClient/tcpClient";
import { FreqDbMetaData } from "./freqDbMetaData";
export declare class TcpServerRefineComponent implements RefineComponent {
    readonly implementationId: string;
    private client;
    getGridMetaData(lookupResults: LookupResult[]): Promise<{
        [id: string]: FreqDbMetaData;
    }>;
    refine(lookupFrequencies: (number | null)[], lookupResults: LookupResult[]): Promise<ENFAnalysisResult[]>;
    private buildComprehensiveLookupCommand;
    constructor(tcpClient: TcpClient);
}
