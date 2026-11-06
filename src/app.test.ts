import { describe, expect, it } from 'vitest'

import { GLYPHS, pixelText, statScale } from './digits'
import { buy, dayKey, finishSession, formatMinutes, isValidName, lastSevenDays, newProfile, streak, totals } from './profile'
import { advance, isPaused, isRunning, newTimer, pause, start, toggleBreak } from './timer'

const NOON = new Date(2026, 10, 6, 12).getTime()
const DAY = 86_400_000

describe('timer', () => {
  it('counts from a fixed end time, even after a long gap', () => {
    const running = start(newTimer(25), NOON)

    expect(advance(running, NOON + 60_000).timer.remainingSec).toBe(24 * 60)
    expect(advance(running, NOON + 90 * 60_000).justFinished).toBe(true)
  })

  it('finishes exactly once', () => {
    const { timer, justFinished } = advance(start(newTimer(1), NOON), NOON + 60_000)

    expect(justFinished).toBe(true)
    expect(timer.done).toBe(true)
    expect(advance(timer, NOON + 120_000).justFinished).toBe(false)
  })

  it('pauses and resumes with the time left', () => {
    const paused = pause(start(newTimer(25), NOON), NOON + 60_000)

    expect(isPaused(paused)).toBe(true)
    expect(paused.remainingSec).toBe(24 * 60)
    expect(advance(start(paused, NOON + DAY), NOON + DAY).timer.remainingSec).toBe(24 * 60)
  })

  it('a break pauses the timer, and starting again ends the break', () => {
    const resting = toggleBreak(start(newTimer(25), NOON), NOON + 60_000)

    expect(resting.onBreak).toBe(true)
    expect(isRunning(resting)).toBe(false)
    expect(start(resting, NOON + 120_000).onBreak).toBe(false)
  })

  it('starting after a finished session starts over', () => {
    const { timer } = advance(start(newTimer(15), NOON), NOON + 15 * 60_000)
    const again = start(timer, NOON + DAY)

    expect(again.done).toBe(false)
    expect(again.remainingSec).toBe(15 * 60)
  })
})

describe('profile', () => {
  it('a finished session pays 3 treats and is recorded', () => {
    const profile = finishSession(newProfile(), 25, NOON)

    expect(profile.treats).toBe(3)
    expect(profile.history[dayKey(NOON)]).toEqual({ minutes: 25, sessions: 1 })
    expect(totals(finishSession(profile, 15, NOON))).toEqual({ minutes: 40, sessions: 2 })
  })

  it('buying deducts treats and equips, and refuses what you can’t afford', () => {
    const rich = { ...newProfile(), treats: 7 }
    const bought = buy(rich, 'star', 6)

    expect(bought.treats).toBe(1)
    expect(bought.accessory).toBe('star')
    expect(buy(newProfile(), 'star', 6).owned).not.toContain('star')
    expect(buy(bought, 'star', 6).treats).toBe(1)
  })

  it('a name must change, not be blank, and fit in 16 characters', () => {
    expect(isValidName('Bun', 'Mochi')).toBe(true)
    expect(isValidName('Mochi', 'Mochi')).toBe(false)
    expect(isValidName('   ', 'Mochi')).toBe(false)
    expect(isValidName('x'.repeat(17), 'Mochi')).toBe(false)
  })

  it('a streak survives a day without a session yet, and breaks on a gap', () => {
    const profile = [NOON - 2 * DAY, NOON - DAY].reduce((p, day) => finishSession(p, 25, day), newProfile())

    expect(streak(profile, NOON)).toBe(2)
    expect(streak(finishSession(profile, 25, NOON), NOON)).toBe(3)
    expect(streak(profile, NOON + 2 * DAY)).toBe(0)
  })

  it('the week chart ends today', () => {
    const days = lastSevenDays(finishSession(newProfile(), 25, NOON), NOON)

    expect(days).toHaveLength(7)
    expect(days[6]).toMatchObject({ minutes: 25, isToday: true })
    expect(days[5].minutes).toBe(0)
  })

  it('formats minutes', () => {
    expect(formatMinutes(25)).toBe('25m')
    expect(formatMinutes(90)).toBe('1h 30m')
  })
})

describe('pixel digits', () => {
  it('every glyph has seven rows of one width', () => {
    for (const glyph of Object.values(GLYPHS)) {
      expect(glyph).toHaveLength(7)
      expect(new Set(glyph.map(row => row.length)).size).toBe(1)
    }
  })

  it('look-alike digits differ by at least three pixels', () => {
    const difference = (a: string, b: string) =>
      [...GLYPHS[a].join('')].filter((pixel, i) => pixel !== GLYPHS[b].join('')[i]).length

    for (const a of '0123456789') {
      for (const b of '0123456789') {
        if (a < b) expect(difference(a, b), `${a} vs ${b}`).toBeGreaterThanOrEqual(3)
      }
    }
  })

  it('draws at whole-number sizes', () => {
    expect(pixelText('25', 8)).toContain('width="104"')
    expect(pixelText('25', 8)).toContain('height="56"')
    expect(pixelText('25', 8)).toContain('currentColor')
  })

  it('long stats shrink a step', () => {
    expect(statScale('4h 45m')).toBe(3)
    expect(statScale('120h 30m')).toBe(2)
  })
})
