export declare const SOUND_IDS: readonly ["soft", "brisk", "calm", "crisp"];
export type SoundId = (typeof SOUND_IDS)[number];
export declare const COMPLETE_MODES: readonly ["toast", "badge-only"];
export type CompleteMode = (typeof COMPLETE_MODES)[number];
export declare const TIME_PATTERN: RegExp;
export declare const COMPLETE_MERGE_MS = 5000;
export declare const DEFAULT_MIN_INTERVAL_MS = 2500;
export declare const DEFAULT_WEB_PORT = 3080;
export declare const SETTINGS_NAMESPACE = "dsh-notify";
export declare const API_PREFIX = "/api/dsh-notify";
export declare const STATE_DIR_NAME = "dsh-notify";
export interface QuietHoursConfig {
    enabled: boolean;
    start: string;
    end: string;
}
export interface NotifyConfig {
    enabled: boolean;
    sound: SoundId;
    soundEnabled: boolean;
    quietHours: QuietHoursConfig;
    respectSystemDnd: boolean;
    completeMode: CompleteMode;
    completeMerge: boolean;
}
export declare function createDefaultConfig(): NotifyConfig;
export declare function normalizeConfig(raw: unknown): NotifyConfig;
export declare function mergeConfig(current: NotifyConfig, patch: unknown): NotifyConfig;
export declare function isNotifyDisabledByEnv(): boolean;
export declare function readMinIntervalMs(): number;
