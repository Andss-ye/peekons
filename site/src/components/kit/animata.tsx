// Botones de Animata (MIT, https://github.com/codse/animata), con el texto como prop.
import { ArrowRight } from 'lucide-react';
import type * as React from 'react';
import { cn } from '../../lib/cn';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

/** «duolingo»: botón 3D que se hunde al apretarlo. */
export function Duolingo({ children, className, ...props }: Props) {
  return (
    <button
      type="button"
      className={cn(
        'relative isolate box-border inline-block h-11 cursor-pointer touch-manipulation rounded-lg border-b-4 border-solid border-transparent bg-sky-600 px-4 py-3 text-center text-sm leading-5 font-bold tracking-wider whitespace-nowrap text-white uppercase outline-hidden transition-all duration-200 hover:brightness-110 active:border-t-4 active:border-b-0 active:bg-none',
        className
      )}
      {...props}
    >
      {children}
      <span className="absolute inset-0 -z-10 rounded-lg border-b-4 border-solid border-transparent bg-sky-500" />
    </button>
  );
}

/** «shining-button»: un brillo cruza el botón y la flecha avanza. */
export function ShiningButton({ children, className, ...props }: Props) {
  return (
    <button type="button" className={cn('group/shine cursor-pointer rounded-xl border-4 border-violet-800/0 bg-transparent p-1 transition-colors duration-500 hover:border-violet-800/100', className)} {...props}>
      <div className="relative flex items-center justify-center gap-4 overflow-hidden rounded-lg bg-violet-800 px-6 py-4 font-bold text-white">
        {children}
        <ArrowRight className="transition-all duration-700 ease-in-out group-hover/shine:translate-x-2 group-hover/shine:scale-125" />
        <div className="absolute top-0 -left-16 h-full w-12 scale-y-150 rotate-[30deg] bg-white/10 transition-all duration-700 ease-in-out group-hover/shine:left-[calc(100%+1rem)]" />
      </div>
    </button>
  );
}

/** «swipe-button»: el texto se reemplaza deslizándose hacia arriba. */
export function SwipeButton({ firstText, secondText, className, firstClass = 'bg-orange-500 text-white', secondClass = 'bg-black text-white', ...props }: Props & { firstText: string; secondText: string; firstClass?: string; secondClass?: string }) {
  const common = 'block px-4 py-2 text-lg font-bold duration-300 ease-in-out';
  return (
    <button type="button" {...props} className={cn('group/button relative min-w-fit cursor-pointer overflow-hidden rounded-md', className)}>
      <span className={cn('absolute inset-0 translate-y-full group-hover/button:translate-y-0', common, secondClass)}>{secondText}</span>
      <span className={cn('group-hover/button:-translate-y-full', common, firstClass)}>{firstText}</span>
    </button>
  );
}

/** «slide-arrow-button»: el círculo de la flecha se estira hasta llenar el botón. */
export function SlideArrowButton({ children, className, primaryColor = '#6f3cff', ...props }: Props & { primaryColor?: string }) {
  return (
    <button type="button" className={cn('group/slide relative cursor-pointer rounded-full border border-white bg-white p-2 text-base font-semibold', className)} {...props}>
      <div className="absolute top-0 left-0 flex h-full w-11 items-center justify-end rounded-full transition-all duration-200 ease-in-out group-hover/slide:w-full" style={{ backgroundColor: primaryColor }}>
        <span className="mr-3 text-white transition-all duration-200 ease-in-out">
          <ArrowRight size={20} />
        </span>
      </div>
      <span className="relative left-4 z-10 px-8 font-semibold whitespace-nowrap text-black transition-all duration-200 ease-in-out group-hover/slide:-left-3 group-hover/slide:text-white">{children}</span>
    </button>
  );
}

/** «get-started-button»: colores que se invierten y una flecha que entra. */
export function GetStartedButton({ children, className, ...props }: Props) {
  return (
    <button type="button" className={cn('group/start flex h-12 w-44 cursor-pointer items-center justify-center gap-3 rounded-lg bg-amber-100 p-2 font-bold transition-colors duration-100 ease-in-out hover:bg-orange-600', className)} {...props}>
      <span className="text-orange-600 transition-colors duration-100 ease-in-out group-hover/start:text-amber-100">{children}</span>
      <div className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-orange-600 transition-transform duration-100 group-hover/start:bg-amber-100">
        <div className="absolute left-0 flex h-7 w-14 -translate-x-1/2 items-center justify-center transition-transform duration-200 ease-in-out group-hover/start:translate-x-0">
          <ArrowRight size={16} className="size-7 transform p-1 text-orange-600 opacity-0 group-hover/start:opacity-100" />
          <ArrowRight size={16} className="size-7 transform p-1 text-amber-100 opacity-100 transition-transform duration-300 ease-in-out group-hover/start:opacity-0" />
        </div>
      </div>
    </button>
  );
}
