import './app.css'

import { pixelText } from './digits'
import { DS } from './ds'
import type { Coat, Mood, Weather } from './ds.d'
import { buy, finishSession, isValidName, loadProfile, saveProfile } from './profile'
import type { Accessory, Profile } from './profile'
import { advance, isPaused, isRunning, newTimer, pause, start, toggleBreak } from './timer'
import type { Timer } from './timer'
import { kitten, miniLabel, MOOD_TEXT, render, statusLine, TIMER_SCALE, timerParts, toggleLabel, WARDROBE } from './views'
import type { Size, Tab, ViewState } from './views'
import { fitPageToWindow, resizeTo, SHELL, startDrag, tuckAway } from './window'

const CELEBRATE_MS = 600
const BLINK_MS = 120
const CONFIRM_MS = 2000

const root = document.getElementById('app')!
document.documentElement.dataset.shell = SHELL

let size: Size = 'cozy'
let tab: Tab = 'buddy'
let timer: Timer = newTimer(25)
let profile: Profile = loadProfile()
let draftName = profile.name
let savedName = false
let copiedCode = false
let isCelebrating = false
let lastActivity = Date.now()
let shownMood: Mood | null = null

const currentMood = (now: number) =>
  DS.moodFor({
    onBreak: timer.onBreak,
    done: timer.done,
    running: isRunning(timer),
    remainingSec: timer.remainingSec,
    idleMs: isRunning(timer) || isPaused(timer) ? 0 : now - lastActivity,
  })

const viewState = (): ViewState => {
  const now = Date.now()

  return { size, tab, timer, profile, mood: currentMood(now), now, isCelebrating, draftName, savedName, copiedCode }
}

const focusKey = (element: Element | null) => {
  const html = element as HTMLElement | null

  return html?.dataset?.action ? `[data-action="${html.dataset.action}"]${html.dataset.arg ? `[data-arg="${html.dataset.arg}"]` : ''}` : html?.id ? `#${html.id}` : null
}

const draw = () => {
  const key = focusKey(document.activeElement)
  const state = viewState()
  shownMood = state.mood
  root.innerHTML = render(state)

  if (key) root.querySelector<HTMLElement>(key)?.focus()
}

const setText = (selector: string, text: string) => {
  const element = root.querySelector(selector)

  if (element && element.textContent !== text) element.textContent = text
}

// Skips the redraw when a digit hasn't changed, which is most of the time for the minutes.
const setDigits = (selector: string, text: string) => {
  const element = root.querySelector<HTMLElement>(selector)

  if (element && element.dataset.value !== text) {
    element.dataset.value = text
    element.innerHTML = pixelText(text, TIMER_SCALE[size])
  }
}

// Updates only what changes each second, so the colon's heartbeat and keyboard focus keep going.
const refresh = () => {
  const state = viewState()

  if (state.mood !== shownMood) {
    draw()
    return
  }

  const { blocks, percent, time } = timerParts(timer)
  setDigits('[data-minutes]', time[0])
  setDigits('[data-seconds]', time[1])
  setText('[data-time-text]', `${time[0]}:${time[1]}`)
  setText('[data-status]', statusLine(timer))
  setText('[data-mood-text]', MOOD_TEXT[state.mood])
  setText('[data-mini-label]', miniLabel(state))
  setText('[data-toggle]', toggleLabel(timer))

  const bar = root.querySelector<HTMLElement>('[data-progress]')

  if (bar && bar.getAttribute('aria-valuenow') !== String(percent)) {
    bar.innerHTML = blocks
    bar.setAttribute('aria-valuenow', String(percent))
  }
}

const setProfile = (next: Profile) => {
  profile = next
  saveProfile(profile)
}

// A soft two-note chime, made in code so it works offline with no sound files.
const chime = () => {
  try {
    const audio = new AudioContext()

    ;[659.25, 880].forEach((frequency, i) => {
      const at = audio.currentTime + i * 0.22
      const note = audio.createOscillator()
      const gain = audio.createGain()
      note.frequency.value = frequency
      gain.gain.setValueAtTime(0, at)
      gain.gain.linearRampToValueAtTime(0.12, at + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, at + 0.9)
      note.connect(gain).connect(audio.destination)
      note.start(at)
      note.stop(at + 0.95)
    })
  } catch {
    // The session still finishes without a chime.
  }
}

const celebrate = () => {
  isCelebrating = true
  draw()
  window.setTimeout(() => {
    isCelebrating = false
    draw()
  }, CELEBRATE_MS)
}

