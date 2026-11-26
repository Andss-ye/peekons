# peekons

Icons with a face that peek out of a button, a box or a word when you hover or focus it, make a
little gesture and hide again when you leave.

- 27 icons drawn to one spec (24×24 grid, thick 2 px outlines, the same face on all), each under
  1.2 KB of SVG and its own file, so bundlers only ship what you import.
- Optional sound: every icon has its own synthesized voice, or bring your own file.
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

## Sound

Off unless you ask for it:

```js
import { chirp, soundFrom, setSound } from 'peekons/sound';

<Peekon icon={mail} sound={chirp} />                 // the icon's own voice
<Peekon icon={mail} sound={soundFrom('/pop.mp3')} /> // your own file
mount(icons, { sound: chirp });                      // every host
setSound(false);                                     // mute everything, e.g. from a speaker toggle
```

`sound` can also be any function `(icon, moment, delay) => void`, where `moment` is `'peek'` or
`'hello'`. Nothing is created until the first sound, and browsers keep audio locked until the user
has clicked or typed on the page.

## Buttons that clip

If a button hides what sticks out of it (`overflow: hidden`, a mask), wrap it and let the wrapper be
the host:

```jsx
<span className="relative inline-flex">
  <ShimmerButton>Write me</ShimmerButton>
  <Peekon icon={mail} />
</span>
```

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

Set the gesture with `data-gesture` and the voice with `data-voice` on the `<svg>`. The build rejects
unknown classes, gestures and voices, and any `stroke-width` (thicknesses come from the CSS). A
Playwright test checks every icon against the drawing rules:

- everything, strokes included, stays inside 2–22 of the 24×24 grid, and the shape is at least 15 wide or tall;
- two eyes of radius 1.3, 4 to 5.5 apart, between y 7 and 15.5 (the part that shows over the edge);
  the right one winks;
- no `pk-line` detail shorter than 3.5.

## Development

```sh
npm test          # unit tests
npm run typecheck
npm run build
npm run dev       # playground on :5199 (sheet.html: every icon large, light and dark)
npm run e2e       # Playwright: drawing rules, every icon, clicks, reduced motion, leaks, 100 hosts
```

The landing page lives in `site/` (Astro, uses the library from `../src`):

```sh
cd site && npm run build && npx playwright test
```

The landing shows peekons on buttons from shadcn/ui, Magic UI and Animata (all MIT); their notices are
in `site/THIRD_PARTY_NOTICES.txt`. None of that code ships in the package.

```sh
```

## License

MIT. See `LICENSE` for the Lucide attribution.
