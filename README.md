# AI Академия

Седмичен бюлетин за изкуствения интелект — **на български**. Новини, анализи,
ръководства, учебни материали и директория с полезни инструменти.

Изграден с **[Astro](https://astro.build)** и разгърнат като **Cloudflare
Worker** (Pages и Workers вече са обединени). Абонаментът за бюлетина използва
**Cloudflare D1** за съхранение и **Cloudflare Email Sending** за имейлите.

---

## Технологии

| Слой | Технология |
| --- | --- |
| Framework | Astro 5 (статични страници + on-demand API) |
| Хостинг | Cloudflare Workers (`@astrojs/cloudflare`) |
| Съдържание | Astro Content Collections (Markdown) |
| База данни | Cloudflare D1 (абонати) |
| Имейли | Cloudflare Email Sending (`send_email` binding) |

## Структура

```
src/
  components/      # Header, Footer, ArticleCard, NodeGraphic, SubscribeForm
  content/         # Markdown съдържание
    articles/      # статии и броеве (новини, анализи…)
    guides/        # ръководства стъпка по стъпка
    learning/      # учебни материали / курсове
    tools/         # директория с инструменти
  layouts/         # Layout.astro (общ изглед, шрифтове, SEO)
  lib/             # site.ts (токени), db.ts, email.ts, result-page.ts
  pages/
    index.astro    # начало
    archive.astro  # архив с филтри
    guides.astro   # ръководства + учебни материали
    tools.astro    # директория с инструменти
    about.astro    # за нас
    articles/[slug].astro
    guides/[slug].astro
    api/
      subscribe.ts    # POST — абониране (double opt-in)
      confirm.ts      # GET  — потвърждение
      unsubscribe.ts  # GET  — отписване
      send.ts         # POST — изпращане на брой (админ)
schema.sql         # схема на D1 базата
wrangler.jsonc     # конфигурация на Worker-а
```

## Разработка

```bash
npm install
npm run dev          # http://localhost:4321
```

> Бележка: API endpoint-ите ползват D1 и Email binding-и, които работят само в
> Cloudflare средата. За локален тест с binding-и виж „Локален преглед" по-долу.

## Цялостен дизайн

Палитра и шрифтове (от макета на Claude Design):

- Акцент: `#BB4A2C` (теракота) · Фон: `#F4EEE2` (крем) · Текст: `#221E18`
- Шрифтове: **Lora** (serif), **IBM Plex Sans**, **IBM Plex Mono**

Дизайн токените са централизирани в `src/styles/global.css` и `src/lib/site.ts`.

## Добавяне на съдържание

Създай нов `.md` файл в съответната папка на `src/content/`. Полетата (frontmatter)
са дефинирани и валидирани в `src/content.config.ts`. Пример за статия:

```md
---
title: "Заглавие на статията"
standfirst: "Кратко въведение."
kicker: "Новини"
category: "Новини"        # Новини | Анализи | Ръководства | Обучение | Инструменти
author: "Име Фамилия"
authorInitials: "ИФ"
date: 2025-06-20
readingTime: "6 мин четене"
panelColor: "#221E18"
---

Текст на статията в Markdown…
```

---

## Разгръщане в Cloudflare

### 1. Създай D1 базата

```bash
npx wrangler d1 create ai_akademia_db
```

Копирай върнатото `database_id` в `wrangler.jsonc` (полето `database_id`).
След това приложи схемата:

```bash
npm run db:init:remote     # създава таблиците в продукционната база
# (за локален тест: npm run db:init)
```

### 2. Настрой изпращането на имейли (Cloudflare Email Sending)

`send_email` binding-ът (`NEWSLETTER_EMAIL`) е вече в `wrangler.jsonc`.

1. Във **Cloudflare Dashboard → Email → Email Routing** добави и верифицирай
   домейна си (`ai-akademia.bg`).
2. Увери се, че `FROM_EMAIL` в `wrangler.jsonc` е адрес на верифицирания домейн.
3. **Важно ограничение:** `send_email` може да изпраща до адреси, които са
   верифицирани дестинации в Email Routing. За масово изпращане до произволни
   абонати ще трябва верифициран домейн с подходяща конфигурация (SPF/DKIM/DMARC)
   или външен доставчик (напр. Resend, Mailchannels). Кодът за изпращане е
   капсулиран в `src/lib/email.ts`, така че смяната на доставчик е лесна.

### 3. Задай тайните

```bash
npx wrangler secret put ADMIN_TOKEN     # защитава /api/send
```

### 4. Разгърни

```bash
npm run deploy        # astro build && wrangler deploy
```

### Локален преглед (с binding-и)

```bash
npm run build
npm run preview       # wrangler dev върху изградения Worker
```

---

## Изпращане на брой от бюлетина

Endpoint-ът `/api/send` изпраща HTML до всички **активни** абонати. Защитен е с
`ADMIN_TOKEN`:

```bash
curl -X POST https://<your-worker>.workers.dev/api/send \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "AI Академия · Брой №48",
    "issueSlug": "broy-48",
    "html": "<h1 style=\"font-family:Georgia,serif\">Здравей!</h1><p>Съдържание на броя…</p>"
  }'
```

Всеки имейл автоматично получава линк за отписване с уникален токен.

## Поток на абонамента (double opt-in)

1. Посетителят въвежда имейл → `POST /api/subscribe` → запис със статус `pending`
   и изпратен имейл за потвърждение.
2. Кликва линка → `GET /api/confirm?token=…` → статус `active` + приветствен имейл.
3. По всяко време → `GET /api/unsubscribe?token=…` → статус `unsubscribed`.
