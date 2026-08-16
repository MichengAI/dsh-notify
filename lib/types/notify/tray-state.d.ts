export interface CompletedItem {
    sessionId: string;
    title: string;
}
export interface TrayState {
    pending: number;
    completed: CompletedItem[];
}
export declare function createEmptyTrayState(): TrayState;
export declare function trayStatePath(stateDir: string): string;
export declare function readTrayState(stateDir: string): TrayState;
export declare function writeTrayState(stateDir: string, state: TrayState): void;
export declare function addCompletedItem(state: TrayState, sessionId: string, title: string): TrayState;
export declare function shiftPending(state: TrayState, delta: number): TrayState;
