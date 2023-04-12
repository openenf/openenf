export interface ENFEvent<T> {
    addHandler(handler: {
        (data?: T): void;
    }): void;
    removeHandler(handler: {
        (data?: T): void;
    }): void;
}
