import {ENFEvent} from "./ENFEvent";

export class ENFEventBase<T> implements ENFEvent<T> {
    private handlers: { (data?: T): void; }[] = [];

    public addHandler(handler: { (data?: T): void }): void {
        this.handlers.push(handler);
    }

    public removeHandler(handler: { (data?: T): void }): void {
        this.handlers = this.handlers.filter(h => h !== handler);
    }

    public trigger(data?: T) {
        this.handlers.slice(0).forEach(h => h(data));
    }
}