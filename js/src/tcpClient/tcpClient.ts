import net from "net";
import {LookupCommand} from "../lookup/lookupCommand";
import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {TcpLookupServer} from "./tcpLookupServer";
import fs from "fs";

export class TcpClient {
    private readonly host: string;
    private readonly socket: net.Socket
    private readonly port: number;
    private readonly timeout: number = 2000;
    private connected: boolean = false;
    private tcpServer:TcpLookupServer | undefined;
    
    public serverMessageEvent:ENFEventBase<string> = new ENFEventBase<string>();

    constructor(port: number, host: string) {
        this.port = port;
        this.host = host;
        this.socket = new net.Socket();
    }

    private buildPingCommand(): string {
        return LookupCommand.ping.toString();
    }

    async activateServer(executablePath:string, port:number): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const {response, error} = await this.request(this.buildPingCommand());
            if (error || response !== "pong") {
                this.tcpServer = new TcpLookupServer(port, executablePath);
                this.tcpServer.serverMessageEvent.addHandler(s => {
                    this.serverMessageEvent.trigger(s);
                })
                this.tcpServer.start().then(async () => {
                    const {response, error} = await this.request(this.buildPingCommand());
                    if (error || response !== "pong") {
                        reject(new Error("Unable to ping spawned server"));
                    } else {
                        resolve();
                    }
                }).catch(e => {
                    reject(e);
                });
            } else {
                resolve();
            }
        })
    }

    private buildLoadGridCommand(id: string, path: string) {
        const request = {
            id,
            path
        }
        return `${LookupCommand.loadGrid.toString()}${JSON.stringify(path)}`;
    }

    async loadGrids(grids: { [p: string]: string }):Promise<void> {
        const optionsGridIds = Object.keys(grids);
        if (optionsGridIds.length) {
            for (const id of optionsGridIds) {
                const filepath = grids[id];
                if (!fs.existsSync(filepath)) {
                    throw new Error(`Unable to find freqdb file at '${filepath}'`)
                }
                const loadGridCommand = this.buildLoadGridCommand(id, grids[id]);
                const {response, error} = await this.request(loadGridCommand);
                if (error) {
                    throw error;
                }
                if (response !== "Ok") {
                    //throw new Error(`Non-ok result loading grid ${id}. Was expecting 'Ok' but got '${response}'. Filepath '${filepath}'`);
                }
            }
        }
    }

    request(message: string, onUpdate?: (buffer: Buffer) => void): Promise<{ response: string, responses: string[], error: Error | null }> {
        this.connected = false;
        const self = this;
        return new Promise<{ response: string, responses: string[], error: Error | null }>(resolve => {
            let wholeMessage = "";
            const responses:string[] = [];
            setTimeout(() => {
                if (!this.connected) {
                    resolve({response: wholeMessage, responses, error: new Error(`Timeout after ${this.timeout} ms`)})
                }
            }, this.timeout)
            const socket = this.socket;
            const errorHandler = ((e: Error) => {
                resolve({response: wholeMessage, responses, error: e})
            });
            socket.on('error', errorHandler)
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
                socket.removeListener('data', newDataHandler);
                socket.removeListener('close', closeHandler);
                socket.removeListener('error', errorHandler);
                resolve({response: wholeMessage, responses, error: socket.errored});
            };
            socket.on('close', closeHandler);
        })
    }

    async stop():Promise<void> {
        if (this.tcpServer) {
            await this.tcpServer.stop();
        } else {
            console.warn('No attached TCP server');
        }
    }
}
