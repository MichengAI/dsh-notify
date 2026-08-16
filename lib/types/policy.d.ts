import type { NotifyConfig } from './config.ts';
export type AskKind = 'permission' | 'question';
export declare function classifyAsk(intentKind: unknown): AskKind;
export declare function shouldNotifyComplete(config: NotifyConfig, focused: boolean): boolean;
export declare function shouldNotifyAsk(config: NotifyConfig, kind: AskKind): boolean;
