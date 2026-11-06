# Focus Buddies

A cute desktop widget where a pastel pixel art kitten keeps you company while you focus.

Focus Buddies is a small window that stays on top of your work, with a focus timer and a kitten that reacts as your session goes. Later, friends will be able to bring their own pets along for shared study dates.

> **Status:** early planning. There's no code yet, so nothing is ready to install. Everything below describes the planned app and may change.

## Planned features

### First version

- **Your kitten:** name your buddy and watch her react as you work.
- **Focus timer:** choose a preset or custom length, with a gentle chime at the end.
- **Breaks:** your kitten stretches, yawns, and reminds you to drink some water.
- **Treats:** finish sessions to earn treats for outfits and room decorations.
- **Always on top:** drag the widget anywhere or tuck it out of the way.

### Later

- **Study dates:** share an invite code to bring a friend's pet into your room.
- **Shared timer:** focus together and earn a bonus for finishing.
- **Tiny reactions:** send a heart or a "you got this!" without opening a chat.
- **Dress-up and rooms:** collect outfits and themes like a bakery or a strawberry cottage.
- **Memory book:** look back on a weekly scrapbook page of your focus time.
- **Ambient sounds:** listen to rain, café chatter, or soft purring.

## Layout

The widget has three sizes, so it only takes up as much room as you need.

| Size | Shows | Used for |
| --- | --- | --- |
| Mini | Your kitten and the timer | Focusing |
| Cozy | Your room, your kitten, friends, the timer controls, and today's totals | Everyday use |
| Dressing room | Tabs for outfits, rooms, friends, and stats | Occasional visits |

## Design

### Principles

- **No guilt:** your kitten never gets sick or dies when you miss a day. If you leave, she naps, and she's happy when you come back.
- **Private by default:** friends see your pet's name and whether you're focusing, never what you're working on.
- **Easy to ignore:** the widget stays quiet and small while you work.

### The kitten

Her starting look is a 32×32 pixel sprite with a big head and tiny body, strawberry-milk fur, a cream belly and paws, rosy cheeks, and a lavender bow.

| Moment | What she does |
| --- | --- |
| Idle | Breathes, blinks, and flicks her tail |
| Focusing | Reads a tiny book in tiny glasses |
| Almost done | Perks up her ears and watches the clock |
| Session finished | Wiggles, hops, and floats pixel hearts |
| Break time | Stretches, yawns, and points to a glass of water |
| You return | Runs over and rubs against the widget's edge |
| Left alone | Curls up and sleeps |

### Art style

The app uses pastel pixel art with soft plum outlines instead of black.

| Role | Color | Hex |
| --- | --- | --- |
| Main pink | Strawberry milk | `#F9C6D7` |
| Secondary | Lavender | `#CDBDF2` |
| Fresh accent | Mint | `#BDEBD6` |
| Warm accent | Butter | `#FFEFB3` |
| Background | Cream | `#FFF8F2` |
| Outlines and text | Plum | `#6B4E71` |

- Keep the whole app to a shared palette of 16 to 24 colors.
- Shade with a tinted color, never gray.
- Scale art by whole numbers only (2×, 3×, 4×), with smoothing turned off.

## Roadmap

1. Draw the kitten's idle sprite and settle the style.
2. Design the cozy view and the mini view.
3. Choose the desktop framework.
4. Build the solo widget with the timer, breaks, and treats.
5. Add outfits and room themes.
6. Add study dates with friends.
