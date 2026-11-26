/**
 * AudioContext de mentira: registra cada nodo, sus conexiones y desconexiones.
 * `end()` dispara el `onended` de cada fuente como si hubieran terminado de sonar.
 */
import { vi } from 'vitest';

export interface Node {
  kind: string;
  connected: number;
  disconnected: boolean;
  onended?: (() => void) | null;
}
export const nodes: Node[] = [];
export let contexts = 0;

const param = () => ({ value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), setTargetAtTime: vi.fn() });

function node(kind: string) {
  const n: Node & Record<string, unknown> = {
    kind,
    connected: 0,
    disconnected: false,
    connect(to: unknown) {
      n.connected++;
      return to;
    },
    disconnect() {
      n.disconnected = true;
    },
    start: vi.fn(),
    stop: vi.fn(),
    frequency: param(),
    gain: param(),
    Q: param(),
    detune: param(),
    type: '',
    buffer: null,
  };
  nodes.push(n);
  return n;
}

export function installAudio(state: 'running' | 'suspended' = 'running') {
  nodes.length = 0;
  contexts = 0;
  globalThis.AudioContext = class {
    state = state;
    currentTime = 0;
    sampleRate = 44100;
    destination = { kind: 'destination' };
    constructor() {
      contexts++;
    }
    resume() {
      return Promise.resolve();
    }
    createOscillator = () => node('osc');
    createGain = () => node('gain');
    createBiquadFilter = () => node('filter');
    createBufferSource = () => node('buffer');
    createBuffer = (_c: number, length: number) => ({ getChannelData: () => new Float32Array(length) });
  } as unknown as typeof AudioContext;
}

export const end = () => nodes.forEach((n) => n.onended?.());
