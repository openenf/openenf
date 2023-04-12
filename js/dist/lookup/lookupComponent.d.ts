import { LookupResult } from "../model/lookupResult";
import { ENFEventBase } from "../ENFProcessor/events/ENFEventBase";
import { ENFComponent } from "../ENFProcessor/ENFComponent";
/**
 * Provides a lookup function for an analyzer
 */
export interface LookupComponent extends ENFComponent {
    lookupProgressEvent: ENFEventBase<number>;
    /**
     *
     * @param freqs
     * @param gridIds
     * @param from - the optional date to search from (inclusive)
     * @param to - the optional date to search up to (inclusive)
     */
    lookup(freqs: (number | null)[], gridIds: string[], from?: Date, to?: Date): Promise<LookupResult[]>;
}
