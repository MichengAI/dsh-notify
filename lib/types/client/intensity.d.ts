import type { NotifyConfig, SoundId } from '../config.ts';
export type NotifyIntensity = 'badge' | 'banner' | 'full';
export declare function intensityOf(config: Pick<NotifyConfig, 'completeMode' | 'soundEnabled'>): NotifyIntensity;
export declare function patchFromIntensity(value: NotifyIntensity): Pick<NotifyConfig, 'completeMode' | 'soundEnabled'>;
export declare function isSoundId(value: string, ids: readonly SoundId[]): value is SoundId;
