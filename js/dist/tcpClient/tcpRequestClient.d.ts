/// <reference types="node" />
export declare class TcpRequestClient {
    private readonly host;
    private readonly socket;
    private readonly port;
    private readonly timeout;
    private connected;
    constructor(port: number, host: string);
    private buildPingCommand;
    activateServer(executablePath: string, port: number): Promise<void>;
    private buildLoadGridCommand;
    loadGrids(grids: {
        [p: string]: string;
    }): Promise<void>;
    private buildCommandLine;
    fireExecutable: (executablePath: string, port: number) => Promise<boolean>;
    request(message: string, onUpdate?: (buffer: Buffer) => void): Promise<{
        response: string;
        responses: string[];
        error: Error | null;
    }>;
}
