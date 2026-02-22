import { Resend } from "resend";
import { env } from "../env";

const RESEND_API_KEY = env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = env.RESEND_FROM_EMAIL;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

type SendResetPasswordArgs = {
  user: {
    email: string;
  };
  url: string;
};

export function sendResetPassword({
  user,
  url,
}: SendResetPasswordArgs): Promise<void> {
  if (!(resend && RESEND_FROM_EMAIL)) {
    console.error(
      "[auth] Password reset email delivery is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL."
    );
    return Promise.resolve();
  }

  resend.emails
    .send({
      from: RESEND_FROM_EMAIL,
      to: [user.email],
      subject: "Reset your SuperImpress password",
      html: `<p>You requested a password reset for your SuperImpress account.</p>
<p><a href="${url}">Click here to reset your password</a></p>
<p>If you did not request this, you can ignore this email.</p>`,
    })
    .then(({ error }) => {
      if (error) {
        console.error(
          "[auth] Failed to send password reset email via Resend",
          error
        );
      }
    })
    .catch((error: unknown) => {
      console.error(
        "[auth] Failed to send password reset email via Resend",
        error
      );
    });

  return Promise.resolve();
}
