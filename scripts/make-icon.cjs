// Draws the kitten sprite into a 1024×1024 PNG on a strawberry tile, for `tauri icon`.
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const DS = require('../focus-buddy-design-system/_ds_bundle.js')

const SPRITE = 32
const SCALE = 28
const SIZE = 1024
const OFFSET = Math.floor((SIZE - SPRITE * SCALE) / 2)
const coat = DS.coats.pink
const fills = { fur: coat.fur, shade: coat.shade, bowFill: DS.palette.lavender, bowDark: DS.palette.lavenderDeep }
const { base, faces, accessories } = DS.sprites.kitten
const hex = fill => (fills[fill] || fill).match(/[0-9A-F]{2}/gi).map(part => parseInt(part, 16))

const grid = Array.from({ length: SPRITE }, () => Array(SPRITE).fill(null))
for (const [fill, data, opacity] of [...base, ...faces.idle, ...accessories.bow]) {
  if (opacity != null) continue
  for (const [, x, y, w, h] of data.matchAll(/M(\d+) (\d+)h(\d+)v(\d+)h-\d+z/g)) {
    for (let row = Number(y); row < Number(y) + Number(h); row++) {
      for (let col = Number(x); col < Number(x) + Number(w); col++) grid[row][col] = hex(fill)
    }
  }
}

const background = hex(DS.palette.butter)
const pixels = Buffer.alloc((SIZE * 4 + 1) * SIZE)
for (let y = 0; y < SIZE; y++) {
  const start = y * (SIZE * 4 + 1)
  for (let x = 0; x < SIZE; x++) {
    const row = Math.floor((y - OFFSET) / SCALE)
    const col = Math.floor((x - OFFSET) / SCALE)
    const color = grid[row]?.[col] ?? background
    pixels.set([...color, 255], start + 1 + x * 4)
  }
}

const table = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc = buffer => {
  let c = 0xffffffff
  for (const byte of buffer) c = table[(c ^ byte) & 255] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const body = Buffer.concat([Buffer.from(type), data])
  const length = Buffer.alloc(4)
  const sum = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  sum.writeUInt32BE(crc(body))
  return Buffer.concat([length, body, sum])
}
const header = Buffer.alloc(13)
header.writeUInt32BE(SIZE, 0)
header.writeUInt32BE(SIZE, 4)
header.set([8, 6, 0, 0, 0], 8)

fs.writeFileSync(
  path.join(__dirname, '.icon-source.png'),
  Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(pixels)),
    chunk('IEND', Buffer.alloc(0)),
  ]),
)
