import { ENFEventBase } from "../events/ENFEventBase";
import { PreScanUpdate } from "../../model/preScanUpdate";
import { PreScanResultLike } from "../../model/preScanResultLike";
import { PreScanComponent } from "../../preScan/preScanComponent";
export declare class MockPreScanComponent implements PreScanComponent {
    private readonly onPreScan;
    constructor(onPreScan?: (resourceUri: string) => void, result?: PreScanResultLike);
    result: PreScanResultLike;
    readonly implementationId: string;
    preScanProgressEvent: ENFEventBase<[PreScanUpdate, number]>;
    preScan(resourceUri: string): Promise<PreScanResultLike>;
}
