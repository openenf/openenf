import {LookupComponent} from "../../lookup/lookupComponent";
import {ENFEventBase} from "../events/ENFEventBase";
import {LookupResult} from "../../model/lookupResult";

export class MockLookupComponent implements LookupComponent {
    dispose(): Promise<void> {
        return Promise.resolve(undefined);
    }

    private readonly onLookup: any;
    private readonly result: LookupResult[];
    constructor(onLookup?:(freqs: (number | null)[], gridIds: string[], from?: Date, to?: Date) => void, result?:LookupResult[]) {
        this.onLookup = onLookup;
        this.result = result || [];
    }

    readonly implementationId: string = "MockLookupComponent";
    lookupProgressEvent: ENFEventBase<number> = new ENFEventBase<number>();

    lookup(freqs: (number | null)[], gridIds: string[], from?: Date, to?: Date): Promise<LookupResult[]> {
        if (this.onLookup) {
            this.onLookup(freqs, gridIds, from, to)
        }
        return Promise.resolve(this.result);
    }

}
