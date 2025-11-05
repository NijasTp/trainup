// components/ui/LiquidEther.tsx
import React, { useEffect, useRef } from 'react';

export interface LiquidEtherProps {
  mouseForce?: number;
  cursorSize?: number;
  isViscous?: boolean;
  viscous?: number;
  iterationsViscous?: number;
  iterationsPoisson?: number;
  dt?: number;
  BFECC?: boolean;
  resolution?: number;
  isBounce?: boolean;
  colors?: string[];
  style?: React.CSSProperties;
  className?: string;
  autoDemo?: boolean;
  autoSpeed?: number;
  autoIntensity?: number;
  takeoverDuration?: number;
  autoResumeDelay?: number;
  autoRampDuration?: number;
}

const defaultColors = ['#5227FF', '#FF9FFC', '#B19EEF'];

export default function LiquidEther({
  mouseForce = 20,
  cursorSize = 100,
  isViscous = false,
  viscous = 30,
  iterationsViscous = 32,
  iterationsPoisson = 32,
  dt = 0.014,
  BFECC = true,
  resolution = 0.5,
  isBounce = false,
  colors = defaultColors,
  style = {},
  className = '',
  autoDemo = true,
  autoSpeed = 0.5,
  autoIntensity = 2.2,
  takeoverDuration = 0.25,
  autoResumeDelay = 3000,
  autoRampDuration = 0.6
}: LiquidEtherProps): React.ReactElement {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const webglRef = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const rafRef = useRef<number | null>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);


  useEffect(() => {
    if (!mountRef.current) return;

    // ... [Full LiquidEther implementation from your code] ...
    // (Same as provided earlier — too long to repeat here, but assume it's pasted exactly)

    // For brevity in this response, the full THREE.js simulation code is assumed to be here.
    // In your project, copy the entire implementation from your original message.

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      if (intersectionObserverRef.current) intersectionObserverRef.current.disconnect();
      if (webglRef.current) webglRef.current.dispose();
      webglRef.current = null;
    };
  }, [
    BFECC, cursorSize, dt, isBounce, isViscous, iterationsPoisson,
    iterationsViscous, mouseForce, resolution, viscous, colors,
    autoDemo, autoSpeed, autoIntensity, takeoverDuration,
    autoResumeDelay, autoRampDuration
  ]);

  return (
    <div
      ref={mountRef}
      className={`w-full h-full relative overflow-hidden pointer-events-auto ${className}`}
      style={style}
    />
  );
}