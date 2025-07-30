import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export class EmailService {
  static transporter = null;

  // Initialize email transporter
  static init() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
    return this.transporter;
  }

  // Generate email verification token
  static generateVerificationToken(userId, email) {
    return jwt.sign(
      { userId, email, type: "email_verification" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
  }

  // Send email verification
  static async sendEmailVerification(user, companyName = null) {
    try {
      const transporter = this.init();
      const verificationToken = this.generateVerificationToken(user.id, user.email);
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

      const subject = companyName 
        ? `Welcome to ${companyName} - Verify your BugLine account`
        : "Welcome to BugLine - Verify your email";

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BugLine</h1>
            </div>
            <div class="content">
              <h2>Welcome ${user.full_name || user.email}!</h2>
              ${companyName ? `<p>You've been added to <strong>${companyName}</strong> on BugLine.</p>` : ''}
              <p>Please verify your email address to complete your account setup.</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </p>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #007bff;">${verificationUrl}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
            </div>
            <div class="footer">
              <p>This email was sent by BugLine. If you didn't request this, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
        Welcome ${user.full_name || user.email}!
        
        ${companyName ? `You've been added to ${companyName} on BugLine.` : ''}
        
        Please verify your email address to complete your account setup.
        
        Click this link to verify: ${verificationUrl}
        
        This link will expire in 24 hours.
        
        If you didn't request this, please ignore this email.
      `;

      const mailOptions = {
        from: `"BugLine" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: user.email,
        subject,
        text: textContent,
        html: htmlContent,
      };

      const result = await transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Email sending error:", error);
      throw new Error("Failed to send verification email");
    }
  }

  // Verify email token
  static verifyEmailToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.type !== "email_verification") {
        throw new Error("Invalid token type");
      }
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired verification token");
    }
  }

  // Send password reset email
  static async sendPasswordResetEmail(user) {
    try {
      const transporter = this.init();
      const resetToken = jwt.sign(
        { userId: user.id, email: user.email, type: "password_reset" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BugLine</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello ${user.full_name || user.email},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request this password reset, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>This email was sent by BugLine. If you didn't request this, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"BugLine" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: user.email,
        subject: "Password Reset - BugLine",
        html: htmlContent,
      };

      const result = await transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Password reset email error:", error);
      throw new Error("Failed to send password reset email");
    }
  }

  // Send invitation email
  static async sendInvitationEmail(user, company, invitedBy, role) {
    try {
      const transporter = this.init();
      const verificationToken = this.generateVerificationToken(user.id, user.email);
      const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}&invite=true`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>You're invited to join ${company.name}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 4px; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
            .role-badge { display: inline-block; padding: 4px 8px; background: #007bff; color: white; border-radius: 12px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BugLine</h1>
            </div>
            <div class="content">
              <h2>You're invited to join ${company.name}!</h2>
              <p>Hello ${user.full_name || user.email},</p>
              <p>${invitedBy.full_name || invitedBy.email} has invited you to join <strong>${company.name}</strong> on BugLine.</p>
              <p>Your role: <span class="role-badge">${role.charAt(0).toUpperCase() + role.slice(1)}</span></p>
              <p>Click the button below to verify your email and accept the invitation:</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}" class="button">Accept Invitation</a>
              </p>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #007bff;">${inviteUrl}</p>
              <p><strong>This invitation will expire in 24 hours.</strong></p>
            </div>
            <div class="footer">
              <p>This email was sent by BugLine. If you didn't expect this invitation, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"BugLine" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: user.email,
        subject: `You're invited to join ${company.name} on BugLine`,
        html: htmlContent,
      };

      const result = await transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Invitation email error:", error);
      throw new Error("Failed to send invitation email");
    }
  }
}