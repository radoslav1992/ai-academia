// Връща семпла HTML страница с резултат (потвърждение/отписване/грешка),
// в стила на сайта.
export function resultPage(
  title: string,
  message: string,
  status = 200,
): Response {
  const html = `<!doctype html><html lang="bg"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · AI Академия</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@600&family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Mono&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:#F4EEE2;color:#221E18;font-family:'IBM Plex Sans',sans-serif;padding:24px}
  .card{max-width:520px;width:100%;background:#fff;border:1px solid #221E18;padding:48px 40px;text-align:center}
  .brand{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A7264;margin-bottom:24px}
  h1{font-family:'Lora',serif;font-weight:600;font-size:32px;line-height:1.15;margin:0 0 14px}
  p{font-size:16px;line-height:1.6;color:#4A443A;margin:0 0 28px}
  a.btn{display:inline-block;background:#BB4A2C;color:#F4EEE2;text-decoration:none;font-weight:600;font-size:14px;padding:13px 24px}
</style></head>
<body><div class="card">
  <div class="brand">AI Академия · Изкуствен интелект на български</div>
  <h1>${title}</h1>
  <p>${message}</p>
  <a class="btn" href="/">Към началото →</a>
</div></body></html>`;

  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
