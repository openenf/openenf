import {GoertzelFilterStore} from "../goertzel/GoertzelFilterStore";
import {getDefaultExecutablePath} from "../tcpClient/tcpClientUtils";

export class TcpOptions {
    port: number = 49170;
    executablePath: string = getDefaultExecutablePath();
    host: string = "127.0.0.1";
    grids: { [gridId: string]: string; } = {};
    stdOutHandler: ((m: string|undefined) => void) | undefined;
}
