import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDownloadEmail({
  to,
  name,
  documentTitle,
  downloadUrl,
}: {
  to: string;
  name: string;
  documentTitle: string;
  downloadUrl: string;
}) {
  const { error } = await resend.emails.send({
    from: "BPESA SIH <noreply@bpesa.org.za>",
    to,
    subject: `Your download: ${documentTitle}`,
    html: `
      <div style="font-family: 'Open Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #445665;">
        <div style="background: #1c2143; padding: 32px 40px;">
          <p style="color: white; font-size: 20px; font-weight: 700; margin: 0;">
            BPESA <span style="color: #f0531e;">Skills Intelligence Hub</span>
          </p>
        </div>
        <div style="padding: 40px;">
          <p>Hi ${name},</p>
          <p>Your document is ready to download. Click the button below — this link expires in 24 hours.</p>
          <div style="margin: 32px 0; text-align: center;">
            <a href="${downloadUrl}"
               style="background: #f0531e; color: white; padding: 14px 32px; border-radius: 4px;
                      text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
              Download: ${documentTitle}
            </a>
          </div>
          <p style="font-size: 13px; color: #6b7a8d;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${downloadUrl}" style="color: #1c2143;">${downloadUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e2e6ea; margin: 32px 0;" />
          <p style="font-size: 12px; color: #6b7a8d; margin: 0;">
            BPESA Skills Intelligence Hub &mdash;
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: #6b7a8d;">Visit site</a>
          </p>
        </div>
      </div>
    `,
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
}
