import { type ChildProcess } from 'node:child_process';
export declare function resolvePowerShellPath(): string;
export declare function encodePayload(payload: unknown): string;
export declare function spawnHiddenPowerShell(scriptPath: string, payload: unknown): ChildProcess;
