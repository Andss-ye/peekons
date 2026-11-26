// RippleButton de Magic UI (MIT, https://github.com/magicuidesign/magicui).
import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import type * as React from 'react';
import { cn } from '../../lib/cn';

type RippleItem = { x: number; y: number; size: number; key: number };

function ButtonRipple({ ripple, duration, rippleColor, onDone }: { ripple: RippleItem; duration: string; rippleColor: string; onDone: (key: number) => void }) {
  useEffect(() => {
    const timeout = setTimeout(() => onDone(ripple.key), parseInt(duration, 10));
    return () => clearTimeout(timeout);
  }, [duration, onDone, ripple.key]);
  return (
    <span
      className="absolute animate-rippling rounded-full bg-background opacity-30"
      style={{ width: ripple.size, height: ripple.size, top: ripple.y, left: ripple.x, backgroundColor: rippleColor, transform: 'scale(0)', '--duration': duration } as CSSProperties}
    />
  );
}

export function RippleButton({ className, children, rippleColor = '#ffffff', duration = '600ms', onClick, ...props }: React.ComponentProps<'button'> & { rippleColor?: string; duration?: string }) {
  const [ripples, setRipples] = useState<RippleItem[]>([]);
  const next = useRef(0);
  const remove = useCallback((key: number) => setRipples((all) => all.filter((r) => r.key !== key)), []);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    next.current += 1;
    setRipples((all) => [...all, { x: event.clientX - rect.left - size / 2, y: event.clientY - rect.top - size / 2, size, key: next.current }]);
    onClick?.(event);
  };
  return (
    <button
      className={cn('relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 bg-background px-4 py-2 text-center text-primary', className)}
      onClick={handleClick}
      {...props}
    >
      <div className="relative z-10">{children}</div>
      <span className="pointer-events-none absolute inset-0">
        {ripples.map((r) => (
          <ButtonRipple key={r.key} duration={duration} onDone={remove} ripple={r} rippleColor={rippleColor} />
        ))}
      </span>
    </button>
  );
}
