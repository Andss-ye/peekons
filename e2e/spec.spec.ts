import { expect, test } from '@playwright/test';

interface Report {
  name: string;
  box: [number, number, number, number];
  size: number;
  eyes: { r: number; x: number; y: number; wink: boolean }[];
  shortLines: number[];
  strokeAttr: boolean;
}

test('every icon follows the drawing spec', async ({ page }) => {
  await page.goto('/sheet.html');
  const reports: Report[] = await page.evaluate(() =>
    [...document.querySelectorAll('#light figure')].map((fig) => {
      const svg = fig.querySelector('svg')!;
      const frame = svg.getBoundingClientRect();
      const k = 24 / frame.width;
      const local = (r: DOMRect) => [(r.left - frame.left) * k, (r.top - frame.top) * k, (r.right - frame.left) * k, (r.bottom - frame.top) * k];
      const ink = [Infinity, Infinity, -Infinity, -Infinity];
      const geo = [Infinity, Infinity, -Infinity, -Infinity];
      for (const el of svg.querySelectorAll<SVGGraphicsElement>('path, rect, circle, ellipse, line')) {
        const [x0, y0, x1, y1] = local(el.getBoundingClientRect());
        const st = getComputedStyle(el);
        const half = st.stroke === 'none' ? 0 : parseFloat(st.strokeWidth) / 2;
        geo.splice(0, 4, Math.min(geo[0]!, x0!), Math.min(geo[1]!, y0!), Math.max(geo[2]!, x1!), Math.max(geo[3]!, y1!));
        ink.splice(0, 4, Math.min(ink[0]!, x0! - half), Math.min(ink[1]!, y0! - half), Math.max(ink[2]!, x1! + half), Math.max(ink[3]!, y1! + half));
      }
      const eyes = [...svg.querySelectorAll<SVGCircleElement>('.pk-eye')].map((e) => {
        const [x0, y0, x1, y1] = local(e.getBoundingClientRect());
        return { r: e.r.baseVal.value, x: (x0! + x1!) / 2, y: (y0! + y1!) / 2, wink: e.classList.contains('pk-wink') };
      });
      const shortLines = [...svg.querySelectorAll<SVGPathElement>('path.pk-line')].map((p) => p.getTotalLength()).filter((l) => l < 3.5);
      return {
        name: fig.querySelector('figcaption')!.textContent!,
        box: ink as Report['box'],
        size: Math.max(geo[2]! - geo[0]!, geo[3]! - geo[1]!),
        eyes,
        shortLines,
        strokeAttr: !!svg.querySelector('[stroke-width]'),
      };
    })
  );
  expect(reports.length).toBeGreaterThanOrEqual(27);
  const problems = reports.flatMap((r) => {
    const out: string[] = [];
    const [x0, y0, x1, y1] = r.box;
    if (x0 < 1.95 || y0 < 1.95 || x1 > 22.05 || y1 > 22.05) out.push(`sale de la zona viva ${r.box.map((v) => v.toFixed(1)).join(',')}`);
    if (r.size < 15) out.push(`muy chico: ${r.size.toFixed(1)}`);
    if (r.eyes.length !== 2) out.push(`${r.eyes.length} ojos`);
    else {
      const [a, b] = r.eyes as [Report['eyes'][0], Report['eyes'][0]];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (Math.abs(a.r - 1.3) > 0.01 || Math.abs(b.r - 1.3) > 0.01) out.push('ojos de r distinto a 1.3');
      if (d < 3.95 || d > 5.55) out.push(`ojos a ${d.toFixed(2)}`);
      if ([a, b].some((e) => e.y < 7 || e.y > 15.5)) out.push(`ojos a una altura de ${a.y.toFixed(1)}/${b.y.toFixed(1)}`);
      const right = a.x > b.x ? a : b;
      if (!right.wink) out.push('el guiño no está en el ojo derecho');
    }
    if (r.shortLines.length) out.push(`detalles cortos: ${r.shortLines.map((l) => l.toFixed(1)).join(',')}`);
    if (r.strokeAttr) out.push('stroke-width en el SVG');
    return out.map((p) => `${r.name}: ${p}`);
  });
  expect(problems).toEqual([]);
});
