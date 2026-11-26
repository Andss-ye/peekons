/**
 * El sonido de la landing: se apaga o enciende según la preferencia guardada apenas se carga el
 * módulo, antes de que una isla pueda saludar.
 */
import { setSound } from 'peekons/sound';

if (typeof localStorage !== 'undefined') setSound(localStorage.getItem('peekons-sound') === 'on');

export { chirp, setSound } from 'peekons/sound';
