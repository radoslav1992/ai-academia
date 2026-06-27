import type { APIRoute } from "astro";
import { confirmSubscriber } from "../../lib/db";
import { sendEmail, welcomeEmail } from "../../lib/email";
import { resultPage } from "../../lib/result-page";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const env = locals.runtime.env;
  const token = url.searchParams.get("token") || "";

  if (!token) {
    return resultPage(
      "Невалиден линк",
      "Линкът за потвърждение е непълен. Опитай отново да се абонираш.",
      400,
    );
  }

  try {
    const sub = await confirmSubscriber(env.DB, token);
    if (!sub) {
      return resultPage(
        "Линкът е невалиден",
        "Този линк за потвърждение не е намерен или вече е използван.",
        404,
      );
    }

    // Изпращаме приветствен имейл (best-effort).
    try {
      const { subject, html } = welcomeEmail(env.PUBLIC_SITE_URL, sub.token);
      await sendEmail(env, { to: sub.email, subject, html });
    } catch (err) {
      console.error("Грешка при изпращане на приветствен имейл:", err);
    }

    return resultPage(
      "Абонаментът е потвърден! 🎉",
      "Готово! От следващата събота ще получаваш AI Академия в пощата си.",
    );
  } catch (err) {
    console.error("Грешка при потвърждение:", err);
    return resultPage(
      "Възникна грешка",
      "Нещо се обърка. Моля, опитай отново по-късно.",
      500,
    );
  }
};
