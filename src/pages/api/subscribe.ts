import type { APIRoute } from "astro";
import { isValidEmail, upsertSubscriber } from "../../lib/db";
import { sendEmail, confirmationEmail } from "../../lib/email";

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;

  let email = "";
  try {
    const ct = request.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const body = (await request.json()) as { email?: string };
      email = (body.email || "").trim();
    } else {
      const form = await request.formData();
      email = String(form.get("email") || "").trim();
    }
  } catch {
    return json({ ok: false, error: "invalid_body" }, 400);
  }

  if (!isValidEmail(email)) {
    return json({ ok: false, error: "invalid_email" }, 400);
  }

  try {
    const { token, alreadyActive } = await upsertSubscriber(env.DB, email);

    if (alreadyActive) {
      // Вече активен — не пращаме нов имейл, но връщаме успех.
      return json({ ok: true, status: "already_active" });
    }

    // Изпращаме имейл за потвърждение (double opt-in).
    const { subject, html } = confirmationEmail(env.PUBLIC_SITE_URL, token);
    try {
      await sendEmail(env, { to: email, subject, html });
    } catch (err) {
      // Записът е създаден; ако имейлът се провали, логваме, но не блокираме.
      console.error("Грешка при изпращане на имейл за потвърждение:", err);
    }

    return json({ ok: true, status: "pending" });
  } catch (err) {
    console.error("Грешка при абониране:", err);
    return json({ ok: false, error: "server_error" }, 500);
  }
};
