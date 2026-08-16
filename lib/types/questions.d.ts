import type { NotifyConfig } from './config.ts';
import type { NotifyEngine } from './notify/engine.ts';
export declare function wrapUserQuestions(ctx: {
    get(name: string): unknown;
    logger: {
        warn(message: string): void;
    };
}, engine: NotifyEngine, getConfig: () => NotifyConfig): (() => void) | null;
