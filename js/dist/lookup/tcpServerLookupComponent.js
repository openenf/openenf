import { ENFEventBase } from "../ENFProcessor/events/ENFEventBase";
import { TcpServerComponentOptions } from "./tcpServerComponentOptions";
import { TcpClient } from "../tcpClient/tcpClient";
import { toPascalCase } from "../tcpClient/tcpClientUtils";
import { LookupCommand } from "./lookupCommand";
import { getStrongestSubsequence } from "./lookupComponentUtils";
export class TcpServerLookupComponent {
    constructor(tcpServerComponentOptions) {
        /**
         * The contiguousSearchLimit is the longest sequence of frequencies that can be searched in a single pass.
         * It's currently (somewhat arbitrarily set at 600 seconds). For longer sequences it's significantly more efficient
         * to find a sub-sequence which as few nulls and a low standard deviation, then search for the subsequence and then
         * calculate the scores for the full sequence based on the top matches for the subsequence
         * @private
         */
        this.contiguousSearchLimit = 10000;
        this.implementationId = "TcpServerLookupComponent0.0.1";
        this.lookupProgressEvent = new ENFEventBase();
        this.options = tcpServerComponentOptions || new TcpServerComponentOptions();
        this.client = new TcpClient(this.options.port, this.options.host);
        if (tcpServerComponentOptions?.stdOutHandler) {
            this.client.serverMessageEvent.addHandler(tcpServerComponentOptions?.stdOutHandler);
        }
    }
    buildLookupCommand(freqs, gridIds, startTime, endTime) {
        const request = {
            freqs,
            gridIds,
            startTime,
            endTime
        };
        return `${LookupCommand.lookup.toString()}${JSON.stringify(request)}`;
    }
    async lookup(freqs, gridIds, from, to) {
        await this.client.activateServer(this.options.executablePath, this.options.port);
        await this.client.loadGrids(this.options.grids);
        let position = 0;
        let sequence = [];
        //If this is a relatively short frequency sequence we search for it all in one go:
        if (freqs.length <= this.contiguousSearchLimit) {
            sequence = freqs;
        }
        else {
            //Otherwise we need to
            // 1: find the longest non-null section:
            ({ position, sequence } = getStrongestSubsequence(freqs, this.contiguousSearchLimit));
        }
        const lookupCommand = this.buildLookupCommand(sequence, gridIds, from, to);
        const { responses } = await this.client.request(lookupCommand, (buffer) => {
            const progress = parseFloat(buffer.toString().replace('Progress: ', ""));
            if (!isNaN(progress)) {
                this.lookupProgressEvent.trigger(progress);
            }
        });
        const response = responses[responses.length - 1];
        const r = JSON.parse(response, toPascalCase);
        r.forEach((r1) => {
            r1.position = r1.position - position;
        });
        return r;
    }
    async stopServer() {
        if (this.client) {
            await this.client.stop();
        }
        else {
            console.warn('No attached TCP client');
        }
    }
}
