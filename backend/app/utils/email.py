from flask import current_app
from flask_mail import Message
from app.extensions import mail


def send_password_reset_email(user_email: str, user_name: str, raw_token: str) -> None:
    frontend_url = current_app.config['FRONTEND_URL']
    reset_link   = f"{frontend_url}/reset-password?token={raw_token}"
    expires_min  = current_app.config['RESET_TOKEN_EXPIRES']

    html = f"""
<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:12px;overflow:hidden;
                    box-shadow:0 4px 24px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1e3a5f;padding:28px 36px;">
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;
                      letter-spacing:.5px;">HR Management System</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px;">
            <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;">
              Reset your password
            </h2>
            <p style="color:#475569;line-height:1.6;margin:0 0 12px;">
              Hello <strong>{user_name}</strong>,
            </p>
            <p style="color:#475569;line-height:1.6;margin:0 0 28px;">
              We received a request to reset your password. Click the button
              below — this link expires in <strong>{expires_min} minutes</strong>.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-radius:8px;background:#1e3a5f;">
                  <a href="{reset_link}"
                     style="display:inline-block;padding:14px 32px;color:#ffffff;
                            font-size:15px;font-weight:600;text-decoration:none;
                            border-radius:8px;">
                    Reset Password
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:28px 0 0;color:#94a3b8;font-size:13px;line-height:1.5;">
              If you didn't request this, you can safely ignore this email.<br>
              Or copy this URL: <a href="{reset_link}" style="color:#3b82f6;">{reset_link}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 36px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">
              &copy; 2025 HR Management System. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
"""

    msg = Message(
        subject    = 'Reset your HRMS password',
        recipients = [user_email],
        html       = html,
    )
    mail.send(msg)
