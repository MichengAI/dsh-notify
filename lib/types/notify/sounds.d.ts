import type { SoundId } from '../config.ts';
export interface SoundPreset {
    id: SoundId;
    label: string;
    desc: string;
    file: string;
}
export declare const SOUND_PRESETS: Record<SoundId, SoundPreset>;
export declare function listSoundPresets(): Array<Pick<SoundPreset, 'id' | 'label' | 'desc'>>;
export declare function resolveSoundPath(sound: SoundId, assetsDir?: string): string;
