import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export const sendEmailWithZip = async (emailAddress: string, zipPath: string, projectName: string): Promise<string> => {
  let transporter;

  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const fromEmail = process.env.EMAIL_FROM || '"ResoLogix System" <noreply@resologix.com>';

  // Use environment variables if provided
  if (smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  } else {
    // Fallback: Create ethereal test account if no SMTP provided
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const info = await transporter.sendMail({
    from: fromEmail,
    to: emailAddress,
    subject: `Evaluation Reports for ${projectName}`,
    text: `Please find the generated ResoLogix evaluation reports for project '${projectName}' attached as a ZIP file.`,
    attachments: [
      {
        filename: path.basename(zipPath),
        path: zipPath
      }
    ]
  });

  const testUrl = nodemailer.getTestMessageUrl(info);
  
  if (testUrl) {
    console.log(`[Email Service] Preview URL: ${testUrl}`);
    return `Email successfully sent! Preview it here: ${testUrl}`;
  }

  return `Email successfully sent to ${emailAddress}!`;
};
