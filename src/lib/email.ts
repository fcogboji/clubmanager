// HTML escaping utility to prevent XSS in email content
function escapeHtml(text: string): string {
  const htmlEscapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapeMap[char]);
}

// Dynamic import to avoid build-time errors when env var is not set
let resendInstance: unknown = null;

async function getResend() {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    const { Resend } = await import("resend");
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance as { emails: { send: (params: { from: string; to: string[]; subject: string; html: string }) => Promise<{ data: unknown; error: unknown }> } };
}

const FROM_EMAIL = process.env.EMAIL_FROM || "Club Manager <noreply@resend.dev>";
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
const DEV_EMAIL = process.env.ADMIN_EMAILS?.split(",")[0]?.trim();

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    // In development with unverified Resend domain, emails can only be sent to your own email
    // Skip email sending in development and return success with a warning
    if (IS_DEVELOPMENT) {
      const recipients = Array.isArray(to) ? to : [to];
      const isOwnEmail = DEV_EMAIL && recipients.every(email =>
        email.toLowerCase() === DEV_EMAIL.toLowerCase()
      );

      if (!isOwnEmail) {
        console.log(`[DEV MODE] Email skipped - would send to: ${recipients.join(", ")}`);
        console.log(`[DEV MODE] Subject: ${subject}`);
        return {
          success: true,
          data: { id: "dev-skipped" },
          skipped: true,
          message: "Email skipped in development mode (Resend requires verified domain for external emails)"
        };
      }
    }

    const resend = await getResend();
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email send exception:", error);
    return { success: false, error };
  }
}

interface VerificationEmailParams {
  to: string;
  name: string;
  clubName: string;
  verificationUrl: string;
}

export async function sendVerificationEmail({
  to,
  name,
  clubName,
  verificationUrl,
}: VerificationEmailParams) {
  const safeName = escapeHtml(name);
  const safeClubName = escapeHtml(clubName);
  const safeUrl = escapeHtml(verificationUrl);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify Your Email - ${safeClubName}</h2>
      <p>Hi ${safeName},</p>
      <p>Thank you for creating an account with ${safeClubName}. Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${safeUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="color: #666; word-break: break-all;">${safeUrl}</p>
      <p style="color: #888; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours. If you did not create an account, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #888; font-size: 12px;">This email was sent by ${safeClubName}.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Verify your email - ${safeClubName}`,
    html,
  });
}

interface MemberInviteEmailParams {
  to: string;
  name: string;
  clubName: string;
  memberNames: string[];
  registrationUrl: string;
}

export async function sendMemberInviteEmail({
  to,
  name,
  clubName,
  memberNames,
  registrationUrl,
}: MemberInviteEmailParams) {
  // Escape user-provided content to prevent XSS
  const safeName = escapeHtml(name);
  const safeClubName = escapeHtml(clubName);
  const safeMemberNames = memberNames.map(escapeHtml);
  const memberList = safeMemberNames.join(", ");
  const safeUrl = escapeHtml(registrationUrl);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>You're Invited to ${safeClubName} Member Portal</h2>
      <p>Hi ${safeName},</p>
      <p>You've been invited to create an account on the ${safeClubName} member portal to manage membership${memberNames.length > 1 ? "s" : ""}.</p>
      <p><strong>Member${memberNames.length > 1 ? "s" : ""}:</strong> ${memberList}</p>
      <p>Click the button below to create your account and set up your subscription:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${safeUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Create Account & Subscribe
        </a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="color: #666; word-break: break-all;">${safeUrl}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #888; font-size: 12px;">This email was sent by ${safeClubName}. If you did not expect this invitation, please ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `You're invited to ${safeClubName} Member Portal`,
    html,
  });
}

interface BroadcastEmailParams {
  to: string;
  recipientName: string;
  clubName: string;
  subject: string;
  content: string;
}

export async function sendBroadcastEmail({
  to,
  recipientName,
  clubName,
  subject,
  content,
}: BroadcastEmailParams) {
  // Escape user-provided content to prevent XSS
  const safeRecipientName = escapeHtml(recipientName);
  const safeClubName = escapeHtml(clubName);
  // Escape content, then convert newlines to <br /> for line breaks
  const safeContent = escapeHtml(content).replace(/\n/g, "<br />");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p>Hi ${safeRecipientName},</p>
      <div style="margin: 20px 0;">
        ${safeContent}
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #888; font-size: 12px;">This email was sent by ${safeClubName}.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: escapeHtml(subject),
    html,
  });
}

interface PaymentLinkEmailParams {
  to: string;
  contactName: string;
  memberName: string;
  clubName: string;
  planName: string;
  amount: number;
  interval: string;
  paymentUrl: string;
}

export async function sendPaymentLinkEmail({
  to,
  contactName,
  memberName,
  clubName,
  planName,
  amount,
  interval,
  paymentUrl,
}: PaymentLinkEmailParams) {
  // Escape user-provided content to prevent XSS
  const safeContactName = escapeHtml(contactName);
  const safeMemberName = escapeHtml(memberName);
  const safeClubName = escapeHtml(clubName);
  const safePlanName = escapeHtml(planName);
  const safeInterval = escapeHtml(interval);
  const safeUrl = escapeHtml(paymentUrl);

  const formattedAmount = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount / 100);

  const intervalText = interval === "month" ? "monthly" : interval === "year" ? "annual" : "weekly";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Payment Required - ${safeClubName}</h2>
      <p>Hi ${safeContactName},</p>
      <p>Please complete the payment for <strong>${safeMemberName}</strong>'s membership subscription.</p>

      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Plan:</strong> ${safePlanName}</p>
        <p style="margin: 0 0 10px 0;"><strong>Amount:</strong> ${formattedAmount}/${safeInterval}</p>
        <p style="margin: 0;"><strong>Payment Type:</strong> ${intervalText.charAt(0).toUpperCase() + intervalText.slice(1)} subscription</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${safeUrl}" style="background-color: #4F46E5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Complete Payment
        </a>
      </div>

      <p>Or copy and paste this link into your browser:</p>
      <p style="color: #666; word-break: break-all; font-size: 14px;">${safeUrl}</p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #888; font-size: 12px;">This payment link was sent by ${safeClubName}. If you have any questions, please contact the club directly.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Payment Required: ${safeMemberName}'s ${safePlanName} Subscription - ${safeClubName}`,
    html,
  });
}
