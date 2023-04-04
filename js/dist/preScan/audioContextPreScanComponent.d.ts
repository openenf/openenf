import { ENFEventBase } from "../ENFProcessor/events/ENFEventBase";
import { PreScanUpdate } from "../model/preScanUpdate";
import { PreScanResultLike } from "../model/preScanResultLike";
import { PreScanComponent } from "./preScanComponent";
import { GoertzelFilterCache } from "../goertzel/GoertzelFilterCache";
export declare class AudioContextPreScanComponent implements PreScanComponent {
    readonly implementationId: string;
    preScanProgressEvent: ENFEventBase<[PreScanUpdate, number]>;
    private goertzelFilterCache;
    constructor(goertzelFilterCache: GoertzelFilterCache);
    preScan(resourceUri: string): Promise<PreScanResultLike>;
}
