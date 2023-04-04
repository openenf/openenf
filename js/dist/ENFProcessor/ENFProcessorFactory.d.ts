import { ENFProcessor } from "./ENFProcessor";
export declare class ENFProcessorFactory {
    private executablePath;
    static ExecutablePath(path: string): ENFProcessorFactory;
    ExecutablePath(path: string): ENFProcessorFactory;
    static Build(): ENFProcessor;
    Build(): ENFProcessor;
}
