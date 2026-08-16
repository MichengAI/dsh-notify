export declare const COMPLETE_MODES: readonly ["toast", "badge-only"];
export type CompleteMode = (typeof COMPLETE_MODES)[number];
export declare const COMPLETE_WHEN: readonly ["always", "unfocused", "off"];
export type CompleteWhen = (typeof COMPLETE_WHEN)[number];
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
export interface NotifyChannels {
    complete: CompleteWhen;
    permission: boolean;
    question: boolean;
}
export interface NotifyConfig {
    enabled: boolean;
    quietHours: QuietHoursConfig;
    respectSystemDnd: boolean;
    completeMode: CompleteMode;
    completeMerge: boolean;
    channels: NotifyChannels;
}
export declare function createDefaultChannels(): NotifyChannels;
export declare function createDefaultConfig(): NotifyConfig;
export declare function normalizeConfig(raw: unknown): NotifyConfig;
export declare function mergeConfig(current: NotifyConfig, patch: unknown): NotifyConfig;
export declare function isNotifyDisabledByEnv(): boolean;
export declare function readMinIntervalMs(): number;
