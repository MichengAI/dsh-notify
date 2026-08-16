import { type NotifyConfig } from '../config.ts';
export interface ConfigPayload {
    ok: boolean;
    config?: NotifyConfig;
    error?: string;
}
export declare function fetchNotifyConfig(): Promise<ConfigPayload>;
export declare function patchNotifyConfig(patch: Partial<NotifyConfig>): Promise<ConfigPayload>;
