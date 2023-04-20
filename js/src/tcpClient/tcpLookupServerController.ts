import fs from "fs";
import {ChildProcess, spawn} from "child_process";
import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import net from "net";
import {LookupCommand} from "../lookup/lookupCommand";

export class TcpLookupServerController {
    private readonly port: number;
    private readonly executablePath: string;
    private childProcess: ChildProcess | undefined;
    public serverMessageEvent:ENFEventBase<string> = new ENFEventBase<string>();
    private suspended: boolean = false;
    private grids: string[];

    constructor(port: number, executablePath: string, grids: string[]) {
        this.port = port;
        this.executablePath = executablePath;
        this.grids = grids;
    }

    private fireExecutable = (executablePath: string): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            const args = TcpLookupServerController.buildParameterArray(this.port, this.grids);
            console.log('args', JSON.stringify(args));
            this.childProcess = spawn(executablePath, args);
            if (this.childProcess.stdout) {
                this.childProcess.stdout.on('data', (data) => {
                    const dataString = data.toString();
                    this.serverMessageEvent.trigger(dataString);
                    if (dataString.indexOf("Server started on port ") > -1) {
                        resolve(true);
                    }
                    if (dataString.indexOf("Unhandled exception") > -1) {
                        reject(new Error(dataString));
                    }
                });
            }
            this.childProcess.on('error', (err) => {
                console.error('Lookup server error: ', err);
                reject(err);
            })
        })
    }
    
    private startInternal(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (fs.existsSync(this.executablePath)) {
                const fireExecutableResponse = await this.fireExecutable(this.executablePath).catch(e => {
                    if (!e) {
                        const message = `Cannot reach server at port ${this.port} - no error defined`;
                        console.error(message)
                        reject(new Error(message));
                    }
                    const message = `Cannot reach server at port ${this.port} because ${e.message || e.toString()}. \n Executable path: ${this.executablePath}`;
                    console.error(message)
                    reject(new Error(message))
                });
                if (fireExecutableResponse) {
                    resolve();
                } else {
                    const message = "Unable to launch TCP server executable";
                    console.error(message);
                    reject(new Error(message));
                }
            } else {
                const message = `No TCP Lookup executable found at ${this.executablePath}`;
                console.error(message)
                reject(new Error(message))
            }
        });
    }

    async start() {
        return this.startInternal();
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

    async suspend():Promise<void> {
        if (this.suspended) {
            return;
        }
        return new Promise(async resolve => {
            if (this.childProcess) {
                if (this.childProcess.stdin) {
                    const serverMessageHandler = (s: string | undefined) => {
                        if (s?.startsWith("Suspending server")) {
                            this.serverMessageEvent.removeHandler(serverMessageHandler);
                            this.suspended = true;
                            resolve();
                        }
                    }
                    this.serverMessageEvent.addHandler(serverMessageHandler);
                    this.childProcess.stdin.write('S\n');
                } else {
                    console.error("No STDIN on attached child process!")
                    throw new Error("No STDIN on attached child process!")
                }
            } else {
                console.error("No attached child process!")
                throw new Error("No attached child process!");
            }
        })
    }

    async resume():Promise<void> {
        if (!this.suspended) {
            return ;
        }
        return new Promise(async resolve => {
            if (this.childProcess) {
                if (this.childProcess.stdin) {
                    const serverMessageHandler = (s:string | undefined) => {
                        if (s?.startsWith("Resuming server")) {
                            this.serverMessageEvent.removeHandler(serverMessageHandler);
                            this.suspended = true;
                            resolve();
                        }
                    }
                    this.serverMessageEvent.addHandler(serverMessageHandler);
                    this.childProcess.stdin.write('S\n');
                } else {
                    console.error("No STDIN on attached child process!")
                    throw new Error("No STDIN on attached child process!")
                }
            } else {
                console.error("No attached child process!")
                throw new Error("No attached child process!");
            }
        })
    }

    static async ServerRunningOnPort(port: number):Promise<boolean> {
        return new Promise(resolve => {
            const socket = new net.Socket();
            const timeout = setTimeout(() => {
                console.error(`Timeout pinging server on port ${port}`);
                socket.destroy();
                resolve(false);
            },3000)
            socket.connect(port, '127.0.0.1', () => {
                socket.write(LookupCommand.ping.toString());
            });

            socket.on('data', async (data) => {
                const dataReceived = `${data}`;
                if (dataReceived === "pong") {
                    socket.destroy();
                    clearTimeout(timeout);
                    resolve(true);
                } else {
                    console.error(`Was expecting pong from process on port ${port} but got '${dataReceived}'`)
                    socket.destroy();
                    clearTimeout(timeout);
                    resolve(false);
                }
            });

            socket.on('error', (error) => {
                socket.destroy();
                clearTimeout(timeout);
                resolve(false)
            });
        })
        
    }

    static buildParameterArray(port: number, grids: string[]) {
        const parameterArray:string[] = [];
        parameterArray.push(`--port=${port}`);
        grids.forEach(g => {
            parameterArray.push(`--grids=${g}`)
        })
        return parameterArray;
    }
}