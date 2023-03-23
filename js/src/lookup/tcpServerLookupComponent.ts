import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {LookupResult} from "../model/lookupResult";
import {LookupComponent} from "./lookupComponent";
import {TcpServerComponentOptions} from "./tcpServerComponentOptions";
import fs from "fs";
import {exec} from "child_process";
import {TcpRequestClient} from "./tcpRequestClient";

export enum LookupCommand {
    ping = 0,
    lookup = 1,
    loadGrid = 2,
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

    private buildLookupCommand(freqs: (number | null)[], gridIds: string[], startTime?: Date, endTime?: Date): string {
        const request = {
            freqs,
            gridIds,
            startTime,
            endTime
        }
        return `${LookupCommand.lookup.toString()}${JSON.stringify(request)}`;
    }

    private buildCommandLine(executablePath: string, options: TcpServerComponentOptions): string {
        let command = `${executablePath} -p ${this.options.port}`;
        return command;
    }

    private fireExecutable = (executablePath: string): Promise<boolean> => {
        const command = this.buildCommandLine(executablePath, this.options);
        return new Promise((resolve, reject) => {
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
            }, 500)
        })
    }

    async activateServer(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const {response, error} = await this.client.request(this.buildPingCommand());
            if (error || response !== "pong") {
                //We can't ping the server, so we'll try to fire up the executable:
                if (fs.existsSync(this.options.executablePath)) {
                    const fireExecutableResponse = await this.fireExecutable(this.options.executablePath).catch(e => {
                        reject(new Error(`Cannot reach server at port ${this.options.port}`))
                    });
                    if (fireExecutableResponse) {
                        resolve();
                    }
                } else {
                    reject(new Error(`Cannot reach server at port ${this.options.port}`))
                }
            } else {
                resolve();
            }
        })
    }

    toPascalCase(key: string, value: any) {
        if (value && typeof value === 'object') {
            for (var k in value) {
                if (/^[A-Z]/.test(k) && Object.hasOwnProperty.call(value, k)) {
                    value[k.charAt(0).toLowerCase() + k.substring(1)] = value[k];
                    delete value[k];
                }
            }
        }
        return value;
    }

    async lookup(freqs: (number | null)[], gridIds: string[], from?: Date, to?: Date): Promise<LookupResult[]> {
        await this.activateServer();
        const optionsGridIds = Object.keys(this.options.grids);
        if (optionsGridIds.length) {
            for (const id of optionsGridIds) {
                const loadGridCommand = this.buildLoadGridCommand(id, this.options.grids[id]);
                const {error} = await this.client.request(loadGridCommand);
                if (error) {
                    throw error;
                }
            }
        }
        const lookupCommand = this.buildLookupCommand(freqs, gridIds, from, to);
        const {responses} = await this.client.request(lookupCommand, (buffer: Buffer) => {
            const progress = parseFloat(buffer.toString().replace('Progress: ', ""));
            if (!isNaN(progress)) {
                this.lookupProgressEvent.trigger(progress);
            }
        });
        const response = responses[responses.length - 1]
        const r = JSON.parse(response, this.toPascalCase);
        return r;
    }
}

