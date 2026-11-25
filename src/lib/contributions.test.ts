import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatDate,
  formatNumber,
  monotoneSegments,
  niceMax,
  parseContributionsHtml,
  toStats,
  toWeeks,
} from "./contributions.ts";

// recorte do HTML real de github.com/users/<user>/contributions (atributos em ordens diferentes)
const HTML = `
<h2 id="js-contribution-activity-description">
  1,013
  contributions
  in the last year
</h2>
<td tabindex="0" data-ix="0" data-date="2026-09-20" id="contribution-day-component-0-0" data-level="0" class="ContributionCalendar-day"></td>
<td data-date="2026-09-21" tabindex="0" id="contribution-day-component-1-0" data-level="1" class="ContributionCalendar-day"></td>
<td id="contribution-day-component-2-0" data-date="2026-09-22" data-level="4" class="ContributionCalendar-day"></td>
<td class="ContributionCalendar-label"><span>Mon</span></td>
<tool-tip id="tooltip-a" for="contribution-day-component-0-0" popover="manual" class="sr-only">No contributions on September 20th.</tool-tip>
<tool-tip id="tooltip-b" for="contribution-day-component-1-0" popover="manual" class="sr-only">1 contribution on September 21st.</tool-tip>
<tool-tip id="tooltip-c" for="contribution-day-component-2-0" popover="manual" class="sr-only">1,012 contributions on September 22nd.</tool-tip>
<tool-tip id="tooltip-d" for="something-else">Not a day</tool-tip>
`;

describe("parseContributionsHtml", () => {
  it("liga cada dia ao tooltip pelo id e lê a contagem por extenso", () => {
    const { days, total } = parseContributionsHtml(HTML);
    assert.deepEqual(days, [
      { date: "2026-09-20", count: 0 },
      { date: "2026-09-21", count: 1 },
      { date: "2026-09-22", count: 1012 },
    ]);
    assert.equal(total, 1013);
  });

  it("devolve lista vazia e total nulo quando a página não tem o calendário", () => {
    assert.deepEqual(parseContributionsHtml("<html></html>"), { days: [], total: null });
  });
});

describe("toWeeks", () => {
  it("agrupa de domingo a sábado e conta os dias da semana em curso", () => {
    const days = [
      { date: "2026-11-14", count: 2 }, // sábado
      { date: "2026-11-15", count: 3 }, // domingo
      { date: "2026-11-16", count: 4 },
      { date: "2026-11-17", count: 1 },
    ];
    assert.deepEqual(toWeeks(days), [
      { start: "2026-11-08", count: 2, days: 1 },
      { start: "2026-11-15", count: 8, days: 3 },
    ]);
  });
});

describe("toStats", () => {
  it("calcula total, dias ativos, maior sequência e semana mais intensa", () => {
    const days = [
      { date: "2026-11-01", count: 1 },
      { date: "2026-11-02", count: 2 },
      { date: "2026-11-03", count: 0 },
      { date: "2026-11-08", count: 5 },
      { date: "2026-11-09", count: 1 },
      { date: "2026-11-10", count: 1 },
    ];
    const stats = toStats(days, toWeeks(days));
    assert.equal(stats.total, 10);
    assert.equal(stats.activeDays, 5);
    assert.equal(stats.totalDays, 6);
    assert.equal(stats.longestStreak, 3);
    assert.equal(stats.peakWeek.start, "2026-11-08");
    assert.equal(stats.peakWeek.count, 7);
  });
});

describe("niceMax", () => {
  it("arredonda o teto do eixo para um passo legível", () => {
    assert.deepEqual(niceMax(85), { max: 100, step: 25 });
    assert.deepEqual(niceMax(79), { max: 80, step: 20 });
    assert.deepEqual(niceMax(12), { max: 20, step: 5 });
    assert.deepEqual(niceMax(0), { max: 4, step: 1 });
  });
});

describe("monotoneSegments", () => {
  it("gera um segmento por intervalo, terminando em cada ponto", () => {
    const pts = [
      { x: 0, y: 10 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
      { x: 30, y: 10 },
    ];
    const segs = monotoneSegments(pts);
    assert.equal(segs.length, 3);
    segs.forEach((s, i) => assert.match(s, new RegExp(` ${pts[i + 1].x} ${pts[i + 1].y}$`)));
  });

  it("não ultrapassa os pontos num trecho plano (sem inventar vale)", () => {
    const [, flat] = monotoneSegments([
      { x: 0, y: 10 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
      { x: 30, y: 10 },
    ]);
    const ys = flat.split(" ").slice(1).filter((_, i) => i % 2 === 1).map(Number);
    assert.ok(ys.every((y) => y === 0), `controles fora do plano: ${flat}`);
  });
});

describe("formatação", () => {
  it("escreve datas e números em pt-BR", () => {
    assert.equal(formatDate("2026-09-24"), "24 set 2026");
    assert.equal(formatDate("2026-10-18", false), "18 out");
    assert.equal(formatNumber(1399), "1.399");
  });
});
