import { LookupComponent } from "../../lookup/lookupComponent";
import { ENFEventBase } from "../events/ENFEventBase";
import { LookupResult } from "../../model/lookupResult";
export declare class MockLookupComponent implements LookupComponent {
    private readonly onLookup;
    private readonly result;
    constructor(onLookup?: (freqs: (number | null)[], gridIds: string[], from?: Date, to?: Date) => void, result?: LookupResult[]);
    readonly implementationId: string;
    lookupProgressEvent: ENFEventBase<number>;
    lookup(freqs: (number | null)[], gridIds: string[], from?: Date, to?: Date): Promise<LookupResult[]>;
}
