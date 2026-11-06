// Loads the design system bundle, which attaches itself to globalThis.
import '../focus-buddy-design-system/_ds_bundle.js'
import type { FocusBuddyDS } from './ds.d'

export const DS: FocusBuddyDS = globalThis.FocusBuddyDS
