import fs from "fs";
import {ChildProcess, spawn} from "child_process";
import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";

export class TcpLookupServer {
    private readonly port: number;
    private readonly executablePath: string;
    private childProcess: ChildProcess | undefined;
    public serverMessageEvent:ENFEventBase<string> = new ENFEventBase<string>();

    constructor(port: number, executablePath: string) {
        this.port = port;
        this.executablePath = executablePath;
    }

    private fireExecutable = (executablePath: string, port:number): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            this.childProcess = spawn(executablePath, ["--port", port.toString(), "--nogrids"]);
            if (this.childProcess.stdout) {
                this.childProcess.stdout.on('data', (data) => {
                    const dataString = data.toString();
                    this.serverMessageEvent.trigger(dataString);
                    if (dataString.indexOf("Server started on port ") > -1) {
                        resolve(true);
                    }
                });
            }
            this.childProcess.on('error', (err) => {
                console.error('Lookup server error: ', err);
                reject(err);
            })
        })
    }

    start(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (fs.existsSync(this.executablePath)) {
                const fireExecutableResponse = await this.fireExecutable(this.executablePath, this.port).catch(e => {
                    if (!e) {
                        reject(new Error(`Cannot reach server at port ${this.port} - no error defined`));
                    }
                    reject(new Error(`Cannot reach server at port ${this.port} because ${e.message || e.toString()}`))
                });
                if (fireExecutableResponse) {
                    resolve();
                }
            } else {
                reject(new Error(`No TCP Lookup executable found at ${this.executablePath}`))
            }
        });
    }

    stop():Promise<void> {
        return new Promise(async resolve => {
            if (this.childProcess) {
                this.childProcess.on('close', () => {
                    resolve();
                })
                if (this.childProcess.stdin) {
                    this.childProcess.stdin.write('\n');
                } else {
                    console.warn('Unable to cleanly terminate TCP server. Killing process.')
                    this.childProcess?.kill()
                }
            } else {
                resolve();
            }
        })
    }
}