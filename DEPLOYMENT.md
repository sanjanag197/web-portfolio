# Deploying the Resume Email Feature to Vercel

## What Changed

Your website is now configured to work with Vercel's serverless functions. The email sending functionality has been converted from an Express server to a Vercel serverless function.

## Files Created/Modified

1. **`api/send-resume.js`** - Vercel serverless function that handles resume requests
2. **`vercel.json`** - Vercel configuration for build and routing
3. **`src/index.html`** - Fixed focus management in modal to prevent aria-hidden warning

## Setup Steps

### 1. Install Dependencies (if not already done)

Make sure these packages are in your `package.json` dependencies (they should already be there):
- `node-mailjet`
- `dotenv`

### 2. Configure Environment Variables in Vercel

Go to your Vercel project settings and add these environment variables:

- `MAILJET_API_KEY` - Your Mailjet API key
- `MAILJET_API_SECRET` - Your Mailjet API secret
- `MAILJET_SENDER_EMAIL` - The verified sender email (e.g., no-reply@yourdomain.com)
- `MAILJET_SENDER_NAME` - Display name for the sender (e.g., "Portfolio")
- `MAILJET_RECIPIENT` - Email where resume requests will be sent (defaults to sanjana2003g@gmail.com)

**How to add environment variables in Vercel:**
1. Go to your project on [vercel.com](https://vercel.com)
2. Click on **Settings**
3. Click on **Environment Variables**
4. Add each variable with its value
5. Make sure to select all environments (Production, Preview, Development)

### 3. Deploy to Vercel

Option A - Via Git (Recommended):
```bash
git add .
git commit -m "Add serverless function for resume requests"
git push
```

Vercel will automatically deploy when you push to your connected repository.

Option B - Via Vercel CLI:
```bash
npm install -g vercel
vercel --prod
```

### 4. Testing

After deployment:
1. Visit your website on Vercel
2. Click the "Resume" button
3. Fill out the form and submit
4. The resume should open in a new tab
5. Check the console - you should no longer see the 405 error
6. Check your email (MAILJET_RECIPIENT) for the resume request notification

## Local Development

To test locally with the serverless function:

```bash
npm install -g vercel
vercel dev
```

This will start a local development server that simulates Vercel's environment, including the serverless functions.

## Troubleshooting

### Still getting 405 error?
- Make sure you've deployed to Vercel after creating the `api/send-resume.js` file
- Check that the environment variables are set in Vercel
- Clear your browser cache

### Emails not sending?
- Verify your Mailjet credentials are correct
- Make sure the sender email is verified in your Mailjet account
- Check Vercel function logs: Project Settings > Functions > View Logs

### Resume not attaching?
- The resume file should be at `assets/resume/Sanjana_Gangishetty_Resume.pdf`
- Make sure this file is committed to your git repository
- The build process should copy it to the output directory

## How It Works

1. User fills out the form and clicks "Send"
2. The resume opens in a new tab immediately
3. A POST request is sent to `/api/send-resume`
4. Vercel routes this to `api/send-resume.js` serverless function
5. The function sends an email via Mailjet with the resume attached
6. The user receives a copy (CC) and you receive the notification

## Old Express Server

The `server.js` file is still in your repository for local development if needed, but it's not used by Vercel. You can keep it for running locally with `npm run start-backend` or remove it if you prefer.
