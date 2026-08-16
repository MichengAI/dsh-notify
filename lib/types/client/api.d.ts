import { type NotifyConfig, type SoundId } from '../config.ts';
export interface SoundOption {
    id: SoundId;
    label: string;
    desc?: string;
}
export interface ConfigPayload {
    ok: boolean;
    config?: NotifyConfig;
    sounds?: SoundOption[];
    error?: string;
}
export declare function fetchNotifyConfig(): Promise<ConfigPayload>;
export declare function patchNotifyConfig(patch: Partial<NotifyConfig>): Promise<ConfigPayload>;
export declare function previewNotifySound(sound: SoundId): Promise<void>;
