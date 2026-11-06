/*!
 * Focus Buddy design system bundle — v0.1.0
 * Pixel-exact sprite data + renderers + mood logic, framework-free.
 *
 * Browser:  <script src="_ds_bundle.js"></script>  →  window.FocusBuddyDS
 * Node/ESM: const FocusBuddyDS = require('./_ds_bundle.js')
 *
 * All art is authored on a native grid (kitten 32×32, room 160×90) as SVG
 * rect runs ("M x y h w v h h-w z"). Scale ONLY by whole numbers; renderers
 * emit shape-rendering="crispEdges" so pixels stay sharp.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.FocusBuddyDS = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // ---------------------------------------------------------------- palette
  var PALETTE = {
    strawberry: '#F9C6D7', lavender: '#CDBDF2', mint: '#BDEBD6', butter: '#FFEFB3',
    cream: '#FFF8F2', plum: '#6B4E71', plumDeep: '#4E3553', plumSoft: '#B99BB3',
    strawberryShade: '#E8A3BC', blush: '#EE8AAE', nose: '#E07FA3',
    lavenderShade: '#A994DE', lavenderDeep: '#9C86CF', lavenderLight: '#E6DCFA',
    mintShade: '#88CFAF', mintBright: '#9EDFC2', leaf: '#6FBF98', leafDark: '#86CFAE',
    butterShade: '#F0CF78', butterBright: '#FFE07A', cushion: '#FFE38A', cushionShade: '#F2CF6B',
    wall: '#FDEEF2', wallDot: '#F7D3DF', floor: '#F6DDB5', floorLine: '#E9C793', trim: '#E8C9D3',
    lightCord: '#D9B8C7', bulbLav: '#B9A5EA', bulbPink: '#F29BB9', pot: '#E59AB4',
    strawberryRed: '#F07A9A', water: '#BFE3F5', glass: '#EAF6FF', star: '#FFD45C', starShade: '#E9A93A',
    white: '#FFFFFF'
  };

  var COATS = {
    pink:     { fur: '#F9C6D7', shade: '#E8A3BC', label: 'Pink' },
    lavender: { fur: '#CDBDF2', shade: '#A994DE', label: 'Lavender' },
    butter:   { fur: '#FFEFB3', shade: '#F0CF78', label: 'Butter' },
    mint:     { fur: '#BDEBD6', shade: '#88CFAF', label: 'Mint' }
  };

  // Fill keys in sprite layers: a hex string, or one of these tokens resolved per coat.
  //   'fur' | 'shade' | 'bowFill' | 'bowDark'
  function resolveFill(fill, ctx) {
    return ctx[fill] || fill;
  }

  // ---------------------------------------------------------------- kitten 32×32
  // Layers are painted in order. [fill, pathData, opacity?]
  var KITTEN_BASE = [
    // tail
    [PALETTE.plum, 'M24 22h3v5h-3z M21 25h5v3h-5z'],
    ['fur', 'M25 23h1v3h-1z M22 26h4v1h-4z'],
    ['shade', 'M25 23h1v1h-1z'],
    // ears + head outline
    [PALETTE.plum, 'M8 2h2v1h-2z M8 3h3v1h-3z M7 4h5v1h-5z M7 5h6v1h-6z M7 6h7v1h-7z M7 7h2v1h-2z M22 2h2v1h-2z M21 3h3v1h-3z M20 4h5v1h-5z M19 5h6v1h-6z M18 6h7v1h-7z M23 7h2v1h-2z M9 7h14v16h-14z M7 8h18v14h-18z M6 10h20v10h-20z'],
    // head + ear fur
    ['fur', 'M10 8h12v14h-12z M8 9h16v12h-16z M7 11h18v8h-18z M9 3h1v1h-1z M8 4h3v1h-3z M8 5h4v1h-4z M8 6h5v1h-5z M9 7h4v1h-4z M9 8h1v1h-1z M22 3h1v1h-1z M21 4h3v1h-3z M20 5h4v1h-4z M19 6h5v1h-5z M19 7h4v1h-4z M22 8h1v1h-1z'],
    // inner ears + chin shadow
    ['shade', 'M9 4h1v1h-1z M9 5h2v1h-2z M9 6h3v1h-3z M22 4h1v1h-1z M21 5h2v1h-2z M20 6h3v1h-3z M8 20h16v1h-16z'],
    // forehead highlight + muzzle
    [PALETTE.cream, 'M10 10h3v1h-3z M9 11h1v1h-1z M14 16h4v1h-4z M13 17h6v2h-6z M14 19h4v1h-4z'],
    [PALETTE.nose, 'M15 16h2v1h-2z'],
    [PALETTE.blush, 'M8 17h2v1h-2z M22 17h2v1h-2z'],
    // body
    [PALETTE.plum, 'M10 22h12v7h-12z'],
    ['fur', 'M11 22h10v6h-10z'],
    ['shade', 'M11 22h10v1h-10z M11 23h1v4h-1z'],
    [PALETTE.cream, 'M13 23h6v4h-6z M11 27h3v1h-3z M18 27h3v1h-3z']
  ];

  var EYES_OPEN = [
    [PALETTE.plum, 'M11 13h2v3h-2z M19 13h2v3h-2z'],
    [PALETTE.cream, 'M11 13h1v1h-1z M19 13h1v1h-1z']
  ];

  var KITTEN_FACES = {
    idle: EYES_OPEN.concat([
      [PALETTE.plum, 'M14 17h1v1h-1z M17 17h1v1h-1z M15 18h2v1h-2z']
    ]),
    focus: [
      [PALETTE.white, 'M10 13h4v3h-4z M18 13h4v3h-4z', 0.45]   // lens tint
    ].concat(EYES_OPEN, [
      [PALETTE.plum, 'M15 18h2v1h-2z'],
      // tiny glasses
      [PALETTE.plum, 'M9 12h6v1h-6z M9 16h6v1h-6z M9 12h1v5h-1z M14 12h1v5h-1z M17 12h6v1h-6z M17 16h6v1h-6z M17 12h1v5h-1z M22 12h1v5h-1z M15 13h2v1h-2z'],
      // tiny book held in paws
      [PALETTE.plum, 'M10 23h12v6h-12z'],
      [PALETTE.mintBright, 'M11 24h10v4h-10z'],
      [PALETTE.butter, 'M13 25h6v2h-6z'],
      [PALETTE.plum, 'M8 23h4v4h-4z M20 23h4v4h-4z'],
      [PALETTE.cream, 'M9 24h2v2h-2z M21 24h2v2h-2z']
    ]),
    alert: [
      [PALETTE.plum, 'M10 12h3v3h-3z M19 12h3v3h-3z M15 17h2v2h-2z'],
      [PALETTE.cream, 'M10 12h1v1h-1z M19 12h1v1h-1z']
    ],
    proud: [
      [PALETTE.plum, 'M10 14h1v1h-1z M11 13h2v1h-2z M13 14h1v1h-1z M18 14h1v1h-1z M19 13h2v1h-2z M21 14h1v1h-1z M14 17h4v2h-4z'],
      [PALETTE.nose, 'M15 18h2v1h-2z']
    ],
    sleepy: [
      [PALETTE.plum, 'M10 14h4v1h-4z M18 14h4v1h-4z M11 15h2v1h-2z M19 15h2v1h-2z M14 17h4v3h-4z'],
      [PALETTE.nose, 'M15 18h2v2h-2z']
    ],
    asleep: [
      [PALETTE.plum, 'M10 14h1v1h-1z M11 15h2v1h-2z M13 14h1v1h-1z M18 14h1v1h-1z M19 15h2v1h-2z M21 14h1v1h-1z M15 18h2v1h-2z']
    ]
  };

  // Placeholder blink frame for the idle loop (swap with idle eyes every ~4s for 120ms).
  KITTEN_FACES.blink = [
    [PALETTE.plum, 'M11 15h2v1h-2z M19 15h2v1h-2z M14 17h1v1h-1z M17 17h1v1h-1z M15 18h2v1h-2z']
  ];

  var ACCESSORIES = {
    none: [],
    bow: [
      ['bowDark', 'M4 1h3v4h-3z M9 1h3v4h-3z'],
      ['bowFill', 'M5 2h1v2h-1z M10 2h1v2h-1z M7 2h2v2h-2z']
    ],
    strawberry: [
      [PALETTE.plum, 'M13 4h6v1h-6z M12 5h8v3h-8z M13 8h6v1h-6z'],
      [PALETTE.strawberryRed, 'M13 5h6v3h-6z'],
      [PALETTE.butter, 'M14 5h1v1h-1z M17 6h1v1h-1z M15 7h1v1h-1z'],
      [PALETTE.leaf, 'M14 3h4v1h-4z M15 2h2v1h-2z']
    ],
    star: [
      [PALETTE.star, 'M24 1h1v1h-1z M22 2h5v1h-5z M23 3h3v1h-3z M23 4h1v1h-1z M25 4h1v1h-1z'],
      [PALETTE.starShade, 'M24 2h1v1h-1z']
    ]
    // TODO (art): frog costume, tiny cardigan — not drawn yet.
  };

  var MOODS = {
    idle:   { label: 'Idle',          a11y: 'relaxing',                    trigger: 'No session running' },
    focus:  { label: 'Focusing',      a11y: 'focusing with tiny glasses',  trigger: 'Timer running, > 60s left' },
    alert:  { label: 'Almost done',   a11y: 'watching the clock',          trigger: 'Timer running, ≤ 60s left' },
    proud:  { label: 'Session done',  a11y: 'proud and happy',             trigger: 'Session completed; also "you came back"' },
    sleepy: { label: 'Break time',    a11y: 'yawning on a break',          trigger: 'Break active' },
    asleep: { label: 'Left alone',    a11y: 'curled up asleep',            trigger: 'No interaction for idleTimeout (default 10 min)' }
  };

  function paintLayers(layers, ctx) {
    var out = '';
    for (var i = 0; i < layers.length; i++) {
      var l = layers[i];
      out += '<path fill="' + resolveFill(l[0], ctx) + '"' +
        (l[2] != null ? ' fill-opacity="' + l[2] + '"' : '') +
        ' d="' + l[1] + '"/>';
    }
    return out;
  }

  function wholeScale(scale, fallback) {
    var s = Math.round(Number(scale));
    return s >= 1 ? s : fallback;
  }

  /**
   * Render the kitten as an SVG string.
   * @param {{mood?:string, coat?:string, accessory?:string, scale?:number, title?:string}} opts
   */
  function renderKitten(opts) {
    opts = opts || {};
    var mood = KITTEN_FACES[opts.mood] ? opts.mood : 'idle';
    var coatName = COATS[opts.coat] ? opts.coat : 'pink';
    var coat = COATS[coatName];
    var acc = ACCESSORIES[opts.accessory] ? opts.accessory : (opts.accessory === undefined ? 'bow' : 'none');
    var s = wholeScale(opts.scale, 4);
    var pinkBow = coatName === 'lavender'; // bow must contrast with the coat
    var ctx = {
      fur: coat.fur, shade: coat.shade,
      bowFill: pinkBow ? PALETTE.strawberry : PALETTE.lavender,
      bowDark: pinkBow ? PALETTE.nose : PALETTE.lavenderDeep
    };
    var label = opts.title || ('Kitten ' + ((MOODS[mood] && MOODS[mood].a11y) || 'blinking'));
    var size = 32 * s;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="' + size + '" height="' + size +
      '" shape-rendering="crispEdges" role="img" aria-label="' + escapeAttr(label) + '" class="fb-pixel">' +
      paintLayers(KITTEN_BASE, ctx) + paintLayers(KITTEN_FACES[mood], ctx) + paintLayers(ACCESSORIES[acc], ctx) +
      '</svg>';
  }

  // ---------------------------------------------------------------- room 160×90
  var ROOM_BACK = [
    [PALETTE.cream, 'M0 60h160v4h-160z'],
    [PALETTE.trim, 'M0 63h160v1h-160z'],
    [PALETTE.plum, 'M18 12h44v36h-44z'],          // window frame
    [PALETTE.cream, 'M19 13h42v34h-42z']
  ];

  var ROOM_SKY = {
    sunset: [
      ['#F7B6CB', 'M21 15h38v7h-38z'],
      ['#FBC9C0', 'M21 22h38v7h-38z'],
      ['#FFDDB0', 'M21 29h38v7h-38z'],
      [PALETTE.butter, 'M21 36h38v9h-38z'],
      ['#FFF6D6', 'M36 32h8v1h-8z M35 33h10v5h-10z'],
      [PALETTE.cream, 'M24 19h8v2h-8z M26 18h4v1h-4z M46 24h9v2h-9z M48 23h4v1h-4z'],
      [PALETTE.mintBright, 'M21 40h38v5h-38z M25 38h14v2h-14z M44 39h12v1h-12z'],
      [PALETTE.cream, 'M39 15h2v30h-2z M21 29h38v2h-38z']
    ],
    rain: [
      ['#B9B3D6', 'M21 15h38v10h-38z'],
      ['#C6C1E0', 'M21 25h38v10h-38z'],
      ['#D3CFE8', 'M21 35h38v10h-38z'],
      ['#9F98C4', 'M22 16h14v3h-14z M26 15h6v1h-6z M44 18h14v3h-14z M47 17h6v1h-6z'],
      ['#F2F0FA', 'M24 22h1v3h-1z M30 27h1v3h-1z M35 21h1v3h-1z M43 26h1v3h-1z M48 22h1v3h-1z M54 28h1v3h-1z M27 34h1v3h-1z M33 38h1v3h-1z M45 35h1v3h-1z M51 39h1v3h-1z M57 33h1v3h-1z M37 41h1v3h-1z'],
      ['#8FBFA8', 'M21 41h38v4h-38z'],
      [PALETTE.cream, 'M39 15h2v30h-2z M21 29h38v2h-38z']
    ]
    // TODO (art): night, snow, clear day — for "match real weather & time".
  };

  var ROOM_FRONT = [
    [PALETTE.lightCord, 'M0 5h160v1h-160z'],
    [PALETTE.mintBright, 'M6 6h2v2h-2z M70 6h2v2h-2z M134 6h2v2h-2z'],
    [PALETTE.butterBright, 'M22 6h2v2h-2z M86 6h2v2h-2z M150 6h2v2h-2z'],
    [PALETTE.bulbLav, 'M38 6h2v2h-2z M102 6h2v2h-2z'],
    [PALETTE.bulbPink, 'M54 6h2v2h-2z M118 6h2v2h-2z'],
    [PALETTE.plum, 'M10 9h60v2h-60z'],                                           // curtain rod
    [PALETTE.strawberry, 'M12 11h7v33h-7z M61 11h7v33h-7z'],                     // curtains
    [PALETTE.strawberryShade, 'M14 11h1v33h-1z M17 11h1v33h-1z M63 11h1v33h-1z M66 11h1v33h-1z M12 30h7v2h-7z M61 30h7v2h-7z'],
    [PALETTE.plum, 'M14 47h52v5h-52z'],                                          // sill
    [PALETTE.cream, 'M15 48h50v3h-50z'],
    [PALETTE.plum, 'M21 41h8v6h-8z'], [PALETTE.pot, 'M22 42h6v5h-6z'],           // plant
    [PALETTE.leafDark, 'M23 36h2v5h-2z M26 35h2v6h-2z M20 38h3v2h-3z M28 38h3v2h-3z'],
    [PALETTE.plum, 'M51 42h6v6h-6z M57 43h2v3h-2z'], [PALETTE.lavender, 'M52 43h4v4h-4z'], // the mug she knocks over
    [PALETTE.white, 'M53 38h1v2h-1z M55 36h1v2h-1z', 0.8],
    [PALETTE.plum, 'M85 14h10v12h-10z M84 15h12v10h-12z'],                      // clock
    [PALETTE.cream, 'M86 15h8v10h-8z M85 16h10v8h-10z'],
    [PALETTE.plum, 'M89 17h1v4h-1z M90 20h3v1h-3z'],
    [PALETTE.plum, 'M104 30h42v4h-42z'], [PALETTE.trim, 'M104 30h42v3h-42z'],   // shelf
    [PALETTE.plum, 'M106 19h5v11h-5z M110 21h5v9h-5z M114 18h4v12h-4z M118 22h5v8h-5z'],
    [PALETTE.mintBright, 'M107 20h3v10h-3z'], [PALETTE.bulbLav, 'M111 22h3v8h-3z'],
    [PALETTE.butterBright, 'M115 19h2v11h-2z'], [PALETTE.bulbPink, 'M119 23h3v7h-3z'],
    [PALETTE.plum, 'M133 23h9v7h-9z'], [PALETTE.bulbPink, 'M134 24h7v6h-7z'],
    [PALETTE.leafDark, 'M133 16h3v7h-3z M137 14h3v9h-3z M140 18h3v5h-3z'],
    [PALETTE.lavender, 'M54 72h66v2h-66z M48 74h78v8h-78z M54 82h66v2h-66z'],  // rug
    [PALETTE.lavenderLight, 'M52 77h70v1h-70z M52 79h70v1h-70z'],
    [PALETTE.cushion, 'M38 77h30v6h-30z'], [PALETTE.cushionShade, 'M38 82h30v1h-30z'],   // guest cushion
    [PALETTE.mint, 'M71 77h30v6h-30z'], [PALETTE.mintShade, 'M71 82h30v1h-30z']          // buddy cushion
  ];

  /** Native-pixel anchor points for things layered over the room (multiply by scale). */
  var ROOM_ANCHORS = {
    buddy: { x: 69, y: 52 },     // 32×32 sprite top-left
    guest: { x: 36, y: 52 },     // friend's pet during a study date
    hearts: [{ x: 72, y: 46 }, { x: 94, y: 42 }, { x: 83, y: 36 }],
    zzz: { x: 98, y: 44 },       // asleep; font-size 8 native px
    alertBubble: { x: 98, y: 44, size: 11 },
    waterGlass: { x: 106, y: 72 },   // 6×9 sprite on break
    guestReaction: { x: 28, y: 42 }, // reaction bubble over the guest
    mug: { x: 51, y: 42 }            // for the knock-it-over animation
  };

  var HEART_7x6 = [[PALETTE.blush, 'M1 0h2v1h-2z M4 0h2v1h-2z M0 1h7v2h-7z M1 3h5v1h-5z M2 4h3v1h-3z M3 5h1v1h-1z'], [PALETTE.cream, 'M1 1h1v1h-1z']];
  var WATER_6x9 = [[PALETTE.plum, 'M0 0h6v9h-6z'], [PALETTE.glass, 'M1 0h4v8h-4z'], [PALETTE.water, 'M1 3h4v5h-4z'], [PALETTE.white, 'M2 4h1v2h-1z']];
  var TREAT_8x8 = [[PALETTE.leaf, 'M3 0h2v1h-2z M2 1h4v1h-4z'], [PALETTE.strawberryRed, 'M1 2h6v3h-6z M2 5h4v1h-4z M3 6h2v1h-2z'], [PALETTE.cream, 'M2 3h1v1h-1z M5 3h1v1h-1z M4 4h1v1h-1z']];

  /**
   * Render the room background (no buddy) as an SVG string.
   * Layer the buddy/guest/effects on top using ROOM_ANCHORS × scale.
   * @param {{weather?:'sunset'|'rain', scale?:number, idPrefix?:string}} opts
   */
  function renderRoom(opts) {
    opts = opts || {};
    var s = wholeScale(opts.scale, 2);
    var sky = ROOM_SKY[opts.weather] || ROOM_SKY.sunset;
    var p = opts.idPrefix || 'fbroom';
    var w = 160 * s, h = 90 * s;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90" width="' + w + '" height="' + h +
      '" shape-rendering="crispEdges" aria-hidden="true" class="fb-pixel">' +
      '<defs>' +
      '<pattern id="' + p + '-wall" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="' + PALETTE.wall + '"/><rect x="5" y="5" width="2" height="2" fill="' + PALETTE.wallDot + '"/><rect x="11" y="11" width="1" height="1" fill="' + PALETTE.wallDot + '"/></pattern>' +
      '<pattern id="' + p + '-floor" width="40" height="7" patternUnits="userSpaceOnUse"><rect width="40" height="7" fill="' + PALETTE.floor + '"/><rect y="6" width="40" height="1" fill="' + PALETTE.floorLine + '"/><rect x="24" width="1" height="6" fill="' + PALETTE.floorLine + '"/></pattern>' +
      '</defs>' +
      '<rect width="160" height="64" fill="url(#' + p + '-wall)"/>' +
      '<rect y="64" width="160" height="26" fill="url(#' + p + '-floor)"/>' +
      paintLayers(ROOM_BACK, {}) + paintLayers(sky, {}) + paintLayers(ROOM_FRONT, {}) +
      '</svg>';
  }

  function renderIcon(layers, w, h, scale) {
    var s = wholeScale(scale, 2);
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + (w * s) + '" height="' + (h * s) +
      '" shape-rendering="crispEdges" aria-hidden="true" class="fb-pixel">' + paintLayers(layers, {}) + '</svg>';
  }

  // ---------------------------------------------------------------- behavior
  var TIMER = {
    presets: [15, 25, 45],     // minutes
    customDefault: 50,
    alertAtSeconds: 60,        // switch to 'alert' mood
    treatsPerSession: 3,
    sharedBonusTreats: 2,
    progressBlocks: 12,
    idleTimeoutMs: 10 * 60 * 1000  // → 'asleep'
  };

  /**
   * Pick the buddy's mood from app state. Priority top → bottom.
   * @param {{onBreak?:boolean, done?:boolean, running?:boolean, remainingSec?:number, idleMs?:number, justReturned?:boolean}} st
   */
  function moodFor(st) {
    st = st || {};
    if (st.onBreak) return 'sleepy';
    if (st.done || st.justReturned) return 'proud';
    if (st.running) return st.remainingSec <= TIMER.alertAtSeconds ? 'alert' : 'focus';
    if ((st.idleMs || 0) >= TIMER.idleTimeoutMs) return 'asleep';
    return 'idle';
  }

  /** "18:42" style string. */
  function formatTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  /** Number of filled progress blocks (0–12). */
  function progressBlocks(remainingSec, totalSec) {
    if (!totalSec) return 0;
    return Math.round((1 - remainingSec / totalSec) * TIMER.progressBlocks);
  }

  function escapeAttr(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  return {
    version: '0.1.0',
    palette: PALETTE,
    coats: COATS,
    moods: MOODS,
    accessories: Object.keys(ACCESSORIES),
    timer: TIMER,
    sprites: {
      kitten: { size: 32, base: KITTEN_BASE, faces: KITTEN_FACES, accessories: ACCESSORIES },
      room: { width: 160, height: 90, back: ROOM_BACK, sky: ROOM_SKY, front: ROOM_FRONT, anchors: ROOM_ANCHORS },
      heart: { width: 7, height: 6, layers: HEART_7x6 },
      waterGlass: { width: 6, height: 9, layers: WATER_6x9 },
      treat: { width: 8, height: 8, layers: TREAT_8x8 }
    },
    renderKitten: renderKitten,
    renderRoom: renderRoom,
    renderHeart: function (scale) { return renderIcon(HEART_7x6, 7, 6, scale); },
    renderWaterGlass: function (scale) { return renderIcon(WATER_6x9, 6, 9, scale); },
    renderTreat: function (scale) { return renderIcon(TREAT_8x8, 8, 8, scale); },
    moodFor: moodFor,
    formatTime: formatTime,
    progressBlocks: progressBlocks
  };
});
