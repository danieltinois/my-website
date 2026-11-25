"use client";

import { useSyncExternalStore } from "react";

// hora de São Paulo, ao vivo. No servidor (e na hidratação) mostra "--:--" com a mesma largura.
const fmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  hour: "2-digit",
  minute: "2-digit",
});

const subscribe = (onChange: () => void) => {
  const id = setInterval(onChange, 10_000);
  return () => clearInterval(id);
};

const Clock = () => {
  const time = useSyncExternalStore(subscribe, () => fmt.format(new Date()), () => "--:--");
  return <time className="tabular-nums">{time}</time>;
};

export default Clock;
