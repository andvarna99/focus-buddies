# Focus Buddy

A floating focus-timer widget with a pixel art kitten, built with Tauri 2 and plain TypeScript.

## Rules

- `focus-buddy-design-system/` is the source of truth for colors, sizes, sprites, and behavior. Read its `README.md` before changing the interface. Treat the folder as read-only.
- Timer and stat numbers use the glyphs in `src/digits.ts`, not Pixelify Sans, because its 3, 5, and 8 are hard to tell apart.
- Run `npm test` and `npm run build` before committing.
- Keep app personality out of commits, comments, and documentation.

## Where things stand

| Platform | Status |
| --- | --- |
| Linux | Runs locally. Always-on-top is not working yet under GNOME on Wayland. |
| Windows | Built by GitHub Actions. Not yet run on a real computer. |
| macOS | Built by GitHub Actions. Not yet run on a real computer. |
| iOS | Not built yet. Needs `npm run tauri ios init` on a Mac. |

## Next steps

1. **Windows and macOS:** run the app and check the list in the README.
2. **iOS:** generate the Xcode project, run it, and commit `src-tauri/gen/apple`. iOS shows the app full screen with no mini size.
3. **Linux always-on-top:** GNOME ignores this request from native Wayland apps. Run `GDK_BACKEND=x11 npm run tauri dev` to test XWayland. If it works, set that at launch on Linux Wayland sessions only, and check that the pixel art stays sharp.
4. **Workspaces:** consider showing the widget on all workspaces.

## Not built yet

- Friends, ambient sounds, real-weather matching, and the memory book are labeled placeholders.
- The Custom chip sets 50 minutes because the stepper isn't designed. Tuck away only minimizes the window.
- The hop, tail flick, stroll, and mug animations are still to come.
