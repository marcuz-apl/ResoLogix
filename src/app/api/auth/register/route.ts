import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

function generateRandomPassword() {
  return crypto.randomBytes(8).toString('hex'); // 16 character random password
}

async function sendEmail(to: string, subject: string, text: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("SMTP credentials not set. Simulating email send:");
    console.warn(`To: ${to}\nSubject: ${subject}\nBody:\n${text}`);
    return true; // Simulate success
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

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(emailLower);
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Generate random password and hash it
    const rawPassword = generateRandomPassword();
    const passwordHash = await bcrypt.hash(rawPassword, 10);
    const id = crypto.randomUUID();

    // Check if it's the first user
    const { count } = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    const isAdmin = count === 0 ? 1 : 0;

    // Insert user
    db.prepare(`
      INSERT INTO users (id, email, password_hash, needs_password_change, is_admin)
      VALUES (?, ?, ?, 1, ?)
    `).run(id, emailLower, passwordHash, isAdmin);

    // Send email
    const emailSent = await sendEmail(
      emailLower,
      "Welcome to ResoLogix - Your Temporary Password",
      `Welcome to ResoLogix!\n\nYour temporary login password is: ${rawPassword}\n\nPlease log in and change your password immediately to secure your account.`
    );

    if (!emailSent) {
      // We could rollback, but for now we'll just inform the user there was an email error.
      // In local dev, it logs to console so we can use it.
      return NextResponse.json({ message: "User registered. (SMTP not configured, check server logs for password)" });
    }

    return NextResponse.json({ message: "User registered. Please check your email for the temporary password." });

  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
  }
}