const petBuddy = () => {
  const roomElement = root.querySelector('[data-room]')
  const sprite = root.querySelector<HTMLElement>('[data-buddy-sprite]')

  if (sprite && !isRunning(timer)) {
    sprite.innerHTML = kitten(viewState(), roomElement ? (size === 'big' ? 3 : 2) : 2, 'proud')
    window.setTimeout(draw, 900)
  }
}

const flash = (set: (value: boolean) => void) => {
  set(true)
  draw()
  window.setTimeout(() => {
    set(false)
    draw()
  }, CONFIRM_MS)
}

const saveName = () => {
  if (!isValidName(draftName, profile.name)) return

  draftName = draftName.trim()
  setProfile({ ...profile, name: draftName })
  flash(value => {
    savedName = value
  })
}

const wear = (id: string) => {
  const item = WARDROBE.find(entry => entry.id === id)

  if (!item?.isDrawn) return

  const accessory = id as Accessory
  setProfile(profile.owned.includes(accessory) ? { ...profile, accessory } : buy(profile, accessory, item.price))
}

const copyCode = async () => {
  const code = root.querySelector('.fb-invite-code')?.textContent ?? ''

  try {
    await navigator.clipboard.writeText(code)
    flash(value => {
      copiedCode = value
    })
  } catch {
    // The code stays on screen to type by hand.
  }
}

const ACTIONS: Record<string, (arg: string) => void> = {
  toggle: () => {
    timer = isRunning(timer) ? pause(timer, Date.now()) : start(timer, Date.now())
  },
  break: () => {
    timer = toggleBreak(timer, Date.now())
  },
  reset: () => {
    timer = newTimer(timer.minutes)
  },
  preset: arg => {
    timer = newTimer(Number(arg))
  },
  size: arg => {
    size = arg as Size
    void resizeTo(size)
  },
  tuck: () => {
    void tuckAway()
  },
  tab: arg => {
    tab = arg as Tab
  },
  coat: arg => setProfile({ ...profile, coat: arg as Coat }),
  wear,
  weather: arg => setProfile({ ...profile, weather: arg as Weather }),
  'save-name': saveName,
  'copy-code': () => void copyCode(),
}

root.addEventListener('click', event => {
  const target = (event.target as Element).closest<HTMLElement>('[data-action]')
  const action = target?.dataset.action

  if (!target || !action) return

  lastActivity = Date.now()

  if (action === 'pet') {
    petBuddy()
    return
  }

  ACTIONS[action]?.(target.dataset.arg ?? '')
  draw()
})

root.addEventListener('input', event => {
  const input = event.target as HTMLInputElement

  if (!input.matches('[data-name-input]')) return

  draftName = input.value
  setText('[data-name-hint]', `${draftName.length}/16 · friends see this name`)
  root.querySelector<HTMLButtonElement>('[data-save-name]')!.disabled = !isValidName(draftName, profile.name)
})

root.addEventListener('keydown', event => {
  const target = event.target as HTMLElement

  if (event.key === 'Enter' && target.matches('[data-name-input]')) {
    saveName()
  } else if (target.matches('[role="tab"]') && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
    const tabs = [...root.querySelectorAll<HTMLElement>('[role="tab"]')]
    const step = event.key === 'ArrowRight' ? 1 : -1
    const next = tabs[(tabs.indexOf(target) + step + tabs.length) % tabs.length]
    tab = next.dataset.arg as Tab
    draw()
    root.querySelector<HTMLElement>(`[role="tab"][data-arg="${tab}"]`)?.focus()
  }
})

root.addEventListener('mousedown', event => {
  const target = event.target as Element

  if (event.button === 0 && target.closest('[data-drag]') && !target.closest('button, a, input')) {
    void startDrag()
  }
})

window.setInterval(() => {
  const now = Date.now()
  const result = advance(timer, now)
  timer = result.timer

  if (result.justFinished) {
    setProfile(finishSession(profile, timer.minutes, now))
    chime()
    celebrate()
  } else {
    refresh()
  }
}, 1000)

// Blinks only while idle, at an uneven pace of 4 seconds ± 1.5.
const scheduleBlink = () => {
  window.setTimeout(() => {
    const sprite = root.querySelector<HTMLElement>('[data-buddy-sprite]')
    const state = viewState()

    if (sprite && state.mood === 'idle' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const scale = size === 'big' ? 3 : 2
      sprite.innerHTML = kitten(state, scale, 'blink')
      window.setTimeout(() => {
        if (viewState().mood === 'idle') sprite.innerHTML = kitten(viewState(), scale)
      }, BLINK_MS)
    }

    scheduleBlink()
  }, 2500 + Math.random() * 3000)
}

// Sets the size again at launch, because some Linux window managers open the window a little taller.
void resizeTo(size).then(() => fitPageToWindow(size))
draw()
scheduleBlink()
