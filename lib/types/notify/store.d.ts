import { type TrayState } from './tray-state.ts';
export interface NotifyStore {
    read(): TrayState;
    write(state: TrayState): Promise<void>;
    close(): Promise<void>;
}
interface DomainGlobalHandle {
    get(): unknown;
    set(value: unknown): Promise<void>;
}
interface DomainHandle {
    readonly global?: DomainGlobalHandle;
    close(): Promise<void>;
}
export interface StorageDomainLike {
    open(spec: unknown): Promise<DomainHandle>;
}
export declare function openNotifyStore(options: {
    stateDir: string;
    storageDomain?: StorageDomainLike;
    logger?: {
        info?(message: string): void;
        warn(message: string): void;
    };
}): Promise<NotifyStore>;
export declare function emptyNotifyStore(): NotifyStore;
export {};
