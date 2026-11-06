import { pixelText, statScale } from './digits'
import { DS } from './ds'
import type { Mood } from './ds.d'
import { dayKey, formatMinutes, isValidName, lastSevenDays, MAX_NAME, streak, totals } from './profile'
import type { Accessory, Profile } from './profile'
import { isPaused, isRunning } from './timer'
import type { Timer } from './timer'

export type Size = 'mini' | 'cozy' | 'big'
export type Tab = 'buddy' | 'room' | 'friends' | 'stats'

export type ViewState = {
  size: Size
  tab: Tab
  timer: Timer
  profile: Profile
  mood: Mood
  now: number
  isCelebrating: boolean
  draftName: string
  savedName: boolean
  copiedCode: boolean
}

const INVITE_CODE = 'MOCHI-7K2'
const ROOM_THEME = 'Cozy window'
const TABS: { id: Tab; label: string }[] = [
  { id: 'buddy', label: 'Buddy' },
  { id: 'room', label: 'Room' },
  { id: 'friends', label: 'Friends' },
  { id: 'stats', label: 'Stats' },
]

export const MOOD_TEXT: Record<Mood, string> = {
  idle: 'Ready when you are',
  focus: 'Focusing with you',
  alert: 'Almost there!',
  proud: 'So proud of you',
  sleepy: 'Stretching…',
  asleep: 'Napping',
}

export const WARDROBE: { id: Accessory | 'cardigan' | 'frog'; name: string; price: number; isDrawn: boolean }[] = [
  { id: 'none', name: 'Nothing', price: 0, isDrawn: true },
  { id: 'bow', name: 'Lavender bow', price: 0, isDrawn: true },
  { id: 'strawberry', name: 'Strawberry hat', price: 0, isDrawn: true },
  { id: 'star', name: 'Star clip', price: 6, isDrawn: true },
  { id: 'cardigan', name: 'Tiny cardigan', price: 15, isDrawn: false },
  { id: 'frog', name: 'Frog costume', price: 20, isDrawn: false },
]

export const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, char => `&#${char.charCodeAt(0)};`)

