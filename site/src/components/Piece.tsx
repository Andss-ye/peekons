import { Peekon } from 'peekons/react';
import * as icons from 'peekons/icons';
import { chirp } from '../lib/sound';
import type { Gesture } from 'peekons';
import type { IconName, Piece } from '../data/pieces';

/** Una pieza del catálogo con su mascota, dentro de un envoltorio si el componente recorta. */
export function PieceView({ piece, icon = piece.icon, gesture, greet = true }: { piece: Piece; icon?: IconName; gesture?: string; greet?: boolean }) {
  const peek = <Peekon icon={icons[icon]} gesture={(gesture ?? piece.gesture) as Gesture | undefined} greet={greet} sound={chirp} />;
  return piece.wrap ? (
    <span className="relative inline-flex">
      {piece.render(null)}
      {peek}
    </span>
  ) : (
    piece.render(peek)
  );
}
