export type Mood = 'idle' | 'focus' | 'alert' | 'proud' | 'sleepy' | 'asleep'
export type Coat = 'pink' | 'lavender' | 'butter' | 'mint'
export type Weather = 'sunset' | 'rain'

export type MoodState = {
  onBreak?: boolean
  done?: boolean
  running?: boolean
  remainingSec?: number
  idleMs?: number
  justReturned?: boolean
}

export type Point = { x: number; y: number }

export type FocusBuddyDS = {
  palette: Record<string, string>
  coats: Record<Coat, { fur: string; shade: string; label: string }>
  timer: {
    presets: number[]
    customDefault: number
    alertAtSeconds: number
    treatsPerSession: number
    progressBlocks: number
    idleTimeoutMs: number
  }
  sprites: {
    room: {
      anchors: {
        buddy: Point
        hearts: Point[]
        zzz: Point
        alertBubble: Point & { size: number }
        waterGlass: Point
      }
    }
  }
  renderKitten(options: { mood?: Mood | 'blink'; coat?: Coat; accessory?: string; scale?: number; title?: string }): string
  renderRoom(options: { weather?: Weather; scale?: number; idPrefix?: string }): string
  renderHeart(scale?: number): string
  renderWaterGlass(scale?: number): string
  renderTreat(scale?: number): string
  moodFor(state: MoodState): Mood
  formatTime(seconds: number): string
  progressBlocks(remainingSec: number, totalSec: number): number
}

declare global {
  var FocusBuddyDS: FocusBuddyDS
}
