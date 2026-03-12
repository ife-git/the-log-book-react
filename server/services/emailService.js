// server/services/emailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load env variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

// Clean app password (remove spaces)
const appPassword = process.env.GMAIL_APP_PASSWORD
  ? process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, "")
  : "";

// Create transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4, // force IPv4 instead of IPv6
  auth: {
    user: process.env.GMAIL_USER,
    pass: appPassword,
  },
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email server connection error:", error);
  } else {
    console.log("✅ Email server ready to send messages");
  }
});

export async function sendEmail({ to, subject, html }) {
  // Don't send emails in development unless explicitly wanted
  if (process.env.NODE_ENV === "development" && !process.env.SEND_EMAILS_DEV) {
    console.log(`📧 [DEV MODE] Would send email to: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Preview: ${html.substring(0, 100)}...`);
    return { success: true, devMode: true };
  }

  try {
    const mailOptions = {
      from: `"The Log Book" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email send failed:", error);
    // Don't throw - we don't want email failures to crash the app
    return { success: false, error: error.message };
  }
}
