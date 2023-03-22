import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {LookupResult} from "../model/lookupResult";
import {LookupComponent} from "./lookupComponent";
import {TcpServerComponentOptions} from "./tcpServerComponentOptions";
import net from "net";
import fs from "fs";
import {exec} from "child_process";

export enum LookupCommand {
    ping = 0,
    lookup = 1
}

export class TcpRequestClient {
    private readonly host: string;
    private readonly socket: net.Socket
    private readonly port: number;
    private readonly timeout: number = 2000;
    private connected: boolean = false;

    constructor(port: number, host: string) {
        this.port = port;
        this.host = host;
        this.socket = new net.Socket();
    }

    request(message:string, onUpdate?:(buffer:Buffer)=>void):Promise<{response: string, error: Error | null}> {
        this.connected = false;
        const self = this;
        return new Promise<{response: string, error: Error | null}>(resolve => {
            let wholeMessage = "";
            setTimeout(() => {
                if (!this.connected) {
                    resolve({response:wholeMessage, error:new Error(`Timeout after ${this.timeout} ms`)})
                }
            }, this.timeout)
            const socket = this.socket;
            const errorHandler = ((e:Error) => {
                resolve({response:wholeMessage, error:e})
            });
            socket.on('error', errorHandler)
            socket.connect(this.port, this.host, function () {
                self.connected = true;
                socket.write(message);
            });
            const newDataHandler = (buffer:Buffer) => {
                if (onUpdate) {
                    onUpdate(buffer);
                }
                wholeMessage += buffer;
            };
            socket.on('data', newDataHandler);
            const closeHandler = (hadError:boolean) => {
                socket.removeListener('data', newDataHandler);
                socket.removeListener('close', closeHandler);
                socket.removeListener('error', errorHandler);
                resolve({response:wholeMessage, error:socket.errored});
            };
            socket.on('close', closeHandler);
        })
    }
}

export class TcpServerLookupComponent implements LookupComponent {
    private options: TcpServerComponentOptions;
    private client: TcpRequestClient;

    constructor(tcpServerComponentOptions?: TcpServerComponentOptions) {
        this.options = tcpServerComponentOptions || new TcpServerComponentOptions();
        this.client = new TcpRequestClient(this.options.port, this.options.host);
    }

    readonly implementationId: string = "TcpServerLookupComponent0.0.1";
    lookupProgressEvent: ENFEventBase<number> = new ENFEventBase<number>();

    private buildPingCommand():string {
        return LookupCommand.ping.toString();
    }

    private fireExecutable = (executablePath:string):Promise<boolean> => {
        const command = `${executablePath} -p ${this.options.port}`
        return new Promise((resolve,reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error)
                    console.error(`Error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    reject(new Error(stderr))
                    console.error(`stderr: ${stderr}`);
                    return;
                }
            })
            setTimeout(async () => {
                const {response, error} = await this.client.request(this.buildPingCommand());
                if (error || response !== "pong") {
                    reject();
                } else {
                    resolve(true);
                }
            },500)
        })
    }

    async lookup(freqs: (number | null)[], gridIds: string[], from?: Date, to?: Date): Promise<LookupResult[]> {
        return new Promise(async (resolve, reject) => {
            const {response, error} = await this.client.request(this.buildPingCommand());
            if (error || response !== "pong") {
                //We can't ping the server, so we'll try to fire up the executable:
                if (fs.existsSync(this.options.executablePath)) {
                    const fireExecutableResponse = await this.fireExecutable(this.options.executablePath).catch(e => {
                        reject(new Error(`Cannot reach server at port ${this.options.port}`))
                    });
                    if (fireExecutableResponse) {
                        console.log("Yei");
                        resolve([]);
                    }
                } else {
                    reject(new Error(`Cannot reach server at port ${this.options.port}`))
                }
            } else {
                console.log("Yei2");
                resolve([]);
            }
        })
    }

}

