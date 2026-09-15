const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? "MIPAN SARL <contact@mipansarl.com>";
const SITE_URL = "https://mipansarl.com";

function renderHtml({ subject, message }: { subject: string; message: string }) {
  const safeSubject = subject.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeMessage = message
    .split("\n")
    .map((line) => line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"))
    .join("<br />");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  @media only screen and (max-width: 480px) {
    .wrap { padding: 28px 20px !important; }
    .wordmark { font-size: 18px !important; }
    .subject { font-size: 17px !important; }
    .body-text { font-size: 15px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" class="wrap" style="padding:48px 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span class="wordmark" style="font-family:Georgia,'Times New Roman',serif;font-size:21px;letter-spacing:0.14em;color:#142139;">MIPAN&nbsp;SARL</span>
              <div style="margin:14px auto 0;width:36px;height:2px;background-color:#B8862E;line-height:0;font-size:0;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td>
              <h1 class="subject" style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:19px;color:#142139;">${safeSubject}</h1>
              <p class="body-text" style="margin:0;font-family:-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;color:#33373d;">${safeMessage}</p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:40px;">
              <div style="border-top:1px solid #eceae5;padding-top:20px;font-family:-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;">
                <p style="margin:0 0 4px;font-size:13px;color:#7a7f87;">MIPAN SARL — Transit de colis et marchandises entre l'Europe et l'Afrique</p>
                <p style="margin:0;font-size:13px;color:#7a7f87;">
                  <a href="mailto:contact@mipansarl.com" style="color:#7a7f87;">contact@mipansarl.com</a>
                  &nbsp;·&nbsp;
                  <a href="${SITE_URL}" style="color:#7a7f87;">${SITE_URL.replace("https://", "")}</a>
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendAdminEmail({
  to,
  subject,
  text,
  attachment,
}: {
  to: string;
  subject: string;
  text: string;
  attachment?: { filename: string; contentBase64: string } | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY non configurée" };
  }

  const body: Record<string, unknown> = {
    from: FROM_EMAIL,
    to,
    subject,
    text,
    html: renderHtml({ subject, message: text }),
  };

  if (attachment) {
    body.attachments = [
      { filename: attachment.filename, content: attachment.contentBase64 },
    ];
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Resend API error", errText);
    return { ok: false, error: errText };
  }

  return { ok: true };
}
