interface ClientContext {
    slots: {
        inject(name: string, factory: () => unknown): void;
        register(meta: {
            name: string;
            id: string;
            order: number;
            label: string;
        }, view: unknown): unknown;
    };
}
export declare const name = "dsh-notify-client";
export declare const inject: string[];
export declare function apply(ctx: ClientContext): void;
export {};
