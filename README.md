# Karthik — Blockchain Engineer · Portfolio

A dark, motion-driven single-page portfolio. Built to feel like *infrastructure*,
not a brochure: a live Three.js node-network, smooth inertial scrolling, a custom
cursor, a decrypt-style preloader, scroll-choreographed reveals, magnetic buttons,
and animated project motifs.

Motion DNA borrowed from the Sowieso / Wero merchant page (smooth scroll, pinned
reveals, parallax, staggered entrances) — re-skinned for web3.

## Stack

- **React 18 + Vite + TypeScript**
- **Tailwind CSS** (custom dark/neon design system)
- **Framer Motion** — reveals, parallax, micro-interactions
- **Lenis** — smooth inertial scrolling
- **Three.js** — the hero node-network background
- Fonts: **Clash Display** + **General Sans** (Fontshare), **JetBrains Mono** (Google)

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build → dist/
npm run preview  # preview the production build
```

## Make it yours

Almost everything is data-driven — edit **`src/data/content.ts`**:

- `profile` — name, role, location, hero headline + intro.
- `stats`, `about`, `capabilities` — your story and what you do.
- `projects` — the showcase. Each has a `status` badge (`Live` /
  `In development` / `Shipped`). Kept deliberately high-level — *what* you build
  and its status, **no stack / infra / keys / wallets**.
- `approach` — your principles.
- `contact` — email + social links.

### ⚠️ Fill in your LinkedIn URL

In `src/data/content.ts`, the LinkedIn link is a placeholder:

```ts
{ label: "LinkedIn", handle: "Connect", href: "#" },  // ← replace "#"
```

### Theme

Colors, fonts, shadows and keyframes live in `tailwind.config.ts` and
`src/index.css` (CSS variables + the neon gradient + grain).

## Accessibility / performance

- Respects `prefers-reduced-motion` (smooth scroll off, particles render a single
  static frame, animations collapse).
- Custom cursor only activates on fine-pointer devices.
- Three.js scene caps the device pixel ratio and disposes cleanly on unmount.

## Deploy (Netlify)

`netlify.toml` is included. Either connect the repo in the Netlify UI, or:

```bash
npm i -g netlify-cli
netlify deploy --build --prod
```

Build command `npm run build`, publish directory `dist`.
