// Hand-drawn pixel glyphs for the timer and stats, on a 5×7 grid. They replace Pixelify Sans
// there because its 3, 5, and 8 are hard to tell apart.
export const GLYPHS: Record<string, readonly string[]> = {
  '0': ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  '3': ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  '4': ['#...#', '#...#', '#...#', '#####', '....#', '....#', '....#'],
  '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '6': ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '..#..', '..#..', '..#..', '..#..'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  h: ['#....', '#....', '#....', '####.', '#...#', '#...#', '#...#'],
  m: ['........', '........', '#######.', '##.##.##', '##.##.##', '##.##.##', '##.##.##'],
  ':': ['..', '..', '##', '..', '##', '..', '..'],
  ' ': ['..', '..', '..', '..', '..', '..', '..'],
}

const HEIGHT = 7
const GAP = 1
// Already drawn at full weight, or their strokes would merge when bolded.
const UNBOLDED = new Set(['m', ':', ' '])

// Doubles each vertical stroke for the chunky look of the design system.
const bold = (row: string) =>
  [...`${row}.`].map((pixel, i) => (pixel === '#' || row[i - 1] === '#' ? '#' : '.')).join('')

const shape = (char: string) => (UNBOLDED.has(char) ? GLYPHS[char] : GLYPHS[char]?.map(bold))

// Draws text as one crisp SVG in the current text color. Only whole-number scales keep the pixels even.
export const pixelText = (text: string, scale: number) => {
  let x = 0
  const rects: string[] = []

  for (const char of text) {
    const glyph = shape(char)

    if (!glyph) continue

    glyph.forEach((row, y) => {
      for (const match of row.matchAll(/#+/g)) {
        rects.push(`M${x + (match.index ?? 0)} ${y}h${match[0].length}v1h-${match[0].length}z`)
      }
    })
    x += glyph[0].length + GAP
  }

  const width = Math.max(1, x - GAP)

  return `<svg class="fb-pixel" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${HEIGHT}" width="${width * scale}" height="${HEIGHT * scale}" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="${rects.join(' ')}"/></svg>`
}

// Stats shrink one step when they get long, so totals like 120h 30m still fit their column.
export const statScale = (text: string) => (text.length > 6 ? 2 : 3)
