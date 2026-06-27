// Изпращане на имейли чрез Cloudflare Email Sending (send_email binding).
//
// Важно: адресът-подател (FROM_EMAIL) трябва да е на верифициран домейн
// в Cloudflare Email, а получателите за `send_email` трябва да са
// верифицирани дестинации в Email Routing. За масово изпращане към
// произволни абонати използвай верифициран домейн или външен доставчик.
import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(
  env: Env,
  { to, subject, html, text }: SendArgs,
): Promise<void> {
  const msg = createMimeMessage();
  msg.setSender({ name: env.FROM_NAME, addr: env.FROM_EMAIL });
  msg.setRecipient(to);
  msg.setSubject(subject);
  msg.addMessage({ contentType: "text/plain", data: text ?? stripHtml(html) });
  msg.addMessage({ contentType: "text/html", data: html });

  const message = new EmailMessage(env.FROM_EMAIL, to, msg.asRaw());
  await env.NEWSLETTER_EMAIL.send(message);
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// --- Шаблони на имейли (в стила на сайта) ---

const ACCENT = "#BB4A2C";
const INK = "#221E18";
const CREAM = "#F4EEE2";

function shell(inner: string): string {
  return `<!doctype html><html lang="bg"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:${CREAM};font-family:Arial,Helvetica,sans-serif;color:${INK};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #DDD4C2;">
<tr><td style="padding:28px 32px;border-bottom:1px solid ${INK};">
  <div style="font-family:Georgia,serif;font-weight:700;font-size:22px;letter-spacing:-0.5px;">AI&nbsp;Академия</div>
  <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A7264;margin-top:4px;">Изкуствен интелект · на български</div>
</td></tr>
<tr><td style="padding:32px;">${inner}</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${ACCENT};color:${CREAM};text-decoration:none;font-weight:bold;font-size:15px;padding:14px 26px;">${label}</a>`;
}

export function confirmationEmail(siteUrl: string, token: string) {
  const link = `${siteUrl}/api/confirm?token=${token}`;
  const html = shell(`
    <h1 style="font-family:Georgia,serif;font-size:26px;margin:0 0 14px;">Потвърди абонамента си</h1>
    <p style="font-size:15px;line-height:1.6;color:#4A443A;margin:0 0 24px;">
      Благодарим, че се абонира за AI Академия! Остава една стъпка — потвърди имейла си, за да започнеш да получаваш бюлетина всяка събота.
    </p>
    <p style="margin:0 0 24px;">${button(link, "Потвърди абонамента →")}</p>
    <p style="font-size:13px;line-height:1.6;color:#8A8170;margin:0;">
      Ако бутонът не работи, отвори този адрес:<br>
      <a href="${link}" style="color:${ACCENT};word-break:break-all;">${link}</a>
    </p>
    <p style="font-size:12px;color:#8A8170;margin:24px 0 0;">Ако не си се абонирал ти, просто игнорирай този имейл.</p>
  `);
  return { subject: "Потвърди абонамента си за AI Академия", html };
}

export function welcomeEmail(siteUrl: string, token: string) {
  const unsub = `${siteUrl}/api/unsubscribe?token=${token}`;
  const html = shell(`
    <h1 style="font-family:Georgia,serif;font-size:26px;margin:0 0 14px;">Добре дошъл! 🎉</h1>
    <p style="font-size:15px;line-height:1.6;color:#4A443A;margin:0 0 20px;">
      Абонаментът ти е активен. Очаквай първия си брой следващата събота сутрин — подбрани новини, ясни обяснения и практични ръководства за изкуствения интелект, на разбираем български.
    </p>
    <p style="margin:0 0 24px;">${button(siteUrl, "Разгледай сайта →")}</p>
    <p style="font-size:12px;color:#8A8170;margin:24px 0 0;border-top:1px solid #DDD4C2;padding-top:16px;">
      Можеш да се <a href="${unsub}" style="color:#8A8170;">отпишеш</a> по всяко време.
    </p>
  `);
  return { subject: "Добре дошъл в AI Академия", html };
}

export function newsletterEmail(
  siteUrl: string,
  token: string,
  subject: string,
  bodyHtml: string,
) {
  const unsub = `${siteUrl}/api/unsubscribe?token=${token}`;
  const html = shell(`
    ${bodyHtml}
    <p style="font-size:12px;color:#8A8170;margin:28px 0 0;border-top:1px solid #DDD4C2;padding-top:16px;">
      Получаваш този имейл, защото си абониран за AI Академия.
      <a href="${unsub}" style="color:#8A8170;">Отпиши се</a>.
    </p>
  `);
  return { subject, html };
}
