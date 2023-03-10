import {ENFComponent} from "../analyzer/ENFComponent";
import {PreScanResult} from "../model/preScanResult";
import {ENFEventBase} from "../analyzer/events/ENFEventBase";
import {PreScanUpdate} from "../model/preScanUpdate";

/**
 * Provides a pre-scan function for an analyzer
 */
export interface PreScanComponent extends ENFComponent {
    preScanProgressEvent: ENFEventBase<[PreScanUpdate, number]>;
    preScan(resourceUri: string): Promise<PreScanResult>
}
