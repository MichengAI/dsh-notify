import type { IncomingMessage, ServerResponse } from 'node:http';
import { type NotifyConfig } from './config.ts';
import type { NotifyEngine } from './notify/engine.ts';
interface WebServerLike {
    register(route: {
        kind: 'exact';
        path: string;
        handler: (req: IncomingMessage, res: ServerResponse) => Promise<void>;
    }): () => void;
}
export interface SettingsScopeLike {
    get(): unknown;
    replace(next: NotifyConfig): Promise<void>;
}
export declare function registerNotifyRoutes(options: {
    webServer: WebServerLike;
    getConfig: () => NotifyConfig;
    getSettingsScope: () => SettingsScopeLike | null;
    engine: NotifyEngine;
}): Array<() => void>;
export {};
