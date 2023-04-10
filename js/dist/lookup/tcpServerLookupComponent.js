"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TcpServerLookupComponent = void 0;
const ENFEventBase_1 = require("../ENFProcessor/events/ENFEventBase");
const tcpServerComponentOptions_1 = require("./tcpServerComponentOptions");
const tcpClient_1 = require("../tcpClient/tcpClient");
const tcpClientUtils_1 = require("../tcpClient/tcpClientUtils");
const lookupCommand_1 = require("./lookupCommand");
const lookupComponentUtils_1 = require("./lookupComponentUtils");
class TcpServerLookupComponent {
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
        this.lookupProgressEvent = new ENFEventBase_1.ENFEventBase();
        this.options = tcpServerComponentOptions || new tcpServerComponentOptions_1.TcpServerComponentOptions();
        this.client = new tcpClient_1.TcpClient(this.options.port, this.options.host);
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
        return `${lookupCommand_1.LookupCommand.lookup.toString()}${JSON.stringify(request)}`;
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
        const r = JSON.parse(response, tcpClientUtils_1.toPascalCase);
        r.forEach((r1) => {
            r1.position = r1.position - position;
        });
        await this.client.stop();
        //this.lookupProgressEvent.trigger(1);
        return r;
    }
}
exports.TcpServerLookupComponent = TcpServerLookupComponent;
