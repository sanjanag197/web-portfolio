/* Minimal Express server to accept resume requests and forward them to Mailjet.

Environment variables required (create a .env file or export env vars):
- MAILJET_API_KEY
- MAILJET_API_SECRET
- MAILJET_SENDER_EMAIL  (e.g., no-reply@example.com) -- must be a verified sender in Mailjet
- MAILJET_SENDER_NAME   (optional display name, e.g., "Sanjana Website")
- RESUME_PATH (optional): path to the resume PDF to attach, default: ./src/assets/resume/Sanjana_Gangishetty_Resume.pdf
- PORT (optional): port to run the server, default: 5173

Usage:
  npm install
  node server.js

This server exposes POST /api/send-resume that accepts JSON { name, email, company, message }
and sends an email to sanjana2003g@gmail.com with the request details and an attachment when available.
*/

const express = require('express');
const path = require('path');
const fs = require('fs');
const mailjet = require('node-mailjet');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '1mb' }));

const MJ_API_KEY = process.env.MAILJET_API_KEY;
const MJ_API_SECRET = process.env.MAILJET_API_SECRET;
const SENDER_EMAIL = process.env.MAILJET_SENDER_EMAIL || 'no-reply@example.com';
const SENDER_NAME = process.env.MAILJET_SENDER_NAME || 'Portfolio';
const RESUME_PATH = process.env.RESUME_PATH || path.join(__dirname, 'src', 'assets', 'resume', 'Sanjana_Gangishetty_Resume.pdf');
const RECIPIENT = process.env.MAILJET_RECIPIENT || 'sanjana2003g@gmail.com';

if (!MJ_API_KEY || !MJ_API_SECRET) {
  console.warn('WARNING: MAILJET_API_KEY or MAILJET_API_SECRET not set. Email sending will fail until they are provided.');
}

const mjClient = mailjet.connect(MJ_API_KEY || '', MJ_API_SECRET || '');

app.post('/api/send-resume', async (req, res) => {
  try {
    const { name = '', email = '', company = '', message = '' } = req.body || {};

    if (!name || !email) {
      return res.status(400).json({ ok: false, message: 'Name and email are required.' });
    }

    // Build email body
    const textBody = `Resume request\n\nName: ${name}\nEmail: ${email}\nCompany: ${company}\n\nMessage:\n${message}`;
    const htmlBody = `<p>Resume request</p><ul><li><strong>Name:</strong> ${name}</li><li><strong>Email:</strong> ${email}</li><li><strong>Company:</strong> ${company}</li></ul><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br/>')}</p>`;

    // Prepare attachments array if resume file exists
    let attachments = [];
    try {
      if (fs.existsSync(RESUME_PATH)) {
        const fileBuffer = fs.readFileSync(RESUME_PATH);
        attachments.push({
          ContentType: 'application/pdf',
          Filename: path.basename(RESUME_PATH),
          Base64Content: fileBuffer.toString('base64')
        });
      }
    } catch (err) {
      console.warn('Could not read resume file at', RESUME_PATH, err.message);
    }

    // Email to you (Sanjana) with request details
    const mailToYou = {
      From: {
        Email: SENDER_EMAIL,
        Name: SENDER_NAME
      },
      To: [
        {
          Email: RECIPIENT,
          Name: 'Sanjana'
        }
      ],
      Subject: `Resume request from ${name}${company ? ' at ' + company : ''}`,
      TextPart: textBody,
      HTMLPart: htmlBody,
      ReplyTo: {
        Email: email,
        Name: name
      }
    };

    // Email to the requester with thank you message
    const requesterTextBody = `Hi ${name},\n\nThank you for your interest in my resume!\n\nPlease find my resume attached to this email.\n\nBest regards,\nSanjana Gangishetty\nsanjana2003g@gmail.com`;
    const requesterHtmlBody = `<p>Hi ${name},</p><p>Thank you for your interest in my resume!</p><p>Please find my resume attached to this email.</p><p>Best regards,<br/>Sanjana Gangishetty<br/>sanjana2003g@gmail.com</p>`;
    
    const mailToRequester = {
      From: {
        Email: SENDER_EMAIL,
        Name: SENDER_NAME
      },
      To: [
        {
          Email: email,
          Name: name
        }
      ],
      Subject: 'Your Resume Request - Sanjana Gangishetty',
      TextPart: requesterTextBody,
      HTMLPart: requesterHtmlBody
    };

    // Attach resume only to the requester's email
    if (attachments.length) {
      mailToRequester.Attachments = attachments;
    }

    const requestPayload = { Messages: [mailToYou, mailToRequester] };

    // Send via Mailjet
    if (!MJ_API_KEY || !MJ_API_SECRET) {
      // If credentials absent, simulate success for dev to allow local testing
      return res.json({ ok: true, simulated: true, message: 'Mailjet credentials not set; simulated send.' });
    }

    const result = await mjClient.post('send', { version: 'v3.1' }).request(requestPayload);

    if (result && result.body && result.body.Messages) {
      return res.json({ ok: true, message: 'Email sent via Mailjet.' });
    }

    return res.status(500).json({ ok: false, message: 'Unexpected Mailjet response', detail: result });
  } catch (err) {
    console.error('Error in /api/send-resume', err);
    return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
  }
});

// Serve static files (optional) - serve the portfolio site when running server from repo root
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 5173;
app.listen(PORT, () => {
  console.log(`Mailjet resume server running on port ${PORT}`);
});
