import net from "net";
import {LookupCommand} from "../lookup/lookupCommand";
import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {TcpOptions} from "../lookup/tcpOptions";
import {FreqDbMetaData} from "../refine/freqDbMetaData";
import {toPascalCase} from "./tcpClientUtils";

export class TcpClient {
    private readonly host: string;
    private readonly socket: net.Socket
    private readonly port: number;
    private readonly timeout: number = 2000;
    private connected: boolean = false;

    public serverMessageEvent: ENFEventBase<string> = new ENFEventBase<string>();
    private options: TcpOptions;

    constructor(options:TcpOptions) {
        this.options = options;
        this.port = options.port;
        this.host = options.host;
        this.socket = new net.Socket();
    }

    private buildPingCommand(): string {
        return LookupCommand.ping.toString();
    }

    private buildLoadGridCommand(id: string, path: string) {
        const request = {
            id,
            path
        }
        return `${LookupCommand.loadGrid.toString()}${JSON.stringify(path)}`;
    }

    request(message: string, onUpdate?: (buffer: Buffer) => void): Promise<{ response: string, responses: string[], error: Error | null }> {
        this.connected = false;
        const self = this;
        return new Promise<{ response: string, responses: string[], error: Error | null }>((resolve,reject) => {
            let wholeMessage = "";
            const responses: string[] = [];
            setTimeout(() => {
                if (!this.connected) {
                    reject(new Error(`Timeout after ${this.timeout} ms`));
                }
            }, this.timeout)
            const socket = this.socket;
            const errorHandler = ((e: Error) => {
                reject(e);
            });
            socket.once('error', errorHandler)
            socket.connect(this.port, this.host, function () {
                self.connected = true;
                socket.write(message);
            });
            const newDataHandler = (buffer: Buffer) => {
                if (onUpdate) {
                    onUpdate(buffer);
                }
                wholeMessage += buffer;
                responses.push(buffer.toString());
            };
            socket.on('data', newDataHandler);
            const closeHandler = (hadError: boolean) => {
                if (hadError) {
                    reject(socket.errored);
                }
                socket.removeListener('data', newDataHandler);
                resolve({response: wholeMessage, responses, error: socket.errored});
            };
            socket.once('close', closeHandler);
        })
    }

    private buildGetMetaDataCommand(gridId: string) {
        return `${LookupCommand.getMetaData.toString()}${JSON.stringify(gridId)}`;
    }

    async getMetaData(gridId: string):Promise<FreqDbMetaData> {
        const {response} = await this.request(this.buildGetMetaDataCommand(gridId));
        let freqDbMetaData;
        try {
            freqDbMetaData = JSON.parse(response, toPascalCase);
        }
        catch (e) {
            throw new SyntaxError(`Error parsing '${response}' to JSON while getting metadata for ${gridId}`);
        }
        return freqDbMetaData;
    }
}
