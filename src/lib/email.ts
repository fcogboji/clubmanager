import { Resend } from "resend";

// Lazy initialization to avoid build-time errors when env var is not set
let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
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

    const { data, error } = await getResend().emails.send({
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

interface ParentInviteEmailParams {
  to: string;
  parentName: string;
  clubName: string;
  memberNames: string[];
  registrationUrl: string;
}

export async function sendParentInviteEmail({
  to,
  parentName,
  clubName,
  memberNames,
  registrationUrl,
}: ParentInviteEmailParams) {
  const memberList = memberNames.join(", ");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>You're Invited to ${clubName} Parent Portal</h2>
      <p>Hi ${parentName},</p>
      <p>You've been invited to create an account on the ${clubName} parent portal to manage your child${memberNames.length > 1 ? "ren" : ""}'s membership.</p>
      <p><strong>Member${memberNames.length > 1 ? "s" : ""}:</strong> ${memberList}</p>
      <p>Click the button below to create your account and set up your subscription:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${registrationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Create Account & Subscribe
        </a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="color: #666; word-break: break-all;">${registrationUrl}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #888; font-size: 12px;">This email was sent by ${clubName}. If you did not expect this invitation, please ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `You're invited to ${clubName} Parent Portal`,
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
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p>Hi ${recipientName},</p>
      <div style="margin: 20px 0;">
        ${content.replace(/\n/g, "<br />")}
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #888; font-size: 12px;">This email was sent by ${clubName}.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject,
    html,
  });
}

interface PaymentLinkEmailParams {
  to: string;
  parentName: string;
  memberName: string;
  clubName: string;
  planName: string;
  amount: number;
  interval: string;
  paymentUrl: string;
}

export async function sendPaymentLinkEmail({
  to,
  parentName,
  memberName,
  clubName,
  planName,
  amount,
  interval,
  paymentUrl,
}: PaymentLinkEmailParams) {
  const formattedAmount = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount / 100);

  const intervalText = interval === "month" ? "monthly" : interval === "year" ? "annual" : "weekly";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Payment Required - ${clubName}</h2>
      <p>Hi ${parentName},</p>
      <p>Please complete the payment for <strong>${memberName}</strong>'s membership subscription.</p>

      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Plan:</strong> ${planName}</p>
        <p style="margin: 0 0 10px 0;"><strong>Amount:</strong> ${formattedAmount}/${interval}</p>
        <p style="margin: 0;"><strong>Payment Type:</strong> ${intervalText.charAt(0).toUpperCase() + intervalText.slice(1)} subscription</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${paymentUrl}" style="background-color: #4F46E5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Complete Payment
        </a>
      </div>

      <p>Or copy and paste this link into your browser:</p>
      <p style="color: #666; word-break: break-all; font-size: 14px;">${paymentUrl}</p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #888; font-size: 12px;">This payment link was sent by ${clubName}. If you have any questions, please contact the club directly.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Payment Required: ${memberName}'s ${planName} Subscription - ${clubName}`,
    html,
  });
}
