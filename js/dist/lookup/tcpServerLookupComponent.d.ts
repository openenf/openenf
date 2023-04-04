import { ENFEventBase } from "../ENFProcessor/events/ENFEventBase";
import { LookupResult } from "../model/lookupResult";
import { LookupComponent } from "./lookupComponent";
import { TcpServerComponentOptions } from "./tcpServerComponentOptions";
export declare class TcpServerLookupComponent implements LookupComponent {
    private options;
    private client;
    /**
     * The contiguousSearchLimit is the longest sequence of frequencies that can be searched in a single pass.
     * It's currently (somewhat arbitrarily set at 600 seconds). For longer sequences it's significantly more efficient
     * to find a sub-sequence which as few nulls and a low standard deviation, then search for the subsequence and then
     * calculate the scores for the full sequence based on the top matches for the subsequence
     * @private
     */
    private contiguousSearchLimit;
    constructor(tcpServerComponentOptions?: TcpServerComponentOptions);
    readonly implementationId: string;
    lookupProgressEvent: ENFEventBase<number>;
    private buildLookupCommand;
    lookup(freqs: (number | null)[], gridIds: string[], from?: Date, to?: Date): Promise<LookupResult[]>;
}
