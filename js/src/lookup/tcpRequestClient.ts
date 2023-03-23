import net from "net";

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
