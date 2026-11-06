import { getCurrentWebview } from '@tauri-apps/api/webview'
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window'

import type { Size } from './views'

const SIZES: Record<Size, [number, number]> = {
  mini: [340, 88],
  cozy: [380, 560],
  big: [960, 680],
}

const isTauri = '__TAURI_INTERNALS__' in window
const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1)

// iOS apps fill the screen, so window moves and sizes only apply to desktop windows.
export const SHELL = isIos ? 'ios' : isTauri ? 'desktop' : 'browser'

const hasDesktopWindow = isTauri && !isIos

const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve))

// Some systems enlarge the whole page, as Linux does with a text scaling setting, which pushes
// the widget past its window and breaks whole-number pixel art. This measures that and cancels it.
export const fitPageToWindow = async (size: Size) => {
  if (!hasDesktopWindow) return

  while (window.innerWidth === 0) await nextFrame()

  const zoom = window.innerWidth / SIZES[size][0]

  if (Math.abs(zoom - 1) > 0.01) await getCurrentWebview().setZoom(zoom)
}

export const resizeTo = async (size: Size) => {
  if (!hasDesktopWindow) return

  const [width, height] = SIZES[size]
  await getCurrentWindow().setSize(new LogicalSize(width, height))
}

export const startDrag = async () => {
  if (hasDesktopWindow) await getCurrentWindow().startDragging()
}

export const tuckAway = async () => {
  if (hasDesktopWindow) await getCurrentWindow().minimize()
}
