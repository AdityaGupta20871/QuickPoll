// Type declarations for React Bits components (JSX imports)

declare module '@/components/PixelBlast' {
  import { CSSProperties } from 'react';
  
  interface PixelBlastProps {
    variant?: 'square' | 'circle' | 'triangle' | 'diamond';
    pixelSize?: number;
    color?: string;
    className?: string;
    style?: CSSProperties;
    antialias?: boolean;
    patternScale?: number;
    patternDensity?: number;
    liquid?: boolean;
    liquidStrength?: number;
    liquidRadius?: number;
    pixelSizeJitter?: number;
    enableRipples?: boolean;
    rippleIntensityScale?: number;
    rippleThickness?: number;
    rippleSpeed?: number;
    liquidWobbleSpeed?: number;
    autoPauseOffscreen?: boolean;
    speed?: number;
    transparent?: boolean;
    edgeFade?: number;
    noiseAmount?: number;
  }
  
  const PixelBlast: React.FC<PixelBlastProps>;
  export default PixelBlast;
}

declare module '@/components/Shuffle' {
  import { CSSProperties } from 'react';
  
  interface ShuffleProps {
    text: string;
    className?: string;
    style?: CSSProperties;
    shuffleDirection?: 'left' | 'right';
    duration?: number;
    maxDelay?: number;
    ease?: string;
    threshold?: number;
    rootMargin?: string;
    tag?: keyof JSX.IntrinsicElements;
    textAlign?: 'left' | 'center' | 'right';
    onShuffleComplete?: () => void;
    shuffleTimes?: number;
    animationMode?: 'evenodd' | 'random';
    loop?: boolean;
    loopDelay?: number;
    stagger?: number;
    scrambleCharset?: string;
    colorFrom?: string;
    colorTo?: string;
    triggerOnce?: boolean;
    respectReducedMotion?: boolean;
    triggerOnHover?: boolean;
  }
  
  const Shuffle: React.FC<ShuffleProps>;
  export default Shuffle;
}

declare module '@/components/PixelCard' {
  interface PixelCardProps {
    variant?: 'default' | 'blue' | 'yellow' | 'pink';
    gap?: number;
    speed?: number;
    colors?: string;
    noFocus?: boolean;
    className?: string;
    children?: React.ReactNode;
  }
  
  const PixelCard: React.FC<PixelCardProps>;
  export default PixelCard;
}
