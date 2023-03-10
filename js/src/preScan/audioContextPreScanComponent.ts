import {PreScanResult} from "../model/preScanResult";
import {PreScanComponent} from "./preScanComponent";
import {ENFEventBase} from "../analyzer/events/ENFEventBase";
import {PreScanUpdate} from "../model/preScanUpdate";

export class AudioContextPreScanComponent implements PreScanComponent {
    preScanProgressEvent: ENFEventBase<[PreScanUpdate, number]>;
    readonly implementationId: string = "AudioContextRefineV0.1"

    preScan(resourceUri: string): Promise<PreScanResult> {
        throw "Not implemented"
    }
}