import type { QuietHoursConfig } from '../config.ts';
/** 判断当前时刻是否落在免打扰窗口内，支持跨午夜。 */
export declare function isInQuietHours(quietHours: QuietHoursConfig, now?: Date): boolean;
