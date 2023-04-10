export declare class TcpServerComponentOptions {
    port: number;
    executablePath: string;
    host: string;
    grids: {
        [gridId: string]: string;
    };
    stdOutHandler: ((m: string | undefined) => void) | undefined;
}
