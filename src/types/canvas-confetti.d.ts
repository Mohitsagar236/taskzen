declare module 'canvas-confetti' {
  interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    colors?: string[];
    shapes?: string[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
    origin?: {
      x?: number;
      y?: number;
    };
  }
  
  type ConfettiCannon = (options?: ConfettiOptions) => Promise<null>;
  
  interface ConfettiFunction extends ConfettiCannon {
    reset: () => void;
    create: (canvas: HTMLCanvasElement, options?: { resize?: boolean; useWorker?: boolean }) => ConfettiCannon;
  }
  
  const confetti: ConfettiFunction;
  export default confetti;
}