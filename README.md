# peekons

Icons with a face that peek out of a button, a box or a word when you hover or focus it, make a
little gesture and hide again when you leave.

- 27 icons, each under 1.2 KB of SVG, one file per icon so bundlers only ship what you import.
- Each mascot says hello once when it first scrolls into view. Turn it off per host or for all.
- A resting mascot is one empty span: its SVG is drawn only while it moves and removed when it hides.
- No runtime dependencies: the motion is the Web Animations API.
- Works anywhere with plain HTML (Astro, Vue, Svelte, vanilla) and has a React component.
- Black and white out of the box, following the page's light or dark color scheme. Colors are CSS variables.
- Hidden from screen readers, never takes a click, and stays still with `prefers-reduced-motion`.

## Install

```sh
npm i peekons
```

Import the stylesheet once:

```js
import 'peekons/peekons.css';
```

## React

Put `<Peekon>` inside the element it should peek out of:

```jsx
import { Peekon } from 'peekons/react';
import { mail } from 'peekons/icons';

<a href="mailto:hi@example.com" className="btn">
  Write me
  <Peekon icon={mail} />
</a>;
```

`gesture` overrides the icon's own: `<Peekon icon={mail} gesture="hop" />`. `greet={false}` keeps it
still until someone hovers or focuses the host.

## Astro and plain HTML

Mark the hosts with `data-peekon` and mount once:

```astro
<a href="https://github.com/you" data-peekon="github">GitHub</a>
<button data-peekon="download" data-peekon-gesture="nod" data-peekon-greet="false">Download</button>

<script>
  import 'peekons/peekons.css';
  import { mount } from 'peekons';
  import { github, download } from 'peekons/icons';
  mount({ github, download });
</script>
```

`mount(icons, { root, greet })` returns a cleanup function; `greet: false` turns the hello off for
every host. For a single element there is `attach(element, icon, { gesture, greet })`, which also
returns its cleanup.

## Gestures

| Gesture | What it does |
| --- | --- |
| `wink` | tilts, winks and sways |
| `wave` | wiggles side to side |
| `nod` | bobs down twice |
| `hop` | jumps out above the edge twice |
| `flip` | jumps and does a somersault |
| `spin` | turns a full circle on the spot |

Every mascot winks its right eye whatever the gesture.

## Saying hello

By default each mascot comes out once, on its own, the first time its host scrolls into view (hosts
that arrive together go in a short cascade). One shared `IntersectionObserver` watches every host and
lets go of each one after its hello.

## Icons

`bell` `calendar` `camera` `cart` `chat` `check` `copy` `download` `folder` `github` `heart` `home`
`link` `linkedin` `lock` `mail` `music` `phone` `plus` `search` `send` `settings` `star` `trash`
`upload` `user` `x`

## Colors and size

Set these on the host or any ancestor:

| Variable | Default | Paints |
| --- | --- | --- |
| `--pk-ink` | `CanvasText` | outlines, eyes |
| `--pk-paper` | `Canvas` | body fill |
| `--pk-accent` | `--pk-ink` | hearts, solid tiles |
| `--pk-blush` | ink at 16% | cheeks |
| `--pk-size` | `26px` | mascot size |
| `--pk-inset` | `5px` | distance from the host's right edge |

If the host is `position: static`, peekons gives it an inline `position: relative` while a mascot is
bound and takes it back afterwards; any other position you set is left alone. A host with
`overflow: hidden` will clip its mascot.

## Adding an icon

Draw it in `icons/<name>.svg` on a 24×24 viewBox with these classes, then run `npm run icons`:

| Class | Use |
| --- | --- |
| `pk-body` | filled shapes with an outline |
| `pk-line` | strokes |
| `pk-eye` / `pk-wink` | the two eyes; the right one also gets `pk-wink` |
| `pk-blush` | cheeks |
| `pk-accent`, `pk-solid`, `pk-rev` | accent fill, solid body, paper-colored detail on a solid body |

Keep the face above y≈19: the bottom of the mascot stays behind the host's edge. Set the gesture with
`data-gesture` on the `<svg>`.

## Development

```sh
npm test          # unit tests
npm run typecheck
npm run build
npm run dev       # playground on :5199 (sheet.html: every icon large, light and dark)
npm run e2e       # Playwright: every icon, clicks, reduced motion, leaks, 100 hosts
```

The landing page lives in `site/` (Astro, uses the library from `../src`):

```sh
cd site && npm run build && npx playwright test
```

## License

MIT. See `LICENSE` for the Lucide attribution.
