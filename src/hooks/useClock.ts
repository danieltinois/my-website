"use client";

import { useEffect, useState } from "react";

export const useClock = () => {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // hora só existe no cliente — evita mismatch de hydration no export estático
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(timer);
  }, []);

  return now;
};
