/**
 * Voces sintetizadas para peekons, opcionales: `<Peekon icon={mail} sound={chirp} />`.
 * Nada suena ni se crea hasta el primer sonido, y nunca mientras el navegador bloquee el audio.
 */
import type { PeekIcon, PeekSound } from './peek.js';

export const VOICES = ['blip', 'boing', 'bubble', 'chime', 'sparkle', 'squeak', 'thock', 'whoosh'] as const;
export type Voice = (typeof VOICES)[number];

const MASTER = 0.18;
let enabled = true;
let ctx: AudioContext | undefined;
let hiss: AudioBuffer | undefined;

/** Enciende o apaga todos los sonidos de peekons. Llamada desde un click, también destraba el audio. */
export function setSound(on: boolean) {
  enabled = on;
  if (on) ctx?.resume().catch(() => {});
}

function context() {
  if (!enabled || typeof AudioContext !== 'function') return;
  ctx ??= new AudioContext();
  if (ctx.state === 'running') return ctx;
  // sin un gesto previo del usuario el navegador lo deja suspendido: se intenta y este sonido se omite
  ctx.resume().catch(() => {});
}

interface Kit {
  osc: (type: OscillatorType, from: number, to: number, dur: number, at?: number, peak?: number) => OscillatorNode;
  noise: (dur: number, from: number, to: number, at?: number, peak?: number, q?: number) => void;
  wobble: (target: OscillatorNode, rate: number, depth: number, dur: number) => void;
}

const SCORE: Record<Voice, (k: Kit) => void> = {
  blip: (k) => k.osc('square', 620, 940, 0.07, 0, 0.3),
  boing: (k) => k.wobble(k.osc('sine', 180, 430, 0.34), 14, 28, 0.34),
  bubble: (k) => k.osc('sine', 280, 980, 0.13, 0, 0.9),
  chime: (k) => (k.osc('sine', 1318, 1318, 0.6, 0, 0.5), k.osc('sine', 1976, 1976, 0.45, 0, 0.22)),
  sparkle: (k) => [1568, 2093, 2637].forEach((f, i) => k.osc('triangle', f, f, 0.12, i * 0.05, 0.45)),
  squeak: (k) => (k.osc('triangle', 820, 1500, 0.09, 0, 0.7), k.osc('triangle', 1500, 1100, 0.08, 0.08, 0.6)),
  thock: (k) => (k.osc('sine', 240, 110, 0.09), k.noise(0.04, 1200, 900, 0, 0.5, 3)),
  whoosh: (k) => k.noise(0.28, 350, 2200, 0, 0.6, 0.8),
};

function play(voice: Voice, level: number) {
  const c = context();
  if (!c) return;
  const t = c.currentTime;
  const parts: AudioNode[] = [];
  const sources: AudioScheduledSourceNode[] = [];
  const gain = (v: number) => {
    const g = c.createGain();
    g.gain.value = v;
    parts.push(g);
    return g;
  };
  const out = gain(MASTER * level);
  out.connect(c.destination);
  const envelope = (at: number, dur: number, peak: number) => {
    const e = gain(0);
    e.gain.setValueAtTime(0.0001, t + at);
    e.gain.exponentialRampToValueAtTime(peak, t + at + 0.01);
    e.gain.exponentialRampToValueAtTime(0.0001, t + at + dur);
    e.connect(out);
    return e;
  };
  const run = (s: AudioScheduledSourceNode, at: number, dur: number) => {
    s.start(t + at);
    s.stop(t + at + dur + 0.02);
    parts.push(s);
    sources.push(s);
  };
  const kit: Kit = {
    osc(type, from, to, dur, at = 0, peak = 1) {
      const o = c.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(from, t + at);
      o.frequency.exponentialRampToValueAtTime(to, t + at + dur);
      o.connect(envelope(at, dur, peak));
      run(o, at, dur);
      return o;
    },
    noise(dur, from, to, at = 0, peak = 1, q = 1.5) {
      hiss ??= (() => {
        const b = c.createBuffer(1, Math.ceil(c.sampleRate * 0.3), c.sampleRate);
        const data = b.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        return b;
      })();
      const s = c.createBufferSource();
      s.buffer = hiss;
      const f = c.createBiquadFilter();
      f.type = 'bandpass';
      f.Q.value = q;
      f.frequency.setValueAtTime(from, t + at);
      f.frequency.exponentialRampToValueAtTime(to, t + at + dur);
      parts.push(f);
      s.connect(f).connect(envelope(at, dur, peak));
      run(s, at, dur);
    },
    wobble(target, rate, depth, dur) {
      const lfo = c.createOscillator();
      lfo.frequency.value = rate;
      lfo.connect(gain(depth)).connect(target.frequency);
      run(lfo, 0, dur);
    },
  };
  SCORE[voice](kit);
  // cuando la última fuente termina, se suelta todo el grafo de este sonido
  let left = sources.length;
  for (const s of sources) s.onended = () => --left === 0 && parts.forEach((p) => p.disconnect());
}

/** La voz propia de cada ícono; el saludo suena más bajo que el hover. */
export const chirp: PeekSound = (icon: PeekIcon, moment) => {
  const voice = (VOICES as readonly string[]).includes(icon.voice ?? '') ? (icon.voice as Voice) : 'blip';
  play(voice, moment === 'hello' ? 0.6 : 1);
};

/** Un archivo de audio propio para cualquier ícono: `sound={soundFrom('/pop.mp3')}`. */
export function soundFrom(url: string): PeekSound {
  let audio: HTMLAudioElement | undefined;
  return () => {
    if (!enabled) return;
    audio ??= new Audio(url);
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };
}
