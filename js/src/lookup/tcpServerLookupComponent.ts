import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {LookupResult} from "../model/lookupResult";
import {LookupComponent} from "./lookupComponent";
import {TcpOptions} from "./tcpOptions";
import {TcpClient} from "../tcpClient/tcpClient";
import {toPascalCase} from "../tcpClient/tcpClientUtils";
import {LookupCommand} from "./lookupCommand";
import {getStrongestSubsequence} from "./lookupComponentUtils";
import {NoMatch} from "../ENFProcessor/noMatch";
import {NoMatchReason} from "../model/noMatchReason";

export class TcpServerLookupComponent implements LookupComponent {
    private client: TcpClient;

    /**
     * The contiguousSearchLimit is the longest sequence of frequencies that can be searched in a single pass.
     * It's currently (somewhat arbitrarily set at 600 seconds). For longer sequences it's significantly more efficient
     * to find a sub-sequence which as few nulls and a low standard deviation, then search for the subsequence and then
     * calculate the scores for the full sequence based on the top matches for the subsequence
     * @private
     */
    private contiguousSearchLimit = 10000;

    constructor(tcpClient: TcpClient) {
        this.client = tcpClient;
    }

    readonly implementationId: string = "TcpServerLookupComponent0.0.1";
    lookupProgressEvent: ENFEventBase<number> = new ENFEventBase<number>();

    private buildLookupCommand(freqs: (number | null)[], gridIds: string[], startTime?: Date, endTime?: Date): string {
        const request = {
            freqs,
            gridIds,
            startTime,
            endTime
        }
        return `${LookupCommand.lookup.toString()}${JSON.stringify(request)}`;
    }

    async lookup(freqs: (number | null)[], gridIds: string[], from?: Date, to?: Date): Promise<LookupResult[]> {
        let position = 0;
        let sequence:(number | null)[] = [];
        //If this is a relatively short frequency sequence we search for it all in one go:
        if (freqs.length <= this.contiguousSearchLimit) {
            sequence = freqs;
        } else {
            //Otherwise we need to
            // 1: find the longest non-null section:
            ({position, sequence} = getStrongestSubsequence(freqs,this.contiguousSearchLimit));
        }
        const lookupCommand = this.buildLookupCommand(sequence, gridIds, from, to);
        const {responses} = await this.client.request(lookupCommand, (buffer: Buffer) => {
            const progress = parseFloat(buffer.toString().replace('Progress: ', ""));
            if (!isNaN(progress)) {
                this.lookupProgressEvent.trigger(progress);
            }
        });
        if (responses.length === 0) {
            throw new NoMatch(NoMatchReason.NoResultsOnLookup);
        }
        const response = responses[responses.length - 1]
        let r;
        try {
            r = JSON.parse(response, toPascalCase);
        }
        catch {
            throw new SyntaxError(`Error parsing '${response}'`);
        }
        r.forEach((r1:any) => {
            r1.position = r1.position - position;
        })
        return r;
    }
}

