import type { APIRoute } from "astro";
import { unsubscribe } from "../../lib/db";
import { resultPage } from "../../lib/result-page";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const env = locals.runtime.env;
  const token = url.searchParams.get("token") || "";

  if (!token) {
    return resultPage("Невалиден линк", "Линкът за отписване е непълен.", 400);
  }

  try {
    const sub = await unsubscribe(env.DB, token);
    if (!sub) {
      return resultPage(
        "Линкът е невалиден",
        "Този линк за отписване не е намерен.",
        404,
      );
    }
    return resultPage(
      "Отписа се успешно",
      "Вече няма да получаваш имейли от нас. Винаги си добре дошъл обратно.",
    );
  } catch (err) {
    console.error("Грешка при отписване:", err);
    return resultPage(
      "Възникна грешка",
      "Нещо се обърка. Моля, опитай отново по-късно.",
      500,
    );
  }
};
