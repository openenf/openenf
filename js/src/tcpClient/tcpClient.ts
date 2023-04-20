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
    private readonly timeoutMs: number = 2000;
    private connected: boolean = false;
    
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
    
    ping(): Promise<{ response: string, responses: string[], error: Error | null }> {
        return this.request(LookupCommand.ping.toString())
    }

    request(message: string, onUpdate?: (buffer: Buffer) => void): Promise<{ response: string, responses: string[], error: Error | null }> {
        this.connected = false;
        const self = this;
        return new Promise<{ response: string, responses: string[], error: Error | null }>((resolve,reject) => {
            let wholeMessage = "";
            const responses: string[] = [];
            const timeout = setTimeout(() => {
                if (!this.connected) {
                    reject(new Error(`Timeout after ${this.timeoutMs} ms`));
                }
            }, this.timeoutMs)
            const socket = this.socket;
            const errorHandler = ((e: Error) => {
                clearTimeout(timeout);
                console.error('e', e)
                reject(e);
            });
            socket.on('error', errorHandler)
            socket.connect(this.port, this.host, function () {
                socket.write(message);
            });
            const newDataHandler = (buffer: Buffer) => {
                self.connected = true;
                if (onUpdate) {
                    onUpdate(buffer);
                }
                wholeMessage += buffer;
                responses.push(buffer.toString());
            };
            socket.on('data', newDataHandler);
            const closeHandler = (hadError: boolean) => {
                if (hadError) {
                    clearTimeout(timeout);
                    reject(socket.errored);
                }
                socket.removeListener('data', newDataHandler);
                socket.removeListener('error', errorHandler);
                if (wholeMessage.startsWith("TCP SERVER ERROR:")) {
                    clearTimeout(timeout);
                    reject(new Error(wholeMessage));
                }
                clearTimeout(timeout);
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
