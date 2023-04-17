import net from "net";
import {LookupCommand} from "../lookup/lookupCommand";
import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {TcpLookupServerController} from "./tcpLookupServerController";
import fs from "fs";
import {TcpOptions} from "../lookup/tcpOptions";
import {FreqDbMetaData} from "../refine/freqDbMetaData";
import {toPascalCase} from "./tcpClientUtils";

export class TcpClient {
    private readonly host: string;
    private readonly socket: net.Socket
    private readonly port: number;
    private readonly timeout: number = 2000;
    private connected: boolean = false;
    private tcpServer: TcpLookupServerController | undefined;

    public serverMessageEvent: ENFEventBase<string> = new ENFEventBase<string>();
    private options: TcpOptions;

    constructor(options:TcpOptions) {
        this.options = options;
        this.port = options.port;
        this.host = options.host;
        this.socket = new net.Socket();
        this.tcpServer = new TcpLookupServerController(this.port, this.options.executablePath);
        this.tcpServer.serverMessageEvent.addHandler(s => {
            this.serverMessageEvent.trigger(s);
        })
    }

    private buildPingCommand(): string {
        return LookupCommand.ping.toString();
    }

    async activateServer(): Promise<void> {
        console.log('activating server');
        await this.tcpServer?.start();
        const pingCommand = this.buildPingCommand();
        const {response, error} = await this.request(pingCommand);
        if (error || response !== "pong") {
            throw new Error(`Unable to ping spawned server. Sent '${pingCommand}'. Was expecting 'pong' but got '${response}'`);
        }
        await this.loadGrids(this.options.grids);
    }

    private buildLoadGridCommand(id: string, path: string) {
        const request = {
            id,
            path
        }
        return `${LookupCommand.loadGrid.toString()}${JSON.stringify(path)}`;
    }

    private async loadGrids(grids: ({ [p: string]: string })): Promise<void> {
        const optionsGridIds = Object.keys(grids);
        if (optionsGridIds.length) {
            for (const id of optionsGridIds) {
                const filepath = grids[id];
                if (filepath !== '' && !fs.existsSync(filepath)) {
                    throw new Error(`Unable to find freqdb file at '${filepath}'`)
                }
                const loadGridCommand = this.buildLoadGridCommand(id, grids[id]);
                console.log(`Loading grid with command '${loadGridCommand}'`);
                const {response, error} = await this.request(loadGridCommand);
                if (error) {
                    console.error(error)
                    throw error;
                }
                if (response !== "Ok") {
                    const error = new Error(`Non-ok result loading grid ${id}. Was expecting 'Ok' but got '${response}'. Filepath '${filepath}'`);
                    console.error(error);
                    throw error;
                }
            }
        }
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

    async stop(): Promise<void> {
        if (this.tcpServer) {
            await this.tcpServer.stop();
        }
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
