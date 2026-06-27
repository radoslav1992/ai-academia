import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Статии и броеве (новини, анализи, ръководства-статии).
const articles = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    standfirst: z.string(), // подзаглавие / увод
    kicker: z.string(), // напр. "Новини", "Анализ"
    category: z.enum([
      "Новини",
      "Анализи",
      "Ръководства",
      "Обучение",
      "Инструменти",
    ]),
    author: z.string(),
    authorInitials: z.string().optional(),
    date: z.coerce.date(),
    readingTime: z.string(), // напр. "12 мин четене"
    featured: z.boolean().default(false),
    tagline: z.string().optional(), // малък етикет върху панела
    panelColor: z.string().default("#221E18"),
    issue: z.number().optional(),
  }),
});

// Многоуровни ръководства "стъпка по стъпка".
const guides = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/guides" }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    meta: z.string(), // напр. "Ръководство · 5 урока · 25 мин"
    description: z.string().optional(),
  }),
});

// Учебни материали / курсове.
const learning = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/learning" }),
  schema: z.object({
    title: z.string(),
    level: z.enum(["За начинаещи", "Средно ниво", "За напреднали"]),
    description: z.string(),
    meta: z.string(), // напр. "8 урока · 2 часа"
    order: z.number().default(0),
  }),
});

// Директория с полезни ИИ инструменти.
const tools = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/tools" }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    category: z.string(), // напр. "Чатботове", "Изображения", "Код"
    url: z.string().url(),
    pricing: z.enum(["Безплатно", "Freemium", "Платено"]),
    inBulgarian: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

export const collections = { articles, guides, learning, tools };
