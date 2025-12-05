/* Vercel Serverless Function to send resume requests via Mailjet
 * 
 * Environment variables required (set in Vercel dashboard):
 * - MAILJET_API_KEY
 * - MAILJET_API_SECRET
 * - MAILJET_SENDER_EMAIL
 * - MAILJET_SENDER_NAME (optional)
 * - MAILJET_RECIPIENT (optional, defaults to sanjana2003g@gmail.com)
 */

const mailjet = require('node-mailjet');
const path = require('path');
const fs = require('fs');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    const { name = '', email = '', company = '', message = '' } = req.body || {};

    if (!name || !email) {
      return res.status(400).json({ ok: false, message: 'Name and email are required.' });
    }

    const MJ_API_KEY = process.env.MAILJET_API_KEY;
    const MJ_API_SECRET = process.env.MAILJET_API_SECRET;
    const SENDER_EMAIL = process.env.MAILJET_SENDER_EMAIL || 'no-reply@example.com';
    const SENDER_NAME = process.env.MAILJET_SENDER_NAME || 'Portfolio';
    const RECIPIENT = process.env.MAILJET_RECIPIENT || 'sanjana2003g@gmail.com';

    // Build email body
    const textBody = `Resume request\n\nName: ${name}\nEmail: ${email}\nCompany: ${company}\n\nMessage:\n${message}`;
    const htmlBody = `<p>Resume request</p><ul><li><strong>Name:</strong> ${name}</li><li><strong>Email:</strong> ${email}</li><li><strong>Company:</strong> ${company}</li></ul><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br/>')}</p>`;

    // Prepare attachments array if resume file exists
    let attachments = [];
    try {
      // In Vercel, the resume should be in the public/assets/resume folder
      const resumePath = path.join(process.cwd(), 'assets', 'resume', 'Sanjana_Gangishetty_Resume.pdf');
      
      if (fs.existsSync(resumePath)) {
        const fileBuffer = fs.readFileSync(resumePath);
        attachments.push({
          ContentType: 'application/pdf',
          Filename: 'Sanjana_Gangishetty_Resume.pdf',
          Base64Content: fileBuffer.toString('base64')
        });
      }
    } catch (err) {
      console.warn('Could not read resume file:', err.message);
    }

    const mailMessage = {
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

    // Include requester as CC so they receive a copy
    if (email && email.includes('@')) {
      mailMessage.Cc = [{ Email: email, Name: name }];
    }

    const requestPayload = { Messages: [mailMessage] };

    // Attach resume if present
    if (attachments.length) {
      requestPayload.Messages[0].Attachments = attachments;
    }

    // Send via Mailjet
    if (!MJ_API_KEY || !MJ_API_SECRET) {
      console.warn('Mailjet credentials not set');
      return res.status(500).json({ 
        ok: false, 
        message: 'Email service not configured. Please contact the administrator.' 
      });
    }

    const mjClient = mailjet.connect(MJ_API_KEY, MJ_API_SECRET);
    const result = await mjClient.post('send', { version: 'v3.1' }).request(requestPayload);

    if (result && result.body && result.body.Messages) {
      return res.status(200).json({ ok: true, message: 'Email sent successfully.' });
    }

    return res.status(500).json({ ok: false, message: 'Unexpected email service response' });
  } catch (err) {
    console.error('Error in /api/send-resume:', err);
    return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
  }
};
