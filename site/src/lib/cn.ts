import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Une clases condicionales y resuelve los choques de Tailwind, como en shadcn/ui. */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
