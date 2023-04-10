import {GoertzelFilterStore} from "../goertzel/GoertzelFilterStore";

export class TcpServerComponentOptions {
    port: number = 49170;
    executablePath: string = "";
    host: string = "127.0.0.1";
    grids: { [gridId: string]: string; } = {};
    stdOutHandler: ((m: string|undefined) => void) | undefined;
}
