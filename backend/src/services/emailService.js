import nodemailer from 'nodemailer';
import config from '../config/env.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.lastDevMessage = null; // Stores last message in dev mode for testing/local verification
    this.initTransporter();
  }

  initTransporter() {
    if (config.emailUser && config.emailPassword && config.emailHost !== 'localhost') {
      this.transporter = nodemailer.createTransport({
        host: config.emailHost,
        port: config.emailPort,
        secure: config.emailSecure,
        auth: {
          user: config.emailUser,
          pass: config.emailPassword,
        },
      });
    } else {
      // In development when external SMTP is not yet configured, use stream transport or test logger
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  /**
   * Send Email OTP for registration or verification
   * @param {string} toEmail 
   * @param {string} otpCode - 6 digit decimal string
   * @param {string} purpose - 'registration' | 'email_verification' | 'email_change'
   */
  async sendOtpEmail(toEmail, otpCode, purpose = 'registration') {
    const title = purpose === 'registration'
      ? 'Verify Your GreenPulse Mission LiFE Account'
      : purpose === 'email_change'
      ? 'Confirm Your New Email Address'
      : 'Your Mission LiFE Verification Code';

    const html = `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #d1fae5; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #065f46; margin: 0; font-size: 24px;">GreenPulse — Mission LiFE</h2>
          <p style="color: #047857; font-size: 13px; margin: 4px 0 0 0;">Lifestyle for Environment Platform</p>
        </div>
        <div style="background-color: #f0fdf4; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #bbf7d0;">
          <p style="color: #1f2937; font-size: 15px; margin: 0 0 12px 0;">Use the following 6-digit code to complete your verification:</p>
          <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #065f46; background: #ffffff; padding: 14px 20px; border-radius: 8px; display: inline-block; border: 1px solid #86efac;">
            ${otpCode}
          </div>
          <p style="color: #6b7280; font-size: 12px; margin: 12px 0 0 0;">This code will expire in ${config.otpLifetimeMinutes} minutes. Never share this code with anyone.</p>
        </div>
        <div style="margin-top: 24px; text-align: center; color: #9ca3af; font-size: 11px;">
          <p style="margin: 0;">If you did not request this verification, please safely ignore this email.</p>
          <p style="margin: 4px 0 0 0;">&copy; 2026 Mission LiFE Platform • Government of India Initiative</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: config.emailFrom,
      to: toEmail,
      subject: `[Mission LiFE] ${title} — ${otpCode}`,
      html,
      text: `Your Mission LiFE verification code is: ${otpCode}. It expires in ${config.otpLifetimeMinutes} minutes.`,
    };

    return this.deliver(mailOptions, { type: 'otp', code: otpCode, to: toEmail });
  }

  /**
   * Send Password Reset Link / Token Email
   */
  async sendPasswordResetEmail(toEmail, resetToken) {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(toEmail)}`;

    const html = `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #fed7aa; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #9a3412; margin: 0; font-size: 24px;">GreenPulse — Password Reset</h2>
          <p style="color: #c2410c; font-size: 13px; margin: 4px 0 0 0;">Security Notification</p>
        </div>
        <div style="background-color: #fff7ed; border-radius: 12px; padding: 20px; border: 1px solid #ffedd5;">
          <p style="color: #1f2937; font-size: 14px; margin: 0 0 16px 0;">We received a request to reset your GreenPulse account password.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #ea580c; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">
              Reset My Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 12px; margin: 0;">Or copy this secure link: <br/><code style="word-break: break-all; color: #9a3412;">${resetUrl}</code></p>
          <p style="color: #6b7280; font-size: 12px; margin: 12px 0 0 0;">This link is valid for 15 minutes and can only be used once.</p>
        </div>
        <div style="margin-top: 24px; text-align: center; color: #9ca3af; font-size: 11px;">
          <p style="margin: 0;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: config.emailFrom,
      to: toEmail,
      subject: '[Mission LiFE] Reset Your Password',
      html,
      text: `Reset your password by visiting: ${resetUrl}`,
    };

    return this.deliver(mailOptions, { type: 'password_reset', token: resetToken, to: toEmail });
  }

  async deliver(mailOptions, devMeta) {
    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.lastDevMessage = { ...mailOptions, ...devMeta, sentAt: new Date() };

      if (!config.isProduction) {
        console.log(`[EmailService] Dev notification sent to ${mailOptions.to} (${devMeta.type})`);
        if (devMeta.type === 'otp') {
          console.log(`[EmailService:DEV_LOG] Active OTP for ${mailOptions.to}: [ ${devMeta.code} ]`);
        }
      }

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err) {
      console.error('[EmailService Error]: Delivery failure', err.message);
      // In dev mode, still capture lastDevMessage so automated integration tests can pass without live SMTP
      if (!config.isProduction && devMeta) {
        this.lastDevMessage = { ...mailOptions, ...devMeta, sentAt: new Date(), simulated: true };
      }
      return {
        success: false,
        error: err.message,
      };
    }
  }

  getLastDevMessage() {
    return this.lastDevMessage;
  }
}

export const emailService = new EmailService();
export default emailService;
