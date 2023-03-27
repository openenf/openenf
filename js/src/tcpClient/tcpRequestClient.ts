import net from "net";
import fs from "fs";
import {exec} from "child_process";
import {LookupCommand} from "../lookup/lookupCommand";

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

    private buildPingCommand(): string {
        return LookupCommand.ping.toString();
    }

    async activateServer(executablePath:string, port:number): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const {response, error} = await this.request(this.buildPingCommand());
            if (error || response !== "pong") {
                //We can't ping the server, so we'll try to fire up the executable:
                if (fs.existsSync(executablePath)) {
                    const fireExecutableResponse = await this.fireExecutable(executablePath,port).catch(e => {
                        if (!e) {
                            reject(new Error(`Cannot reach server at port ${port} - no error defined`));
                        }
                        reject(new Error(`Cannot reach server at port ${port} because ${e.message || e.toString()}`))
                    });
                    if (fireExecutableResponse) {
                        resolve();
                    }
                } else {
                    reject(new Error(`Cannot reach server at port ${port}`))
                }
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

    async loadGrids(grids: { [p: string]: string }) {
        const optionsGridIds = Object.keys(grids);
        if (optionsGridIds.length) {
            for (const id of optionsGridIds) {
                const loadGridCommand = this.buildLoadGridCommand(id, grids[id]);
                const {error} = await this.request(loadGridCommand);
                if (error) {
                    throw error;
                }
            }
        }
    }

    private buildCommandLine(executablePath: string, port: number): string {
        let command = `${executablePath} -p ${port} -n`;
        return command;
    }

    fireExecutable = (executablePath: string, port:number): Promise<boolean> => {
        const command = this.buildCommandLine(executablePath, port);
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    reject(error)
                    return;
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    reject(new Error(stderr))
                    return;
                }
                if (stdout) {
                    console.log('stdout', stdout);
                }
            })
            setTimeout(async () => {
                const {response, error} =await this.request(this.buildPingCommand());
                if (error || response !== "pong") {
                    reject(new Error('Timeout pinging server'));
                } else {
                    resolve(true);
                }
            }, 500)
        })
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
}
