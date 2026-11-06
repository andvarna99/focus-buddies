export type Timer = {
  minutes: number
  remainingSec: number
  endsAt: number | null
  done: boolean
  onBreak: boolean
}

export const newTimer = (minutes: number): Timer => ({
  minutes,
  remainingSec: minutes * 60,
  endsAt: null,
  done: false,
  onBreak: false,
})

export const isRunning = (timer: Timer) => timer.endsAt !== null

export const isPaused = (timer: Timer) =>
  !isRunning(timer) && !timer.done && timer.remainingSec < timer.minutes * 60

export const start = (timer: Timer, now: number): Timer => {
  const fresh = timer.done ? newTimer(timer.minutes) : timer

  return { ...fresh, onBreak: false, endsAt: now + fresh.remainingSec * 1000 }
}

export const pause = (timer: Timer, now: number): Timer =>
  timer.endsAt === null ? timer : { ...timer, remainingSec: secondsLeft(timer, now), endsAt: null }

export const toggleBreak = (timer: Timer, now: number): Timer => ({
  ...pause(timer, now),
  onBreak: !timer.onBreak,
})

// Counts from a fixed end time, so a throttled or sleeping window can't make the timer drift.
const secondsLeft = (timer: Timer, now: number) =>
  timer.endsAt === null ? timer.remainingSec : Math.max(0, Math.ceil((timer.endsAt - now) / 1000))

export const advance = (timer: Timer, now: number): { timer: Timer; justFinished: boolean } => {
  if (timer.endsAt === null) return { timer, justFinished: false }

  const remainingSec = secondsLeft(timer, now)

  return remainingSec > 0
    ? { timer: { ...timer, remainingSec }, justFinished: false }
    : { timer: { ...timer, remainingSec: 0, endsAt: null, done: true }, justFinished: true }
}
