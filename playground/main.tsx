import '../peekons.css';
import { createRoot } from 'react-dom/client';
import { mount } from '../src/index.js';
import * as icons from '../src/icons/index.js';
import { Peekon } from '../src/react.js';

const grid = document.getElementById('buttons')!;
for (const icon of Object.values(icons)) {
  const b = document.createElement('button');
  b.className = 'btn';
  b.dataset.peekon = icon.name;
  b.textContent = icon.name;
  grid.append(b);
}
mount(icons, { greet: false });

createRoot(document.getElementById('react')!).render(
  <>
    <button className="btn solid" id="react-btn" onClick={() => ((window as { clicks?: number }).clicks = ((window as { clicks?: number }).clicks ?? 0) + 1)}>
      React button
      <Peekon icon={icons.mail} greet={false} />
    </button>
  </>
);
