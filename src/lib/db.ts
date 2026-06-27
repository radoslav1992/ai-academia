// Помощни функции за работа с D1 базата (абонати на бюлетина).

export interface Subscriber {
  id: number;
  email: string;
  status: "pending" | "active" | "unsubscribed";
  token: string;
  created_at: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  source: string | null;
}

export function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export function isValidEmail(email: string): boolean {
  // Прагматична проверка — пълната валидация е при потвърждението по имейл.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Добавя или подновява абонат. Връща токена за потвърждение и дали
 * абонатът вече е бил активен (за да не пращаме излишен имейл).
 */
export async function upsertSubscriber(
  db: D1Database,
  email: string,
  source = "website",
): Promise<{ token: string; alreadyActive: boolean }> {
  const normalized = email.trim().toLowerCase();
  const existing = await db
    .prepare("SELECT * FROM subscribers WHERE email = ?")
    .bind(normalized)
    .first<Subscriber>();

  if (existing && existing.status === "active") {
    return { token: existing.token, alreadyActive: true };
  }

  const token = generateToken();

  if (existing) {
    // Подновяваме изтекъл/отписан/чакащ запис с нов токен и статус pending.
    await db
      .prepare(
        "UPDATE subscribers SET token = ?, status = 'pending', unsubscribed_at = NULL WHERE email = ?",
      )
      .bind(token, normalized)
      .run();
  } else {
    await db
      .prepare(
        "INSERT INTO subscribers (email, status, token, source) VALUES (?, 'pending', ?, ?)",
      )
      .bind(normalized, token, source)
      .run();
  }

  return { token, alreadyActive: false };
}

export async function confirmSubscriber(
  db: D1Database,
  token: string,
): Promise<Subscriber | null> {
  const sub = await db
    .prepare("SELECT * FROM subscribers WHERE token = ?")
    .bind(token)
    .first<Subscriber>();
  if (!sub) return null;

  await db
    .prepare(
      "UPDATE subscribers SET status = 'active', confirmed_at = datetime('now') WHERE id = ?",
    )
    .bind(sub.id)
    .run();
  return sub;
}

export async function unsubscribe(
  db: D1Database,
  token: string,
): Promise<Subscriber | null> {
  const sub = await db
    .prepare("SELECT * FROM subscribers WHERE token = ?")
    .bind(token)
    .first<Subscriber>();
  if (!sub) return null;

  await db
    .prepare(
      "UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = datetime('now') WHERE id = ?",
    )
    .bind(sub.id)
    .run();
  return sub;
}

export async function getActiveSubscribers(
  db: D1Database,
): Promise<Subscriber[]> {
  const res = await db
    .prepare("SELECT * FROM subscribers WHERE status = 'active'")
    .all<Subscriber>();
  return res.results ?? [];
}
