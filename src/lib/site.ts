// Централна конфигурация на сайта + дизайн токени от макета.
export const SITE = {
  name: "AI Академия",
  tagline: "Изкуствен интелект · на български",
  description:
    "Седмичен бюлетин за изкуствения интелект. Новини, анализи и учебни материали — на разбираем български.",
  url: "https://ai-akademia.bg",
  subscribers: "14 200",
  issues: 47,
  city: "София",
};

// Цветова палитра (от дизайна).
export const TONES = {
  ink: "#221E18",
  terra: "#A8431F",
  sage: "#4C5A50",
  slate: "#37434E",
  ochre: "#9A6B27",
  plum: "#534056",
  accent: "#BB4A2C",
  cream: "#F4EEE2",
} as const;

// Навигация.
export const NAV: { label: string; href: string }[] = [
  { label: "Начало", href: "/" },
  { label: "Архив", href: "/archive" },
  { label: "Ръководства", href: "/guides" },
  { label: "Инструменти", href: "/tools" },
  { label: "За нас", href: "/about" },
];

// Палитра за панелите на статиите (циклично, ако липсва panelColor).
export const PANEL_PALETTE = [
  TONES.ink,
  TONES.terra,
  TONES.sage,
  TONES.slate,
  TONES.ochre,
  TONES.plum,
];

// Форматиране на дата на български.
const BG_MONTHS = [
  "януари", "февруари", "март", "април", "май", "юни",
  "юли", "август", "септември", "октомври", "ноември", "декември",
];

export function formatDateBg(date: Date): string {
  return `${date.getDate()} ${BG_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateShort(date: Date): string {
  return `${date.getDate()} ${BG_MONTHS[date.getMonth()]}`;
}
