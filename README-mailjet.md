Mailjet backend for resume requests

Overview
- This repository contains a minimal Express server (`server.js`) that accepts POST requests at `/api/send-resume` and uses Mailjet to forward resume requests to `sanjana2003g@gmail.com`.

Setup
1. Install dependencies (from project root):

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in Mailjet credentials and sender email:

```bash
cp .env.example .env
# edit .env and set MAILJET_API_KEY and MAILJET_API_SECRET and MAILJET_SENDER_EMAIL
```

3. Start the backend server:

```bash
npm run start-backend
```

Behavior
- The server listens on `PORT` (default 5173).
- POST `/api/send-resume` expects JSON: { name, email, company, message }.
- The server sends an email to `sanjana2003g@gmail.com` with the request details. If a resume PDF is present at `RESUME_PATH`, it will be attached.

Client integration
- `src/index.html` has been updated to POST the resume modal form to `/api/send-resume` and show status messages.

Security
- Keep `MAILJET_API_KEY` and `MAILJET_API_SECRET` secret. Do not commit `.env` to source control.

Notes
- Mailjet requires the sender email to be a verified sender in your Mailjet account.
- If Mailjet credentials are not set, the server returns a simulated success response to allow local testing.
