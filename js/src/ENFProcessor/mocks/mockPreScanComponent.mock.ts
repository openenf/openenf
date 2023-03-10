import {ENFEventBase} from "../events/ENFEventBase";
import {PreScanUpdate} from "../../model/preScanUpdate";
import {PreScanResult} from "../../model/preScanResult";
import {PreScanComponent} from "../../preScan/preScanComponent";

export class MockPreScanComponent implements PreScanComponent {
    private readonly onPreScan: any;

    constructor(onPreScan?:(resourceUri:string) => void, result?: PreScanResult) {
        this.onPreScan = onPreScan;
        this.result = result || ({h50:0,h100:0,h200:0,h60:0,h120:0,h240:0});
    }

    result: PreScanResult;

    readonly implementationId: string = "MockPreScanComponent";
    preScanProgressEvent: ENFEventBase<[PreScanUpdate, number]> = new ENFEventBase<[PreScanUpdate, number]>();

    preScan(resourceUri: string): Promise<PreScanResult> {
        if (this.onPreScan) {
            this.onPreScan(resourceUri)
        }
        return Promise.resolve(this.result);
    }
}
