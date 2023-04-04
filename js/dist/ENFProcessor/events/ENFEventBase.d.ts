import { ENFEvent } from "./ENFEvent";
export declare class ENFEventBase<T> implements ENFEvent<T> {
    private handlers;
    addHandler(handler: {
        (data?: T): void;
    }): void;
    removeHandler(handler: {
        (data?: T): void;
    }): void;
    trigger(data?: T): void;
}
