# VeggieFridge design rules

These rules are the look we are working toward. They were measured from the public page at givingli.com on 2026-09-19 by opening it in a browser and reading its real colors, fonts and spacing. Only style values (numbers and colors) were taken. No logos, photos, illustrations or text were copied.

The same values live in `src/index.css` as named settings, so screens can use them by name (for example `bg-cream` or `text-ink`).

## Colors

| Name | Value | Where it is used |
|---|---|---|
| Cream | `#F0EBE2` | Page background, the main header |
| Ink | `#210C02` | Text, dark buttons, dark sections |
| Ink (soft) | `#3A1D12` | Secondary dark surfaces |
| Red | `#C42121` | Errors and warnings only. In this app red means "something is wrong," so it is never used as decoration. |
| White | `#FFFFFF` | Cards, inputs, the light pill buttons |
| Sand | `#E1D8C4` | Soft text on dark backgrounds |
| Sky | `#D3E6FF` | Tiny badges only |

Text is usually ink. Quieter text is ink at 55% to 70% strength. Borders are ink at 10% to 15%. On dark or red backgrounds, text is white at 55% to 95%.

**Our change:** the reference has no green or amber, but VeggieFridge needs them to show how fresh food is. So the expiry labels keep green (fresh), amber and orange (use soon) and red (expired), in softer tones that sit well on cream.

## Fonts

| Job | Reference font | What we use | Why |
|---|---|---|---|
| Headings and body | Mori (a paid font) | **Inter Tight** (free) | We can't legally use Mori. Inter Tight is a similar clean, tightly spaced sans-serif. |
| Small uppercase labels | Fragment Mono | **Fragment Mono** (free) | Same font as the reference. |

## Type sizes

- **Headlines are light, not bold.** Regular weight, very large, with letters pulled close together (about -3% to -4.5% spacing).
- Big headline: 128px on the reference's hero. In the app, use roughly 36px to 56px so the cards still fit.
- Medium headline: 40px, tight spacing.
- Body text: 16px with 24px to 26px line height.
- Small text: 14px with 20px line height.
- Labels: 12px, monospaced font, uppercase, wide letter spacing (about 0.18em).

## Shapes

- **Buttons, search bars, tabs and badges:** fully round pills.
- **Cards and panels:** 16px to 24px rounded corners.
- **Small tags:** 4px corners.
- **Shadows:** a hairline ring (ink at 10%) plus a soft drop, `0 8px 24px` at 18% black. Simple cards use a very light `0 1px 3px`.

## Spacing

- Everything sits on a 4px grid. Common gaps: 4, 8, 12, 16, 24, 32, 40px.
- Button padding: about 12px by 24px (pill).
- Card padding: 28px.
- Page sides: 24px on phones, 40px on desktop.
- Space between big sections: very generous, 96px to 190px on the reference. In the app, use 40px to 64px.
- Text blocks are centered and narrow (about 670px to 900px wide).

## Layout and buttons

- Cream page, with full-width bands of solid color (red, ink) to separate big ideas.
- Header: logo on the left, a rounded pill group of tabs in the middle, actions on the right.
- Main button: ink pill with cream text. Secondary button: white pill with ink text.
- Section labels: a small monospaced, uppercase label above a large light headline.

## Restyle progress

- [x] Round 1: colors and fonts set app-wide, header, welcome banner
- [x] Fridge screen
- [ ] Recipes screen and recipe pop-up
- [ ] Favorites, Shopping List, Budget Swaps
- [ ] Preferences and Receipt Scanner pop-ups
