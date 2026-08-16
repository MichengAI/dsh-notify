import { type NotifyConfig } from '../config.ts';
import type { NotifyStore } from './store.ts';
export interface NotifyEngineOptions {
    stateDir: string;
    portProvider: () => number;
    configProvider: () => NotifyConfig;
    logger?: {
        info(message: string): void;
        warn(message: string): void;
    };
}
export interface ToastRequest {
    title?: string;
    message?: string;
    detail?: string;
}
export interface NotifyEngine {
    showToast(request?: ToastRequest): void;
    notifyComplete(itemTitle: string, line2: string, line3: string): void;
    updatePending(delta: number): void;
    markCompleted(sessionId: string, title: string): void;
    setFocused(focused: boolean): void;
    isFocused(): boolean;
    log(message: string): void;
    attachStore(store: NotifyStore): void;
}
export declare function createNotifyEngine(options: NotifyEngineOptions): NotifyEngine;
