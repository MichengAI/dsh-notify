import { spawn, type ChildProcess } from 'node:child_process'
import path from 'node:path'

export function resolvePowerShellPath(): string {
  const root = process.env.SystemRoot
  if (root) return path.join(root, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
  return path.join('C:', 'WINDOWS', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
}

export function encodePayload(payload: unknown): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64')
}

export function spawnHiddenPowerShell(scriptPath: string, payload: unknown): ChildProcess {
  return spawn(resolvePowerShellPath(), [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy', 'Bypass',
    '-WindowStyle', 'Hidden',
    '-File', scriptPath,
    '-PayloadB64', encodePayload(payload),
  ], {
    stdio: 'ignore',
    windowsHide: true,
  })
}
