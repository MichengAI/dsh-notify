import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const ASSETS = path.join(ROOT, 'assets')
mkdirSync(ASSETS, { recursive: true })

const SAMPLE_RATE = 44100

function writeWav(samples) {
  const dataSize = samples.length * 2
  const buffer = Buffer.alloc(44 + dataSize)
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(SAMPLE_RATE, 24)
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index] ?? 0))
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + index * 2)
  }
  return buffer
}

function tone(freq, durationMs, gain, attackMs, releaseMs) {
  const total = Math.round(SAMPLE_RATE * durationMs / 1000)
  const attack = Math.round(SAMPLE_RATE * attackMs / 1000)
  const release = Math.round(SAMPLE_RATE * releaseMs / 1000)
  const samples = new Array(total).fill(0)
  for (let index = 0; index < total; index += 1) {
    const envAttack = attack === 0 ? 1 : Math.min(1, index / attack)
    const envRelease = release === 0 ? 1 : Math.min(1, (total - index) / release)
    samples[index] = Math.sin(2 * Math.PI * freq * index / SAMPLE_RATE) * gain * envAttack * envRelease
  }
  return samples
}

function concat(parts) {
  return parts.flat()
}

function silence(ms) {
  return new Array(Math.round(SAMPLE_RATE * ms / 1000)).fill(0)
}

const presets = {
  'notify-soft.wav': concat([
    tone(392, 160, 0.28, 12, 80),
    silence(40),
    tone(523.25, 220, 0.24, 16, 110),
  ]),
  'notify-brisk.wav': concat([
    tone(440, 90, 0.26, 6, 30),
    silence(20),
    tone(554.37, 90, 0.26, 6, 30),
    silence(20),
    tone(659.25, 120, 0.28, 6, 50),
  ]),
  'notify-calm.wav': concat([
    tone(261.63, 280, 0.2, 30, 140),
    silence(50),
    tone(329.63, 360, 0.18, 40, 180),
  ]),
  'notify-crisp.wav': concat([
    tone(880, 70, 0.3, 3, 20),
    silence(16),
    tone(1174.66, 90, 0.26, 3, 30),
  ]),
}

for (const [name, samples] of Object.entries(presets)) {
  writeFileSync(path.join(ASSETS, name), writeWav(samples))
}

console.log(`[dsh-notify] 已生成 ${Object.keys(presets).length} 个提示音`)
