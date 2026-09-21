"use client";

import { useEffect, useRef } from "react";
import rough from "roughjs";

export type SketchProps = {
  size?: number;
  className?: string;
  draw: (rc: ReturnType<typeof rough.svg>) => void;
};

const Sketch = ({ size = 150, className, draw }: SketchProps) => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const rc = rough.svg(svg);
    draw(rc);
  }, [draw]);

  return (
    <svg
      ref={ref}
      className={className}
      viewBox="0 0 200 200"
      width={size}
      height={size}
      aria-hidden="true"
    />
  );
};

export default Sketch;