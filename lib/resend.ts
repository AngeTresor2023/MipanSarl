const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? "MIPAN SARL <contact@mipansarl.com>";

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
