import { ENFProcessor } from "./ENFProcessor";
export declare class ENFProcessorFactory {
    private executablePath;
    private tcpPort;
    static ExecutablePath(path: string): ENFProcessorFactory;
    ExecutablePath(path: string): ENFProcessorFactory;
    static Build(): Promise<ENFProcessor>;
    Build(): Promise<ENFProcessor>;
    TcpPort(tcpPort: number): ENFProcessorFactory;
}