const icon = (body: string, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`

const ICONS = {
  mini: icon('<rect x="3" y="14" width="18" height="6" rx="2"/><path d="M12 4v6M9 7l3 3 3-3"/>'),
  cozy: icon('<rect x="6" y="3" width="12" height="18" rx="2"/>'),
  big: icon('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
  tuck: icon('<path d="M6 8l6 6 6-6"/><path d="M5 19h14"/>'),
  breakTime: icon('<path d="M4 9h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z"/><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16"/>', 22),
  reset: icon('<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/>', 22),
  pause: icon('<path d="M9 5v14M15 5v14"/>', 22),
  play: icon('<path d="M7 4l12 8-12 8z"/>', 22),
  lock: icon('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', 14),
}

const GRIP =
  '<svg class="fb-titlebar__grip" width="12" height="20" viewBox="0 0 12 20" aria-hidden="true"><g fill="currentColor"><circle cx="3" cy="4" r="1.6"/><circle cx="9" cy="4" r="1.6"/><circle cx="3" cy="10" r="1.6"/><circle cx="9" cy="10" r="1.6"/><circle cx="3" cy="16" r="1.6"/><circle cx="9" cy="16" r="1.6"/></g></svg>'

export const kitten = (state: ViewState, scale: number, mood: Mood | 'blink' = state.mood) =>
  DS.renderKitten({
    mood,
    coat: state.profile.coat,
    accessory: state.profile.accessory,
    scale,
    title: `${state.profile.name}, ${mood === 'blink' ? 'blinking' : MOOD_TEXT[mood].toLowerCase()}`,
  })

const buddyClass = (state: ViewState) =>
  state.isCelebrating ? 'fb-anim-wiggle' : state.mood === 'idle' ? 'app-breathe' : ''

const layer = (x: number, y: number, html: string, className = '', delay = '') =>
  `<div class="room__layer ${className}" style="left:${x}px;top:${y}px${delay ? `;animation-delay:${delay}` : ''}">${html}</div>`

export const room = (state: ViewState, scale: number) => {
  const { anchors } = DS.sprites.room
  const overlays: string[] = []

  if (state.mood === 'proud') {
    anchors.hearts.forEach((heart, i) => {
      overlays.push(layer(heart.x * scale, heart.y * scale, DS.renderHeart(scale), 'fb-anim-float', `${i * 0.8}s`))
    })
  } else if (state.mood === 'sleepy') {
    overlays.push(layer(anchors.waterGlass.x * scale, anchors.waterGlass.y * scale, DS.renderWaterGlass(scale)))
  } else if (state.mood === 'alert') {
    overlays.push(layer(anchors.alertBubble.x * scale, anchors.alertBubble.y * scale, '<div class="room__alert" aria-hidden="true">!</div>', 'fb-anim-bob'))
  } else if (state.mood === 'asleep') {
    overlays.push(layer(anchors.zzz.x * scale, anchors.zzz.y * scale, '<div class="room__zzz" aria-hidden="true">z z z</div>', 'fb-anim-bob'))
  }

  const buddy = `<button type="button" class="buddy-button" data-action="pet" data-buddy aria-label="Pet ${escapeHtml(state.profile.name)}"><span class="${buddyClass(state)}" style="display:block" data-buddy-sprite>${kitten(state, scale)}</span></button>`

  return `<div class="fb-room-frame"><div class="room" data-room style="width:${160 * scale}px;height:${90 * scale}px">${DS.renderRoom({ weather: state.profile.weather, scale, idPrefix: `room-${scale}` })}${layer(anchors.buddy.x * scale, anchors.buddy.y * scale, buddy)}${overlays.join('')}</div></div>`
}

const treats = (profile: Profile) =>
  `<span class="fb-treats" aria-label="${profile.treats} treats">${DS.renderTreat(2)}${profile.treats}</span>`

const iconButton = (action: string, arg: string, label: string, svg: string, desktopOnly = false) =>
  `<button type="button" class="fb-icon-btn" data-action="${action}" data-arg="${arg}" aria-label="${label}"${desktopOnly ? ' data-desktop-only' : ''}>${svg}</button>`

export const TIMER_SCALE: Record<Size, number> = { mini: 4, cozy: 8, big: 8 }

const digits = (timer: Timer, scale: number) => {
  const [minutes, seconds] = DS.formatTime(timer.remainingSec).split(':')

  return `<span class="fb-visually-hidden" data-time-text>${minutes}:${seconds}</span><span class="pixel-timer" aria-hidden="true"><span data-minutes>${pixelText(minutes, scale)}</span><span class="fb-timer__colon">${pixelText(':', scale)}</span><span data-seconds>${pixelText(seconds, scale)}</span></span>`
}

const stat = (value: string, label: string) =>
  `<div class="fb-stat"><span class="fb-stat__value" role="img" aria-label="${value}">${pixelText(value, statScale(value))}</span><span class="fb-stat__label">${label}</span></div>`

const progress = (timer: Timer) => {
  const filled = DS.progressBlocks(timer.remainingSec, timer.minutes * 60)
  const blocks = Array.from({ length: DS.timer.progressBlocks }, (_, i) =>
    `<span class="fb-progress__block"${i < filled ? ' data-filled' : ''}></span>`,
  ).join('')

  return { blocks, percent: Math.round((filled / DS.timer.progressBlocks) * 100) }
}

export const statusLine = (timer: Timer) => {
  if (timer.onBreak) return 'Break time: drink some water!'
  if (timer.done) return `Session done · +${DS.timer.treatsPerSession} treats`
  if (isRunning(timer)) return `Focusing · ${timer.minutes} min`
  if (isPaused(timer)) return 'Paused'

  return 'Pick a length and press start'
}

export const miniLabel = (state: ViewState) => {
  const { timer, profile } = state

  if (timer.onBreak) return 'Break time'
  if (timer.done) return `Session done · +${DS.timer.treatsPerSession} treats`
  if (isRunning(timer)) return `Focusing · ${timer.minutes} min`
  if (isPaused(timer)) return `Paused · ${profile.name} is waiting`

  return `Ready · ${timer.minutes} min`
}

export const toggleLabel = (timer: Timer) =>
  isRunning(timer) ? 'Pause' : timer.done ? 'Again' : isPaused(timer) ? 'Resume' : 'Start'

const chips = (timer: Timer) => {
  const options = [
    ...DS.timer.presets.map(min => ({ min, label: `${min} min` })),
    { min: DS.timer.customDefault, label: 'Custom' },
  ]

  return options
    .map(({ min, label }) => `<button type="button" class="fb-chip" data-action="preset" data-arg="${min}" aria-pressed="${timer.minutes === min}">${label}</button>`)
    .join('')
}

const cozyView = (state: ViewState) => {
  const { timer, profile } = state
  const bar = progress(timer)

  return `<div class="fb-widget fb-widget--cozy">
    <div class="fb-titlebar" data-drag>
      ${GRIP}
      <div class="fb-titlebar__id">
        <span class="fb-titlebar__name">${escapeHtml(profile.name)}</span>
        <span class="fb-titlebar__status" data-mood-text>${MOOD_TEXT[state.mood]}</span>
      </div>
      ${treats(profile)}
      ${iconButton('size', 'mini', 'Switch to mini size', ICONS.mini, true)}
      ${iconButton('size', 'big', 'Open big view', ICONS.big)}
      ${iconButton('tuck', '', 'Tuck widget away', ICONS.tuck, true)}
    </div>
    ${room(state, 2)}
    <div class="fb-timer">
      <div class="fb-timer__digits" role="timer" aria-label="Time left">${digits(timer, TIMER_SCALE.cozy)}</div>
      <div class="fb-progress" data-progress role="progressbar" aria-label="Session progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${bar.percent}">${bar.blocks}</div>
      <div class="fb-timer__status" data-status>${statusLine(timer)}</div>
    </div>
    <div class="fb-chip-group" role="group" aria-label="Session length">${chips(timer)}</div>
    <div class="actions">
      <button type="button" class="fb-btn fb-btn--primary" data-action="toggle" data-toggle>${toggleLabel(timer)}</button>
      <button type="button" class="fb-btn fb-btn--square" data-action="break" aria-label="Take a break" aria-pressed="${timer.onBreak}">${ICONS.breakTime}</button>
      <button type="button" class="fb-btn fb-btn--square" data-action="reset" aria-label="Reset timer">${ICONS.reset}</button>
    </div>
  </div>`
}

const miniView = (state: ViewState) => {
  const { timer } = state
  const running = isRunning(timer)
  const label = running ? 'Pause' : toggleLabel(timer)

  return `<div class="fb-widget fb-widget--mini" data-drag>
    <div class="fb-buddy-tile"><button type="button" class="buddy-button buddy-button--tile" data-action="pet" data-buddy aria-label="Pet ${escapeHtml(state.profile.name)}"><span class="${buddyClass(state)}" style="display:block" data-buddy-sprite>${kitten(state, 2)}</span></button></div>
    <div class="mini__body fb-timer--mini">
      <div class="fb-timer__digits" role="timer" aria-label="Time left">${digits(timer, TIMER_SCALE.mini)}</div>
      <div class="mini__label"><span class="mini__dot" aria-hidden="true"></span><span data-mini-label>${escapeHtml(miniLabel(state))}</span></div>
    </div>
    <div class="mini__actions">
      <button type="button" class="fb-btn fb-btn--mini" data-action="toggle" data-toggle-icon aria-label="${label}">${running ? ICONS.pause : ICONS.play}</button>
      ${iconButton('size', 'cozy', 'Switch to cozy size', ICONS.cozy)}
    </div>
  </div>`
}

const buddyPanel = (state: ViewState) => {
  const { profile, draftName, savedName } = state
  const swatches = (Object.keys(DS.coats) as (keyof typeof DS.coats)[])
    .map(coat => `<button type="button" class="fb-swatch" style="--fb-swatch:${DS.coats[coat].fur}" data-action="coat" data-arg="${coat}" aria-label="${DS.coats[coat].label} coat" aria-pressed="${profile.coat === coat}"></button>`)
    .join('')
  const items = WARDROBE.map(item => {
    const isOwned = profile.owned.includes(item.id as Accessory)
    const isWorn = profile.accessory === item.id
    const canBuy = item.isDrawn && profile.treats >= item.price
    const status = isWorn ? 'Wearing' : isOwned ? 'Owned' : `${ICONS.lock} ${item.price} treats`

    return `<button type="button" class="fb-item" data-action="wear" data-arg="${item.id}" aria-pressed="${isWorn}"${isOwned || canBuy ? '' : ' disabled'}>
      <span class="fb-item__name">${item.name}</span>
      <span class="fb-item__status">${status}</span>
    </button>`
  }).join('')

  return `<div class="fb-field">
      <label class="fb-section-label" for="buddy-name">Name</label>
      <div class="fb-field__row">
        <input class="fb-input" id="buddy-name" data-name-input maxlength="${MAX_NAME}" value="${escapeHtml(draftName)}" autocomplete="off" spellcheck="false">
        <button type="button" class="fb-btn fb-btn--flat" data-action="save-name" data-save-name${isValidName(draftName, profile.name) ? '' : ' disabled'}>${savedName ? 'Saved!' : 'Save'}</button>
      </div>
      <span class="fb-caption" data-name-hint>${draftName.length}/${MAX_NAME} · friends see this name</span>
    </div>
    <div class="section"><span class="fb-section-label">Coat</span><div class="swatches">${swatches}</div></div>
    <div class="section"><span class="fb-section-label">Accessories</span><div class="wardrobe">${items}</div></div>`
}

const roomPanel = (state: ViewState) => {
  const { weather } = state.profile

  return `<div class="section">
      <span class="fb-section-label">Themes</span>
      <div class="wardrobe">
        <button type="button" class="fb-item" aria-pressed="true"><span class="fb-item__name">${ROOM_THEME}</span><span class="fb-item__status">Current</span></button>
        <button type="button" class="fb-item" disabled><span class="fb-item__name">Bakery</span><span class="fb-item__status">${ICONS.lock} 10 treats</span></button>
        <button type="button" class="fb-item" disabled><span class="fb-item__name">Cloud bedroom</span><span class="fb-item__status">${ICONS.lock} 18 treats</span></button>
      </div>
      <span class="fb-caption">The Bakery and Cloud bedroom are still being drawn.</span>
    </div>
    <div class="section">
      <span class="fb-section-label">Window</span>
      <button type="button" class="fb-switch" role="switch" aria-checked="false" disabled>
        <span class="fb-switch__text"><span class="fb-switch__title">Match my real weather</span><span class="fb-caption">Coming in a later build</span></span>
        <span class="fb-switch__track"><span class="fb-switch__thumb"></span></span>
      </button>
      <div class="fb-chip-group" style="--fb-chip-cols:2" role="group" aria-label="Window view">
        <button type="button" class="fb-chip" data-action="weather" data-arg="sunset" aria-pressed="${weather === 'sunset'}">Sunset</button>
        <button type="button" class="fb-chip" data-action="weather" data-arg="rain" aria-pressed="${weather === 'rain'}">Rain</button>
      </div>
    </div>
    <p class="fb-caption">Keep an eye on the mug on the windowsill during long breaks.</p>`
}

const friendsPanel = (state: ViewState) => {
  const friends = [
    { name: 'Bun', coat: 'lavender' as const, status: 'Focusing' },
    { name: 'Pip', coat: 'mint' as const, status: 'Napping' },
  ]
  const rows = friends
    .map(friend => `<div class="fb-friend">
      <div class="fb-friend__avatar" style="background:var(--fb-wall)">${DS.renderKitten({ mood: 'idle', coat: friend.coat, accessory: 'none', scale: 1, title: friend.name })}</div>
      <div class="fb-friend__meta"><span class="fb-friend__name">${friend.name}</span><span class="fb-friend__status">${friend.status}</span></div>
      <button type="button" class="fb-icon-btn" aria-label="Send ${friend.name} a heart" disabled>${DS.renderHeart(2)}</button>
      <button type="button" class="fb-btn fb-btn--flat" disabled>you got this!</button>
    </div>`)
    .join('')

  return `<div class="fb-card fb-card--butter">
      <span class="fb-section-label">Study dates are coming in a later build. This is a preview with sample friends.</span>
    </div>
    <div class="fb-card fb-card--cream">
      <span class="fb-section-label">Your invite code</span>
      <div class="row"><span class="fb-invite-code">${INVITE_CODE}</span><button type="button" class="fb-btn fb-btn--flat" data-action="copy-code">${state.copiedCode ? 'Copied!' : 'Copy'}</button></div>
      <label class="fb-section-label" for="friend-code">Friend's code</label>
      <div class="fb-field__row"><input class="fb-input" id="friend-code" disabled autocomplete="off"><button type="button" class="fb-btn fb-btn--flat" disabled>Join</button></div>
    </div>
    <div class="section"><span class="fb-section-label">Friends</span>${rows}</div>
    <div class="fb-card fb-card--mint"><span class="fb-section-label">Shared timer</span><span class="fb-caption">Finish a session together and everyone earns +2 bonus treats.</span></div>
    <p class="fb-caption" style="display:flex;gap:6px;align-items:center">${ICONS.lock} Friends only see your buddy's name and whether you're focusing.</p>`
}

const statsPanel = (state: ViewState) => {
  const { profile, now } = state
  const week = lastSevenDays(profile, now)
  const busiest = Math.max(30, ...week.map(day => day.minutes))
  const all = totals(profile)
  const bars = week
    .map(day => `<div class="bar-column"><span class="fb-caption">${day.minutes > 0 ? day.minutes : ''}</span><div class="fb-bar"${day.isToday ? ' data-today' : ''} style="height:${Math.max(2, Math.round((day.minutes / busiest) * 130))}px"></div></div>`)
    .join('')
  const labels = week.map(day => `<span class="fb-caption">${day.label}</span>`).join('')

  return `<div class="section">
      <span class="fb-section-label">This week (minutes)</span>
      <div class="fb-bars" role="img" aria-label="Focus minutes for the last seven days: ${week.map(day => day.minutes).join(', ')}">${bars}</div>
      <div class="bar-labels" aria-hidden="true">${labels}</div>
    </div>
    <div class="big__stats">
      ${stat(formatMinutes(all.minutes), 'focused')}
      ${stat(String(all.sessions), 'sessions')}
      ${stat(String(profile.treatsEarned), 'treats earned')}
    </div>
    <div class="fb-card fb-card--cream memory">
      <div class="fb-polaroid"><div class="fb-polaroid__photo">${DS.renderKitten({ mood: 'proud', coat: profile.coat, accessory: profile.accessory, scale: 2, title: `${profile.name} looking proud` })}</div></div>
      <div class="memory__text"><span class="fb-section-label">Memory book</span><button type="button" class="fb-btn fb-btn--flat" disabled>Open this week</button><span class="fb-caption">Coming in a later build</span></div>
    </div>`
}

const PANELS: Record<Tab, (state: ViewState) => string> = {
  buddy: buddyPanel,
  room: roomPanel,
  friends: friendsPanel,
  stats: statsPanel,
}

const bigView = (state: ViewState) => {
  const { profile, now, tab } = state
  const today = profile.history[dayKey(now)] ?? { minutes: 0, sessions: 0 }
  const tabs = TABS.map(({ id, label }) => `<button type="button" class="fb-tab" role="tab" id="tab-${id}" aria-controls="panel" aria-selected="${tab === id}" tabindex="${tab === id ? 0 : -1}" data-action="tab" data-arg="${id}">${label}</button>`).join('')
  const sounds = ['Rain', 'Café', 'Snores']
    .map(sound => `<button type="button" class="fb-chip" aria-pressed="false" disabled>${sound}</button>`)
    .join('')

  return `<div class="fb-widget fb-widget--big">
    <div class="fb-titlebar" data-drag>
      ${GRIP}
      <div class="fb-titlebar__id">
        <span class="fb-titlebar__name">${escapeHtml(profile.name)}</span>
        <span class="fb-titlebar__status">${ROOM_THEME}</span>
      </div>
      ${treats(profile)}
      ${iconButton('size', 'mini', 'Switch to mini size', ICONS.mini, true)}
      ${iconButton('size', 'cozy', 'Switch to cozy size', ICONS.cozy)}
      ${iconButton('tuck', '', 'Tuck widget away', ICONS.tuck, true)}
    </div>
    <div class="fb-tabs" role="tablist" aria-label="Big view sections">${tabs}</div>
    <div class="big__columns">
      <div class="big__left">
        ${room(state, 3)}
        <div class="big__stats">
          <div class="fb-card">${stat(formatMinutes(today.minutes), 'focus today')}</div>
          <div class="fb-card">${stat(String(today.sessions), 'sessions today')}</div>
          <div class="fb-card">${stat(String(streak(profile, now)), 'day streak')}</div>
        </div>
        <div class="section">
          <span class="fb-section-label">Ambient sounds (coming soon)</span>
          <div class="fb-chip-group" style="--fb-chip-cols:3">${sounds}</div>
        </div>
      </div>
      <div class="fb-panel" id="panel" role="tabpanel" aria-labelledby="tab-${tab}">${PANELS[tab](state)}</div>
    </div>
  </div>`
}

export const render = (state: ViewState) =>
  state.size === 'mini' ? miniView(state) : state.size === 'big' ? bigView(state) : cozyView(state)

export const timerParts = (timer: Timer) => ({ ...progress(timer), time: DS.formatTime(timer.remainingSec).split(':') })
