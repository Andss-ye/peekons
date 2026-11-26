import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { attach } from '../src/index.js';
import { mail } from '../src/icons/index.js';
import * as icons from '../src/icons/index.js';
import type * as Sound from '../src/sound.js';
import { installAnimate, installIO, intersect, reduceMotion } from './fake-animate.js';
import { contexts, end, installAudio, nodes } from './fake-audio.js';

let chirp: typeof Sound.chirp, setSound: typeof Sound.setSound, soundFrom: typeof Sound.soundFrom, VOICES: typeof Sound.VOICES;

// el módulo guarda su AudioContext: cada test lo carga de cero
beforeEach(async () => {
  installAnimate();
  installIO();
  installAudio();
  reduceMotion(false);
  vi.resetModules();
  ({ chirp, setSound, soundFrom, VOICES } = await import('../src/sound.js'));
  document.body.innerHTML = '<button>Go</button>';
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
const host = () => document.querySelector('button')!;
const enter = () => host().dispatchEvent(new PointerEvent('pointerenter'));

describe('engine', () => {
  it('stays silent when no sound is given', () => {
    attach(host(), mail);
    enter();
    expect(contexts).toBe(0);
  });

  it('calls the sound on hover and on hello, with the moment', () => {
    const sound = vi.fn();
    attach(host(), mail, { sound });
    enter();
    expect(sound).toHaveBeenLastCalledWith(mail, 'peek');
    document.body.innerHTML = '<button>Go</button>';
    attach(host(), mail, { sound });
    intersect(host());
    expect(sound).toHaveBeenLastCalledWith(mail, 'hello');
  });

  it('a hello in the cascade sounds when its turn comes, and not at all if a hover takes over first', () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<a>1</a><a>2</a>';
    const sound = vi.fn();
    const [a, b] = [...document.querySelectorAll('a')];
    attach(a!, mail, { sound });
    attach(b!, mail, { sound });
    intersect(a!, b!);
    expect(sound).toHaveBeenCalledTimes(1);
    b!.dispatchEvent(new PointerEvent('pointerenter'));
    expect(sound).toHaveBeenLastCalledWith(mail, 'peek');
    vi.advanceTimersByTime(500);
    expect(sound).toHaveBeenCalledTimes(2);
  });

  it('only the first four hellos of a batch make a sound', () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<a></a>'.repeat(6);
    const sound = vi.fn();
    const hosts = [...document.querySelectorAll('a')];
    hosts.forEach((h) => attach(h, mail, { sound }));
    intersect(...hosts);
    vi.advanceTimersByTime(2000);
    expect(sound).toHaveBeenCalledTimes(4);
  });

  it('a sound that throws does not stop the other hellos', () => {
    document.body.innerHTML = '<a>1</a><a>2</a>';
    const [a, b] = [...document.querySelectorAll('a')];
    attach(a!, mail, { sound: () => { throw new Error('no audio'); } });
    attach(b!, mail);
    expect(() => intersect(a!, b!)).not.toThrow();
    expect(b!.querySelector('.pk svg')).not.toBeNull();
  });

  it('does not call the sound with reduced motion', () => {
    reduceMotion(true);
    const sound = vi.fn();
    attach(host(), mail, { sound });
    enter();
    expect(sound).not.toHaveBeenCalled();
  });
});

describe('chirp', () => {
  it('creates no audio context until the first sound', async () => {
    expect(contexts).toBe(0);
    chirp(mail, 'peek');
    expect(contexts).toBe(1);
  });

  it('every icon has a known voice, and each voice lets go of its nodes when it ends', () => {
    for (const icon of Object.values(icons)) {
      expect(VOICES, icon.name).toContain(icon.voice);
      nodes.length = 0;
      chirp(icon, 'peek');
      expect(nodes.length, icon.name).toBeGreaterThan(0);
      end();
      expect(nodes.filter((n) => !n.disconnected).map((n) => n.kind), icon.name).toEqual([]);
    }
  });

  it('is silent when turned off', () => {
    setSound(false);
    chirp(mail, 'peek');
    expect(nodes).toHaveLength(0);
  });

  it('does not queue sounds while the browser keeps audio locked', async () => {
    vi.resetModules();
    installAudio('suspended');
    const fresh = await import('../src/sound.js');
    fresh.chirp(mail, 'peek');
    expect(contexts).toBe(1);
    expect(nodes).toHaveLength(0);
  });
});

describe('soundFrom', () => {
  it('plays the file from the start each time and respects the switch', () => {
    const play = vi.fn(() => Promise.resolve());
    const made: { src: string; currentTime: number }[] = [];
    globalThis.Audio = class {
      currentTime = 5;
      constructor(public src: string) {
        made.push(this);
      }
      play = play;
    } as unknown as typeof Audio;
    const sound = soundFrom('/pop.mp3');
    sound(mail, 'peek');
    sound(mail, 'peek');
    expect(made).toHaveLength(1);
    expect(made[0]!.currentTime).toBe(0);
    expect(play).toHaveBeenCalledTimes(2);
    setSound(false);
    sound(mail, 'peek');
    expect(play).toHaveBeenCalledTimes(2);
  });
});
