import '../peekons.css';
import { svgMarkup } from '../src/index.js';
import * as icons from '../src/icons/index.js';

/** Hoja de diseño: cada ícono en grande y a tamaño real, en claro y en oscuro (`?only=a,b` filtra). */
const only = new URLSearchParams(location.search).get('only')?.split(',');
for (const id of ['light', 'dark']) {
  const panel = document.getElementById(id)!;
  for (const icon of Object.values(icons)) {
    if (only && !only.includes(icon.name)) continue;
    const svg = svgMarkup(icon);
    panel.insertAdjacentHTML('beforeend', `<figure>${svg}<br>${svg.replace('<svg', '<svg class="real"')}<figcaption>${icon.name}</figcaption></figure>`);
  }
}
