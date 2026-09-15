const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? "MIPAN SARL <contact@mipansarl.com>";
const LOGO_URL = "https://mipansarl.com/icon.png";
const SITE_URL = "https://mipansarl.com";

function renderHtml({ subject, message }: { subject: string; message: string }) {
  const safeMessage = message
    .split("\n")
    .map((line) => line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"))
    .join("<br />");

  return `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background-color:#0a0a0a;padding:24px 32px;text-align:center;">
              <img src="${LOGO_URL}" alt="MIPAN SARL" width="56" height="56" style="border-radius:8px;display:inline-block;" />
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 16px;font-size:18px;color:#111111;">${subject}</h1>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#333333;">${safeMessage}</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#fafafa;padding:20px 32px;border-top:1px solid #eeeeee;">
              <p style="margin:0 0 4px;font-size:13px;color:#666666;font-weight:bold;">MIPAN SARL</p>
              <p style="margin:0 0 4px;font-size:12px;color:#999999;">Transit de colis et marchandises entre l'Europe et l'Afrique</p>
              <p style="margin:0;font-size:12px;color:#999999;">
                <a href="mailto:contact@mipansarl.com" style="color:#999999;text-decoration:underline;">contact@mipansarl.com</a>
                &nbsp;·&nbsp;
                <a href="${SITE_URL}" style="color:#999999;text-decoration:underline;">${SITE_URL.replace("https://", "")}</a>
              </p>
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
