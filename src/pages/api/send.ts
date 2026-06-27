import type { APIRoute } from "astro";
import { getActiveSubscribers } from "../../lib/db";
import { sendEmail, newsletterEmail } from "../../lib/email";

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/**
 * Администраторски endpoint за изпращане на брой до всички активни абонати.
 * Защитен с Bearer token (тайна ADMIN_TOKEN).
 *
 * POST /api/send
 * Authorization: Bearer <ADMIN_TOKEN>
 * { "subject": "...", "html": "<p>...</p>", "issueSlug": "broy-48" }
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;

  // Проверка на достъпа.
  const auth = request.headers.get("authorization") || "";
  const provided = auth.replace(/^Bearer\s+/i, "");
  if (!env.ADMIN_TOKEN || provided !== env.ADMIN_TOKEN) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  let payload: { subject?: string; html?: string; issueSlug?: string };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return json({ ok: false, error: "invalid_body" }, 400);
  }

  const subject = (payload.subject || "").trim();
  const bodyHtml = (payload.html || "").trim();
  const issueSlug = (payload.issueSlug || "broy").trim();

  if (!subject || !bodyHtml) {
    return json({ ok: false, error: "missing_subject_or_html" }, 400);
  }

  const subscribers = await getActiveSubscribers(env.DB);
  let sent = 0;
  const failures: string[] = [];

  for (const sub of subscribers) {
    try {
      const mail = newsletterEmail(
        env.PUBLIC_SITE_URL,
        sub.token,
        subject,
        bodyHtml,
      );
      await sendEmail(env, { to: sub.email, subject: mail.subject, html: mail.html });
      sent++;
    } catch (err) {
      console.error(`Неуспешно изпращане до ${sub.email}:`, err);
      failures.push(sub.email);
    }
  }

  // Записваме в лога.
  try {
    await env.DB.prepare(
      "INSERT INTO sent_issues (issue_slug, subject, recipients) VALUES (?, ?, ?)",
    )
      .bind(issueSlug, subject, sent)
      .run();
  } catch (err) {
    console.error("Грешка при запис в sent_issues:", err);
  }

  return json({
    ok: true,
    total: subscribers.length,
    sent,
    failed: failures.length,
  });
};
