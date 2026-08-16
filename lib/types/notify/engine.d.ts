import { type NotifyConfig, type SoundId } from '../config.ts';
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
    sound?: SoundId;
    soundOn?: boolean;
    ignoreQuiet?: boolean;
    force?: boolean;
}
export interface NotifyEngine {
    showToast(request?: ToastRequest): void;
    notifyComplete(itemTitle: string, line2: string, line3: string): void;
    previewSound(sound: SoundId): void;
    updatePending(delta: number): void;
    markCompleted(sessionId: string, title: string): void;
    setFocused(focused: boolean): void;
    isFocused(): boolean;
}
export declare function createNotifyEngine(options: NotifyEngineOptions): NotifyEngine;
