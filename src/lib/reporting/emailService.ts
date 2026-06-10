import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export const sendEmailWithZip = async (emailAddress: string, zipPath: string, projectName: string): Promise<string> => {
  let transporter;

  // Use environment variables if provided
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
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
    from: '"ResoLogix System" <noreply@resologix.com>',
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
