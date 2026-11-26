/**
 * Compila icons/*.svg a src/icons/<name>.ts con svgo y regenera el índice.
 * Falla si un ícono no tiene ojo que guiña, usa una clase fuera del set o un gesto desconocido.
 */
import { readdirSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { optimize } from 'svgo';
import { GESTURES } from '../src/peek.js';
import { VOICES } from '../src/sound.js';

const SRC = 'icons';
const OUT = 'src/icons';
const CLASSES = new Set(['pk-body', 'pk-line', 'pk-eye', 'pk-wink', 'pk-blush', 'pk-accent', 'pk-solid', 'pk-rev']);

const RESERVED = new Set(
  'index eval arguments break case catch class const continue debugger default delete do else enum export extends false finally for function if implements import in instanceof interface let new null package private protected public return static super switch this throw true try typeof var void while with yield await'.split(' ')
);

const files = readdirSync(SRC).filter((f) => f.endsWith('.svg')).sort();

const built = files.map((file) => {
  const name = basename(file, '.svg');
  const raw = readFileSync(join(SRC, file), 'utf8');
  const gesture = raw.match(/data-gesture="([^"]+)"/)?.[1] ?? 'wink';
  const voice = raw.match(/data-voice="([^"]+)"/)?.[1] ?? 'blip';
  if (!(VOICES as readonly string[]).includes(voice)) throw new Error(`${file}: voz desconocida "${voice}"`);
  if (/stroke-width/.test(raw)) throw new Error(`${file}: los grosores vienen de peekons.css, no del SVG`);
  if (!/^[a-z][a-z0-9]*$/.test(name) || RESERVED.has(name))
    throw new Error(`${file}: el nombre debe ser un identificador en minúsculas y no una palabra reservada`);
  if (!Object.hasOwn(GESTURES, gesture)) throw new Error(`${file}: gesto desconocido "${gesture}"`);
  const { data } = optimize(raw, { multipass: true, floatPrecision: 2, plugins: ['preset-default', 'removeDimensions'] });
  const inner = data.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  for (const [, cls] of inner.matchAll(/class="([^"]+)"/g))
    for (const c of cls!.split(' ')) if (!CLASSES.has(c)) throw new Error(`${file}: clase desconocida "${c}"`);
  if (!inner.includes('pk-wink')) throw new Error(`${file}: falta el ojo .pk-wink`);
  return {
    name,
    code: `import type { PeekIcon } from '../peek.js';\n\nexport const ${name}: PeekIcon = {\n  name: '${name}',\n  gesture: '${gesture}',\n  voice: '${voice}',\n  svg: ${JSON.stringify(inner)},\n};\n`,
  };
});

// solo se reescribe la carpeta cuando todos los íconos pasaron
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);
for (const { name, code } of built) writeFileSync(join(OUT, `${name}.ts`), code);
const names = built.map((b) => b.name);
writeFileSync(join(OUT, 'index.ts'), names.map((n) => `export { ${n} } from './${n}.js';`).join('\n') + '\n');
console.log(`${names.length} íconos → ${OUT}`);
