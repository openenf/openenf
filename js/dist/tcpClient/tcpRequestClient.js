"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TcpRequestClient = void 0;
const net_1 = __importDefault(require("net"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const lookupCommand_1 = require("../lookup/lookupCommand");
class TcpRequestClient {
    constructor(port, host) {
        this.timeout = 2000;
        this.connected = false;
        this.fireExecutable = (executablePath, port) => {
            const command = this.buildCommandLine(executablePath, port);
            return new Promise((resolve, reject) => {
                (0, child_process_1.exec)(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error: ${error.message}`);
                        reject(error);
                        return;
                    }
                    if (stderr) {
                        console.error(`stderr: ${stderr}`);
                        reject(new Error(stderr));
                        return;
                    }
                    if (stdout) {
                        console.log('stdout', stdout);
                    }
                });
                setTimeout(async () => {
                    const { response, error } = await this.request(this.buildPingCommand());
                    if (error || response !== "pong") {
                        reject(new Error('Timeout pinging server'));
                    }
                    else {
                        resolve(true);
                    }
                }, 500);
            });
        };
        this.port = port;
        this.host = host;
        this.socket = new net_1.default.Socket();
    }
    buildPingCommand() {
        return lookupCommand_1.LookupCommand.ping.toString();
    }
    async activateServer(executablePath, port) {
        return new Promise(async (resolve, reject) => {
            const { response, error } = await this.request(this.buildPingCommand());
            if (error || response !== "pong") {
                //We can't ping the server, so we'll try to fire up the executable:
                if (fs_1.default.existsSync(executablePath)) {
                    const fireExecutableResponse = await this.fireExecutable(executablePath, port).catch(e => {
                        if (!e) {
                            reject(new Error(`Cannot reach server at port ${port} - no error defined`));
                        }
                        reject(new Error(`Cannot reach server at port ${port} because ${e.message || e.toString()}`));
                    });
                    if (fireExecutableResponse) {
                        resolve();
                    }
                }
                else {
                    reject(new Error(`No TCP Lookup executable found at ${executablePath}`));
                }
            }
            else {
                resolve();
            }
        });
    }
    buildLoadGridCommand(id, path) {
        const request = {
            id,
            path
        };
        return `${lookupCommand_1.LookupCommand.loadGrid.toString()}${JSON.stringify(path)}`;
    }
    async loadGrids(grids) {
        const optionsGridIds = Object.keys(grids);
        if (optionsGridIds.length) {
            for (const id of optionsGridIds) {
                const loadGridCommand = this.buildLoadGridCommand(id, grids[id]);
                const { error } = await this.request(loadGridCommand);
                if (error) {
                    throw error;
                }
            }
        }
    }
    buildCommandLine(executablePath, port) {
        let command = `"${executablePath}" --port ${port} --nogrids`;
        return command;
    }
    request(message, onUpdate) {
        this.connected = false;
        const self = this;
        return new Promise(resolve => {
            let wholeMessage = "";
            const responses = [];
            setTimeout(() => {
                if (!this.connected) {
                    resolve({ response: wholeMessage, responses, error: new Error(`Timeout after ${this.timeout} ms`) });
                }
            }, this.timeout);
            const socket = this.socket;
            const errorHandler = ((e) => {
                resolve({ response: wholeMessage, responses, error: e });
            });
            socket.on('error', errorHandler);
            socket.connect(this.port, this.host, function () {
                self.connected = true;
                socket.write(message);
            });
            const newDataHandler = (buffer) => {
                if (onUpdate) {
                    onUpdate(buffer);
                }
                wholeMessage += buffer;
                responses.push(buffer.toString());
            };
            socket.on('data', newDataHandler);
            const closeHandler = (hadError) => {
                socket.removeListener('data', newDataHandler);
                socket.removeListener('close', closeHandler);
                socket.removeListener('error', errorHandler);
                resolve({ response: wholeMessage, responses, error: socket.errored });
            };
            socket.on('close', closeHandler);
        });
    }
}
exports.TcpRequestClient = TcpRequestClient;
