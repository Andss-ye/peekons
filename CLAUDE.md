# peekons

Íconos con cara que se asoman de un host al hover/focus. Núcleo vanilla (`src/peek.ts`, `src/mount.ts`),
React en `src/react.tsx`, estilos en `peekons.css`. Repo pensado para ser público: sin rutas del
sistema ni datos personales.

## Comandos

- `npm test` (vitest + happy-dom, `animate` simulado en `test/fake-animate.ts`)
- `npm run typecheck` · `npm run build` (regenera íconos y compila a `dist/`)
- `npm run e2e` (Playwright con el Chrome instalado; levanta y baja el playground en :5199)
- `playground/sheet.html`: hoja de diseño de los íconos en grande, claro y oscuro
- Landing en `site/` (Astro 7 + React + Tailwind 4, importa `../src` por alias): `npm run build` y
  `npx playwright test` dentro de `site/`. `astro preview` queda desprendido: probar con `vite preview`.

## Reglas

- `src/icons/` es generado: se edita `icons/*.svg` y se corre `npm run icons`. El build rechaza clases
  fuera del set `pk-*`, gestos desconocidos y íconos sin `.pk-wink`.
- Cero dependencias de runtime; React es peer opcional.
- Todo lo que `bind` engancha se suelta en su cleanup; el e2e de 500 montajes lo mide con CDP.
- En reposo el `.pk` está vacío: el SVG se crea al actuar y se borra al esconderse. El saludo usa un
  solo IntersectionObserver por página.
