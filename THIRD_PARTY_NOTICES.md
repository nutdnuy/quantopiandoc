# Third-party notices and local asset provenance

## Quantopian source collection

Source: local snapshot of `nutdnuy/quantopiandoc`, commit `b1faf19ba390d6aa74429e759c3acc1ab8779932`. All 183 original files (92 ipynb, 91 HTML previews) are retained byte-for-byte under `sources/quantopian/`. Author names and per-notebook notices are retained. No repository-level license was included in the snapshot. This project does not relicense the source collection.

## Fonts

Roboto, Noto Sans Thai, and Roboto Mono were reused from the local `quantitative-finance-notes/assets/fonts/` bundle. Original license notices are included alongside the fonts. No Google Fonts or other remote font service is called.

## KaTeX

KaTeX was reused from the local `quantitative-finance-notes/assets/katex/` bundle. Its original notices and font files are preserved. It renders formulas locally at build time.

## marked

marked 17.0.6, MIT. Local installed source copied to `vendor/marked.mjs`; original license copied to `vendor/marked-LICENSE.md`. No package registry was queried during this task.

## React Bits

Source: local pinned clone of `DavidHDev/react-bits`, commit `8d1c5fa9ebee6e077e70c9e5c63b44e87dbeaecc`.

Copyright (c) 2026 David Haz. MIT + Commons Clause License Condition v1.0. Full notice retained in `notices/react-bits-LICENSE.md`, extracted directly from the local Git object.

Adapted families: **Stepper**, **AnimatedList**, **CountUp**. These are integrated into this website, not offered as a standalone component library or template pack. The user required no Internet use, so registry fetching was replaced with inspection of the local pinned source.

Adaptations: semantic token colors, native buttons and links, visible keyboard focus, no global Tab hijacking, minimum 48px control targets, no gradients/glow, no autoplay, immediate accessible final counts, and reduced-motion equivalents. See `data/interaction-manifest.json` for purposes and triggers.

## React and Motion

React, React DOM, Motion, Framer Motion, Motion DOM, Motion Utils, and Scheduler were bundled from installed local dependencies. Applicable notices are retained in `notices/` and `public/interactions.js.LEGAL.txt`. See `data/runtime-versions.json` for the actual installed versions used.

## Quantsera brand assets

The approved, unmodified transparent lockups are copied from the canonical local brand pack:

- `quantsera-horizontal-transparent-offwhite.svg`
- `quantsera-horizontal-transparent-black.svg`

No logo generation, tracing, path edits, recoloring, or animation. Only CSS width with natural aspect ratio and theme-specific selection is applied. The design credit identifies the Design System; the course name remains QuantCorner Research Lab.

## Design scope

Uses the shared Quantsera / QuantCorner Material 2 foundation, local typography, native accessible controls, and the three documented React Bits families. No remote component registry, image generator, external analytics, or market data provider was used. Quantara was not found among local design-system names; the local Quantsera/QuantCorner system is the documented interpretation of that request.

## Tabler Icons

The search glyph is reused from the locally governed `quantitative-finance-notes/assets/icons/search.svg`, originating at Tabler commit `6d128ed935d4546607b1e4d5d08c8b27bdbe7758`. Geometry is unchanged; `currentColor`, inline SVG, sizing and decorative accessibility attributes are the only adaptations. Original MIT notice is in `notices/tabler-LICENSE.txt`.
