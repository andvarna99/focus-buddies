import type { Coat, Weather } from './ds.d'

export const MAX_NAME = 16
export const SESSION_TREATS = 3
const KEY = 'focus-buddy-profile-v1'

export type Accessory = 'none' | 'bow' | 'strawberry' | 'star'

export type Profile = {
  name: string
  coat: Coat
  accessory: Accessory
  owned: Accessory[]
  treats: number
  treatsEarned: number
  weather: Weather
  history: Record<string, { minutes: number; sessions: number }>
}

export const newProfile = (): Profile => ({
  name: 'Mochi',
  coat: 'pink',
  accessory: 'bow',
  owned: ['none', 'bow', 'strawberry'],
  treats: 0,
  treatsEarned: 0,
  weather: 'sunset',
  history: {},
})

export const dayKey = (ms: number) => {
  const date = new Date(ms)
  const part = (n: number) => String(n).padStart(2, '0')

  return `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}`
}

export const finishSession = (profile: Profile, minutes: number, now: number): Profile => {
  const key = dayKey(now)
  const day = profile.history[key] ?? { minutes: 0, sessions: 0 }

  return {
    ...profile,
    treats: profile.treats + SESSION_TREATS,
    treatsEarned: profile.treatsEarned + SESSION_TREATS,
    history: { ...profile.history, [key]: { minutes: day.minutes + minutes, sessions: day.sessions + 1 } },
  }
}

export const buy = (profile: Profile, item: Accessory, price: number): Profile =>
  profile.treats < price || profile.owned.includes(item)
    ? profile
    : { ...profile, treats: profile.treats - price, owned: [...profile.owned, item], accessory: item }

export const isValidName = (name: string, current: string) => {
  const trimmed = name.trim()

  return trimmed.length > 0 && trimmed.length <= MAX_NAME && trimmed !== current
}

// Counts back from today, or from yesterday if today has no session yet.
export const streak = (profile: Profile, now: number) => {
  const has = (ms: number) => (profile.history[dayKey(ms)]?.sessions ?? 0) > 0
  let day = has(now) ? now : localDayBefore(now)
  let count = 0

  while (has(day)) {
    count += 1
    day = localDayBefore(day)
  }

  return count
}

const localDayBefore = (ms: number) => {
  const date = new Date(ms)
  date.setDate(date.getDate() - 1)

  return date.getTime()
}

export const lastSevenDays = (profile: Profile, now: number) => {
  const days: { label: string; minutes: number; isToday: boolean }[] = []

  for (let back = 6; back >= 0; back--) {
    const date = new Date(now)
    date.setDate(date.getDate() - back)
    days.push({
      label: date.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1),
      minutes: profile.history[dayKey(date.getTime())]?.minutes ?? 0,
      isToday: back === 0,
    })
  }

  return days
}

export const totals = (profile: Profile) =>
  Object.values(profile.history).reduce(
    (sum, day) => ({ minutes: sum.minutes + day.minutes, sessions: sum.sessions + day.sessions }),
    { minutes: 0, sessions: 0 },
  )

export const formatMinutes = (minutes: number) =>
  minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`

// Browser storage can be unavailable, and an unreadable profile starts over.
export const loadProfile = (): Profile => {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) ?? 'null')

    return stored && typeof stored === 'object' ? { ...newProfile(), ...stored } : newProfile()
  } catch {
    return newProfile()
  }
}

export const saveProfile = (profile: Profile) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile))
  } catch {
    // The app keeps working for this session.
  }
}
