# Focus Buddy — design handoff

A desktop focus-timer widget with a pixel-art kitten ("Mochi") who reacts to your sessions. This folder is the **source of truth for the look and feel**: tokens, component styles, pixel-exact sprite data and the mood logic. Build the app on top of it; don't re-derive colors, sizes or sprites by eye.

> **For Claude Code:** read this file first, then `_ds_bundle.js` (sprites and logic) and `components/components.css` (class names). `examples/cozy.html` is a working reference of the default size built only from this package. Open it in a browser to see the expected behavior.

```
focus-buddy-design-system/
├── README.md                ← you are here (spec + rules)
├── styles.css               ← single CSS entry point (imports everything below)
├── tokens/
│   ├── base.css             ← reset, focus ring, .fb-pixel helper
│   ├── colors.css           ← palette, shades, semantic roles, coats
│   ├── fonts.css            ← Pixelify Sans + Nunito
│   ├── motion.css           ← durations, keyframes, reduced-motion
│   ├── spacing.css          ← spacing, radii, borders, widget + sprite sizes
│   └── typography.css       ← type scale
├── components/
│   └── components.css       ← .fb-* component classes
├── _ds_bundle.js            ← window.FocusBuddyDS: sprites, renderers, moodFor()
└── examples/
    └── cozy.html            ← reference implementation (cozy size)
```

---

## 1. Non-negotiable rules

1. **No black, anywhere.** Outlines and text are plum `#6B4E71`. On lavender backgrounds use deep plum `#4E3553` (lavender + plum is only 4.0:1).
2. **Pixel art scales by whole numbers only** (1×, 2×, 3×, 4×), with smoothing off: `image-rendering: pixelated` / `shape-rendering: crispEdges` (`.fb-pixel`). Never use fractional CSS transforms on sprites.
3. **Native sizes:** buddy 32×32, room 160×90. Mini: buddy at 2× (64px). Cozy: room at 2× (320×180). Big: room at 3× (480×270). Mood sheet: buddy at 4×.
4. **One shade + one highlight per color.** Shading goes pink → dusty rose, never toward grey. New art must use `FocusBuddyDS.palette` (about 24 colors in total).
5. **Contrast where it matters:** timer digits and the buddy's face are always plum. Minimum text size is 12px.
6. **Every control is at least 44×44** and is a real `<button>`, `<a>` or `<input>`. State is expressed with ARIA (`aria-pressed`, `aria-selected`, `aria-checked`, `disabled`), and the CSS keys off those attributes.
7. **The buddy is never sad or sick.** Neglect means she falls asleep, nothing worse.
8. **Respect `prefers-reduced-motion`.** All loops stop, and mood changes still happen through the art.

## 2. Using the package

```html
<link rel="stylesheet" href="focus-buddy-design-system/styles.css">
<script src="focus-buddy-design-system/_ds_bundle.js"></script>
```

```js
const DS = window.FocusBuddyDS;           // or require('./_ds_bundle.js')
el.innerHTML = DS.renderKitten({ mood: 'focus', coat: 'pink', accessory: 'bow', scale: 2 });
room.innerHTML = DS.renderRoom({ weather: 'sunset', scale: 2, idPrefix: 'cozy' });
const mood = DS.moodFor({ running: true, remainingSec: 42 });   // 'alert'
DS.formatTime(1122);                       // '18:42'
DS.progressBlocks(1122, 1500);             // 3  (of 12)
```

- `renderKitten({ mood, coat, accessory, scale, title })` returns an SVG string with `role="img"` and a descriptive `aria-label`.
- `renderRoom({ weather, scale, idPrefix })` returns the room without the buddy. Use a unique `idPrefix` when several rooms share a document.
- Overlays go at `DS.sprites.room.anchors[*] × scale`, positioned absolutely inside the room: buddy, guest, hearts, z z z, alert bubble, water glass, reaction bubble, and the mug.
- Raw layer data is in `DS.sprites.*` (`[fill, svgPathData, opacity?]`), for building a `<canvas>` or sprite-sheet exporter.
- **Mood × coat × accessory are layers on one sprite.** Don't draw separate kittens per combination. When the coat is lavender, the bow automatically switches to pink so it stays visible.

## 3. The three sizes

All three are frameless, always-on-top windows that can be dragged anywhere. The title bar is the drag region (`-webkit-app-region: drag`, with controls set to `no-drag`). The size buttons in the title bar switch between sizes. **Tuck away** collapses the widget to a small edge tab; the exact form is up to the platform.

### Mini: 340 × 88, for focusing
| Part | Spec |
|---|---|
| Shell | `.fb-widget--mini`, radius 22, 3px plum border |
| Buddy tile | 66×66 (64 sprite + border), mint bg, buddy 2× bottom-aligned, mood follows timer |
| Timer | Pixelify 34/700, colon pulses (`fb-beat` 1.2s) |
| Label | 12px/800 with an 8px blush square: "Focusing · 25 min" / "Paused · Mochi is waiting" |
| Controls | Pause/resume 44 (pink, press lip) · expand-to-cozy 44 |

