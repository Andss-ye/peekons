// PulsatingButton de Magic UI (MIT, https://github.com/magicuidesign/magicui), con un color de pulso fijo.
import type * as React from 'react';
import { cn } from '../../lib/cn';

export function PulsatingButton({
  className,
  children,
  pulseColor = '#6d4aff80',
  duration = '1.5s',
  distance = '8px',
  ...props
}: React.ComponentProps<'button'> & { pulseColor?: string; duration?: string; distance?: string }) {
  return (
    <button
      className={cn('relative flex cursor-pointer items-center justify-center rounded-lg bg-primary px-4 py-2 text-center text-primary-foreground', className)}
      style={{ '--pulse-color': pulseColor, '--duration': duration, '--distance': distance } as React.CSSProperties}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 animate-pulse rounded-[inherit] bg-inherit" />
    </button>
  );
}
