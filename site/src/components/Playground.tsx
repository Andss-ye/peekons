import { useEffect, useRef, useState } from 'react';
import { GESTURES, svgMarkup } from 'peekons';
import * as icons from 'peekons/icons';
import { Peekon } from 'peekons/react';
import { BUTTONS, type ButtonStyle } from '../data/styles';

type IconName = keyof typeof icons;
type Gesture = keyof typeof GESTURES;

const STYLE_OPTIONS: ButtonStyle[] = ['solid', 'outline', 'soft', 'tonal', 'pill', 'shine', 'brutal'];
const SPEEDS = [1, 0.5, 0.25] as const;
const all = Object.values(icons);

/** Botones en fila con uno elegido, para opciones cortas. */
function Choice<T extends string | number>({ label, value, options, onChange, show = String }: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  show?: (v: T) => string;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm text-muted">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={o === value}
            onClick={() => onChange(o)}
            className="rounded-full border border-line px-3 py-1 text-sm capitalize aria-pressed:border-fg aria-pressed:bg-fg aria-pressed:text-bg"
          >
            {show(o)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function snippet(tab: 'react' | 'astro', name: string, style: ButtonStyle, label: string, gesture: Gesture | 'auto', greet: boolean) {
  const g = gesture === 'auto' ? '' : gesture;
  if (tab === 'react')
    return `import { Peekon } from 'peekons/react';\nimport { ${name} } from 'peekons/icons';\n\n<button className="${BUTTONS[style]}">\n  ${label}\n  <Peekon icon={${name}}${g ? ` gesture="${g}"` : ''}${greet ? '' : ' greet={false}'} />\n</button>`;
  return `<button class="${BUTTONS[style]}" data-peekon="${name}"${g ? ` data-peekon-gesture="${g}"` : ''}${greet ? '' : ' data-peekon-greet="false"'}>${label}</button>\n\n<script>\n  import 'peekons/peekons.css';\n  import { mount } from 'peekons';\n  import { ${name} } from 'peekons/icons';\n  mount({ ${name} });\n</script>`;
}

export default function Playground() {
  const [name, setName] = useState<IconName>('mail');
  const [gesture, setGesture] = useState<Gesture | 'auto'>('auto');
  const [style, setStyle] = useState<ButtonStyle>('solid');
  const [label, setLabel] = useState('Write me');
  const [greet, setGreet] = useState(true);
  const [zoom, setZoom] = useState(2);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [take, setTake] = useState(0);
  const [tab, setTab] = useState<'react' | 'astro'>('react');
  const [copied, setCopied] = useState('Copy');
  const stage = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLButtonElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(copyTimer.current), []);

  // velocidad: ajusta cada animación del escenario mientras haya una mascota dibujada
  useEffect(() => {
    const el = stage.current!;
    let raf = 0;
    const apply = () => {
      for (const a of el.getAnimations({ subtree: true })) if (a.playbackRate !== speed) a.playbackRate = speed;
      raf = el.querySelector('.pk svg') ? requestAnimationFrame(apply) : 0;
    };
    const mo = new MutationObserver(() => (raf ||= requestAnimationFrame(apply)));
    mo.observe(el, { childList: true, subtree: true });
    apply();
    return () => {
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [speed]);

  // «Play»: un hover de mentira que dura lo que el gesto más una pausa, a la velocidad elegida
  useEffect(() => {
    if (!take) return;
    const b = host.current!;
    const steps = GESTURES[gesture === 'auto' ? icons[name].gesture : gesture];
    b.dispatchEvent(new PointerEvent('pointerenter'));
    const t = setTimeout(() => b.dispatchEvent(new PointerEvent('pointerleave')), (steps[steps.length - 1]![0] + 600) / speed);
    return () => clearTimeout(t);
  }, [take]);

  const code = snippet(tab, name, style, label, gesture, greet);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied('Copied');
    } catch {
      setCopied("Couldn't copy");
    }
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied('Copy'), 1500);
  };

  return (
    <section id="playground" className="mx-auto max-w-6xl px-5 py-24">
      <h2 className="text-4xl font-bold tracking-tight">Playground</h2>
      <p className="mt-3 max-w-xl text-muted">Pick a mascot and a button, zoom in and slow it down to see every frame.</p>
      <div className="mt-10 grid overflow-hidden rounded-2xl border border-line lg:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col">
          <div ref={stage} className="relative grid h-[440px] place-items-center overflow-hidden bg-surface">
            <div style={{ zoom }}>
              <button ref={host} key={`${name}-${gesture}-${greet}`} className={BUTTONS[style]}>
                {label}
                <Peekon icon={icons[name]} gesture={gesture === 'auto' ? undefined : gesture} greet={greet} />
              </button>
            </div>
            <button type="button" onClick={() => setTake((n) => n + 1)} className="absolute right-4 bottom-4 rounded-full bg-fg px-4 py-1.5 text-sm font-medium text-bg">
              Play
            </button>
          </div>
          <div className="border-t border-line">
            <div className="flex items-center gap-1 px-3 pt-3 text-sm">
              {(['react', 'astro'] as const).map((t) => (
                <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)} className="rounded-md px-3 py-1 capitalize text-muted aria-pressed:bg-surface aria-pressed:text-fg">
                  {t === 'react' ? 'React' : 'Astro / HTML'}
                </button>
              ))}
              <button type="button" onClick={copy} className="ml-auto rounded-md border border-line px-2.5 py-1 text-xs">{copied}</button>
            </div>
            <pre className="overflow-x-auto px-5 py-4 text-[13px] leading-relaxed"><code>{code}</code></pre>
          </div>
        </div>
        <div className="flex flex-col gap-6 border-t border-line p-5 lg:border-t-0 lg:border-l">
          <fieldset>
            <legend className="mb-2 text-sm text-muted">Mascot</legend>
            <div className="grid grid-cols-7 gap-1">
              {all.map((icon) => (
                <button
                  key={icon.name}
                  type="button"
                  title={icon.name}
                  aria-label={icon.name}
                  aria-pressed={icon.name === name}
                  onClick={() => setName(icon.name as IconName)}
                  className="grid aspect-square place-items-center rounded-md hover:bg-surface aria-pressed:bg-surface aria-pressed:ring-1 aria-pressed:ring-fg [&_svg]:size-6"
                  dangerouslySetInnerHTML={{ __html: svgMarkup(icon) }}
                />
              ))}
            </div>
          </fieldset>
          <Choice label="Gesture" value={gesture} options={['auto', ...(Object.keys(GESTURES) as Gesture[])]} onChange={setGesture} />
          <Choice label="Button" value={style} options={STYLE_OPTIONS} onChange={setStyle} />
          <label className="text-sm">
            <span className="mb-2 block text-muted">Text</span>
            <input value={label} maxLength={24} onChange={(e) => setLabel(e.target.value)} className="h-9 w-full rounded-md border border-line bg-bg px-3" />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Say hello on first view</span>
            <input type="checkbox" checked={greet} onChange={(e) => setGreet(e.target.checked)} className="size-4 accent-fg" />
          </label>
          <label className="text-sm">
            <span className="mb-2 flex justify-between text-muted"><span>Zoom</span><span className="tabular-nums">{zoom}×</span></span>
            <input type="range" min={1} max={4} step={0.5} value={zoom} onChange={(e) => setZoom(+e.target.value)} className="w-full accent-fg" />
          </label>
          <Choice label="Speed" value={speed} options={SPEEDS} onChange={setSpeed} show={(s) => (s === 1 ? 'Normal' : s === 0.5 ? 'Half' : 'Quarter')} />
        </div>
      </div>
    </section>
  );
}
