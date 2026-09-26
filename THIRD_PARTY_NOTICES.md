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

## Quantara reference artwork and QuantCorner marks

The current edition follows the owner's explicit reference to the Quantara fantasy world in the local Robo Trade website. Quantara is not an alternative spelling of Quantsera. Existing illustrations are copied unchanged to `public/assets/quantara/`:

- `deltaris-workshop-v2.png`: original generated fictional workshop illustration; generation metadata dated 2026-09-24.
- `deltaris-masters.png`: owner-supplied master-and-golem artwork.
- `learning-atlas.png`: exact reference-edition map, used for atmosphere rather than authoritative city geography.
- `deltaris-card.png`: owner-supplied original generated Deltaris city artwork.

Exact local origins, source provenance records, dimensions and SHA-256 values are in `data/quantara-assets.json`. Local metadata documents owner-supplied/original generated artwork. No independent CC, MIT or other public license is assigned to these illustrations by this project. Existing provenance remains the evidence for this reuse; dependency licenses below do not apply to the artwork.

The approved `quantcorner-mark-light.svg` and `quantcorner-mark-dark.svg` come from the canonical local QuantCorner brand pack. Their suffixes identify the intended light or dark surface. Files are copied byte-for-byte; paths, colors and proportions are unchanged. Preserve the canonical clear-space rules. No logo is generated, traced, recolored or animated.

## Earlier visual interpretation

The initial local draft interpreted the request using the shared Quantsera / QuantCorner Material 2 foundation and approved Quantsera transparent lockups (`quantsera-horizontal-transparent-offwhite.svg` and `quantsera-horizontal-transparent-black.svg`). The owner subsequently clarified the intended Quantara fantasy-world reference. That earlier interpretation is superseded for the current presentation; retained files or records do not establish Quantsera as the identity of this edition.

## Design scope

The current edition combines existing Quantara fictional artwork, approved QuantCorner marks, local typography, native accessible controls and the documented React Bits interactions. Course prose, equations and data remain distinct from narrative illustration. Asset collection used existing local files only: no Internet fetch, new image generation, external analytics or market-data request. Local verification of the six copied files is recorded in the asset manifest.

## Tabler Icons

The search glyph is reused from the locally governed `quantitative-finance-notes/assets/icons/search.svg`, originating at Tabler commit `6d128ed935d4546607b1e4d5d08c8b27bdbe7758`. Geometry is unchanged; `currentColor`, inline SVG, sizing and decorative accessibility attributes are the only adaptations. Original MIT notice is in `notices/tabler-LICENSE.txt`.

## Quant Researcher illustration

`public/assets/quantara/researcher.webp` is copied unchanged from the owner's local QuantCorner card-game artwork. The original generation and WebP conversion are recorded in `prototype/quantcorner-discovery-demo/WARRIOR-ART.md`; exact source and SHA-256 are in `data/quantara-assets.json`. It is used as a supporting fictional illustration without adding character canon or a new public artwork license.
