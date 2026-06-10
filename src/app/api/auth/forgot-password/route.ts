import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

function generateRandomPassword() {
  return crypto.randomBytes(8).toString('hex');
}

async function sendEmail(to: string, subject: string, text: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("SMTP credentials not set. Simulating email send:");
    console.warn(`To: ${to}\nSubject: ${subject}\nBody:\n${text}`);
    return true; 
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'ResoLogix <noreply@resologix.com>',
      to,
      subject,
      text,
    });
    return true;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailLower = email.toLowerCase();
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(emailLower);
    
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return NextResponse.json({ message: "If an account exists, a temporary password has been sent." });
    }

    // Generate random password and hash it
    const rawPassword = generateRandomPassword();
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    // Update user
    db.prepare(`
      UPDATE users SET password_hash = ?, needs_password_change = 1 WHERE email = ?
    `).run(passwordHash, emailLower);

    // Send email
    const emailSent = await sendEmail(
      emailLower,
      "ResoLogix - Password Reset",
      `You requested a password reset.\n\nYour new temporary login password is: ${rawPassword}\n\nPlease log in and change your password immediately to secure your account.`
    );

    if (!emailSent) {
      return NextResponse.json({ message: "If an account exists, a temporary password has been sent. (SMTP not configured, check server logs)" });
    }

    return NextResponse.json({ message: "If an account exists, a temporary password has been sent." });

  } catch (err: any) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
