import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {LookupResult} from "../model/lookupResult";
import {LookupComponent} from "./lookupComponent";
import {TcpServerComponentOptions} from "./tcpServerComponentOptions";
import {TcpRequestClient} from "../tcpClient/tcpRequestClient";
import {toPascalCase} from "../tcpClient/tcpClientUtils";
import {LookupCommand} from "./lookupCommand";

export class TcpServerLookupComponent implements LookupComponent {
    private options: TcpServerComponentOptions;
    private client: TcpRequestClient;

    constructor(tcpServerComponentOptions?: TcpServerComponentOptions) {
        this.options = tcpServerComponentOptions || new TcpServerComponentOptions();
        this.client = new TcpRequestClient(this.options.port, this.options.host);
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
        await this.client.activateServer(this.options.executablePath, this.options.port);
        await this.client.loadGrids(this.options.grids);
        const lookupCommand = this.buildLookupCommand(freqs, gridIds, from, to);
        const {responses} = await this.client.request(lookupCommand, (buffer: Buffer) => {
            const progress = parseFloat(buffer.toString().replace('Progress: ', ""));
            if (!isNaN(progress)) {
                this.lookupProgressEvent.trigger(progress);
            }
        });
        const response = responses[responses.length - 1]
        const r = JSON.parse(response, toPascalCase);
        return r;
    }
}

