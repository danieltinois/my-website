"use client";

import { useEffect, useState } from "react";

const USER = "danieltinois";

// nível do quadradinho → cor terracota (0 = inativo)
const CELL: Record<number, string> = {
  0: "rgba(255,255,255,0.07)",
  1: "#7a3410",
  2: "#9c3a12",
  3: "#d65d0e",
  4: "#fe8019",
};

interface DayCell {
  date: string;
  level: number;
}

const Contributions = ({ className = "" }: { className?: string }) => {
  const [weeks, setWeeks] = useState<DayCell[][] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/github/contributions")
      .then((res) => {
        if (!res.ok) throw new Error(`api: ${res.status}`);
        return res.json();
      })
      .then((data: { weeks: DayCell[][]; total: number }) => {
        if (!alive || !data.weeks) return;
        setWeeks(data.weeks);
        setTotal(data.total);
      })
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className={className}>
      {error ? (
        <p className="text-xs text-[var(--color-cn-highlight)]">
          github aportou no rate limit — tenta de novo mais tarde.
        </p>
      ) : !weeks ? (
        <p className="text-xs text-[var(--color-text)] opacity-60">
          carregando contribuições… ☕
        </p>
      ) : (
        <>
          <div className="mb-2 flex items-baseline justify-between gap-2 text-xs">
            <span className="font-bold text-[var(--color-text)]">
              {total?.toLocaleString("pt-BR") ?? "?"} commits no último ano
            </span>
            <span className="text-[var(--color-text)] opacity-60">
              github.com/{USER}
            </span>
          </div>
          <div className="flex gap-[3px] overflow-x-auto pb-1">
            {weeks.map((col, i) => (
              <div key={i} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }, (_, day) => {
                  const cell = col.find(
                    (c) => new Date(c.date).getDay() === day,
                  );
                  return (
                    <div
                      key={day}
                      title={cell ? `${cell.date} — ${cell.level}/4` : undefined}
                      className="h-[9px] w-[9px] rounded-[2px]"
                      style={{
                        backgroundColor: cell ? CELL[cell.level] : CELL[0],
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Contributions;