### Cozy: 380 × 560, the default
Top to bottom, 18px gaps, padding 12/16/18:
1. **Title bar (44):** grip · name (Pixelify 20) over mood line (12/700) · treats pill (butter) · mini · big · tuck.
2. **Room (320×180 + 3px frame, radius 14):** sunset or rain window, buddy on the mint cushion, mood overlays.
3. **Timer:** digits Pixelify 64/700, tracking 2px, tabular figures · 12-block progress bar (14×10 blocks, filled in blush) · status line 14/700.
4. **Session length:** 4 chips, `15 min · 25 min · 45 min · Custom`. The selected chip is lavender. Custom defaults to 50 min and should open a stepper (not designed yet).
5. **Actions:** Start/Pause/Resume/Again (primary, Pixelify 20, 48 tall, fills the row) · Break (48, mint when active) · Reset (48).

### Big: 960 × 680, for outfits, room, friends and stats
- Title bar: name at 24px, room-theme subtitle, treats, links to mini and cozy, tuck.
- Tabs (`role="tablist"`, 48 tall): **Buddy · Room · Friends · Stats**. The selected tab is pink with a press lip.
- Left column (486 wide): room at 3× · three stat cards (today's focus time, sessions, streak) · Ambient sounds toggles (Rain, Café, Snores; lavender when on).
- Right panel (`.fb-panel`, white, radius 20, scrolls), by tab:
  - **Buddy:** **Name** input (max 16 characters; Save is enabled only when the name changed and isn't blank; Enter saves; "Saved!" shows for 2s; hint shows `n/16 · friends see this name`) · coat swatches (4, ring when selected) · accessory grid (3 columns, 96 tall cards: Wearing / Owned / *n treats* / locked and dashed). Buying deducts treats and equips the item.
  - **Room:** theme cards (current one pink; locked ones dashed with a price) · "Match my real weather" switch · Sunset/Rain segmented buttons (picking one turns the match switch off) · a note about the mug.
  - **Friends:** invite code card (Copy → "Copied!" for 2s) and a "Friend's code" input with Join · friend rows (1× avatar, name, status, a heart button and a "you got this!" button) · shared-timer card (mint) · privacy line with a lock icon.
  - **Stats:** weekly pixel bar chart (7 bars, today in mint, labelled values) · totals (focused time, sessions, treats earned) · memory book polaroid (rotated −4°) with an "Open this week" button.
- During a study date the friend's pet sits on the butter cushion in your room (`anchors.guest`). Reactions float over it for 3s.

## 4. Moods

`DS.moodFor(state)` picks the mood, checking in this order: **break → done/returned → running (alert in the last 60s, otherwise focus) → idle ≥ 10 min (asleep) → idle**.

| Mood | Trigger | Face | Room overlay | Status copy |
|---|---|---|---|---|
| `idle` | nothing running | open eyes, ω smile | — | "Ready when you are" |
| `focus` | timer running, more than 60s left | tiny glasses, flat mouth, mint book in paws | — | "Focusing with you" |
| `alert` | last 60s | wide 3×3 eyes, little "o" mouth | "!" bubble (butter), bobbing | "Almost there!" |
| `proud` | session done; you came back | ^ ^ eyes, open smile | 3 pixel hearts float up, 0.8s apart | "So proud of you" · "+3 treats" |
| `sleepy` | break active | half-lids, big yawn | 6×9 water glass beside her | "Break time: drink some water!" |
| `asleep` | idle 10 min or more | closed u-eyes | "z z z" bobbing | (never sad copy) |

**Animation to add in the real build** (frame-based, using `steps()`, not tweened):
- Idle: a 2–4 frame breathing bob (1px) plus a blink every 4s ± 1.5s, using `sprites.kitten.faces.blink` for 120ms. Occasional tail flick.
- Before the celebration: a butt wiggle (`fb-anim-wiggle`), then a hop (`fb-anim-hop`), then hearts.
- Return: she runs to the widget edge and rubs against it, then plays `proud` for about 3s.
- Break, as easter eggs: she strolls across the widget. If a break runs past its length, she slowly pushes the mug (`anchors.mug`) off the sill.
- Petting (click or hover on the buddy): eyes close, small hearts appear, optional soft purr.

## 5. Timer and rewards
- Presets are 15, 25 and 45 minutes, plus Custom (default 50). A gentle chime plays at the end. There's no alarm and no red.
- A finished session gives **+3 treats**. A shared session where everyone finishes gives a **+2 bonus** each.
- Progress uses 12 blocks, filled = `round(progress × 12)`.
- Treats are spent on accessories and room themes. Sample prices: star clip 6, tiny cardigan 15, frog costume 20, Bakery theme 10, Cloud bedroom 18.

## 6. Privacy (friends)
Friends see **only the buddy's name and whether you're focusing**, never task names, app titles or timer labels. Reactions are a fixed set (a heart, "you got this!"). There's no free-text chat.

## 7. Open items and placeholders
- **Art not drawn yet:** frog costume, tiny cardigan, seasonal sets, tuxedo/tabby/calico patterns, the Bakery and Cloud bedroom rooms, night/snow/clear windows, other creatures besides the kitten.
- **Not designed yet:** creature picker and naming during onboarding, Custom duration stepper, tucked-away state, memory book page, settings (chime, sounds, idle timeout).
- **Sample content:** "Mochi", "Bun", "Pip", the `MOCHI-7K2` code and all stats numbers are placeholders.
- The fonts load from Google Fonts. Self-host them (both are SIL OFL) for an offline desktop build.
- Not decided yet: the app framework (Electron or Tauri) and how the always-on-top window and drag behavior are wired.
