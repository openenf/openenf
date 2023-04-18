"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TcpServerLookupComponent = void 0;
const ENFEventBase_1 = require("../ENFProcessor/events/ENFEventBase");
const tcpClientUtils_1 = require("../tcpClient/tcpClientUtils");
const lookupCommand_1 = require("./lookupCommand");
const lookupComponentUtils_1 = require("./lookupComponentUtils");
const noMatch_1 = require("../ENFProcessor/noMatch");
const noMatchReason_1 = require("../model/noMatchReason");
class TcpServerLookupComponent {
    constructor(tcpClient) {
        /**
         * The contiguousSearchLimit is the longest sequence of frequencies that can be searched in a single pass.
         * It's currently (somewhat arbitrarily set at 600 seconds). For longer sequences it's significantly more efficient
         * to find a sub-sequence which as few nulls and a low standard deviation, then search for the subsequence and then
         * calculate the scores for the full sequence based on the top matches for the subsequence
         * @private
         */
        this.contiguousSearchLimit = 10000;
        this.implementationId = "TcpServerLookupComponent0.0.1";
        this.lookupProgressEvent = new ENFEventBase_1.ENFEventBase();
        this.client = tcpClient;
    }
    buildLookupCommand(freqs, gridIds, startTime, endTime) {
        const request = {
            freqs,
            gridIds,
            startTime,
            endTime
        };
        return `${lookupCommand_1.LookupCommand.lookup.toString()}${JSON.stringify(request)}`;
    }
    async lookup(freqs, gridIds, from, to) {
        const { response: pingResponse } = await this.client.request(lookupCommand_1.LookupCommand.ping.toString());
        let position = 0;
        let sequence = [];
        //If this is a relatively short frequency sequence we search for it all in one go:
        if (freqs.length <= this.contiguousSearchLimit) {
            sequence = freqs;
        }
        else {
            //Otherwise we need to
            // 1: find the longest non-null section:
            ({ position, sequence } = (0, lookupComponentUtils_1.getStrongestSubsequence)(freqs, this.contiguousSearchLimit));
        }
        const lookupCommand = this.buildLookupCommand(sequence, gridIds, from, to);
        const { responses } = await this.client.request(lookupCommand, (buffer) => {
            const progress = parseFloat(buffer.toString().replace('Progress: ', ""));
            if (!isNaN(progress)) {
                this.lookupProgressEvent.trigger(progress);
            }
        });
        const response = responses[responses.length - 1];
        let r;
        try {
            r = JSON.parse(response, tcpClientUtils_1.toPascalCase);
        }
        catch {
            throw new SyntaxError(`Error parsing '${response}'`);
        }
        if (r.length === 0) {
            throw new noMatch_1.NoMatch(noMatchReason_1.NoMatchReason.NoResultsOnLookup);
        }
        r.forEach((r1) => {
            r1.position = r1.position - position;
        });
        return r;
    }
}
exports.TcpServerLookupComponent = TcpServerLookupComponent;
