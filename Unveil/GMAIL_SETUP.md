# Gmail SMTP Setup Guide

## Prerequisites
1. A Gmail account to send emails from
2. 2-Factor Authentication (2FA) enabled on the Gmail account

## Step 1: Enable 2-Factor Authentication
1. Go to [Google Account settings](https://myaccount.google.com/security)
2. Click on "2-Step Verification" under "Signing in to Google"
3. Follow the setup process

## Step 2: Create App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" for app and "Other (Custom name)" for device
3. Name it something like "CIIT Portal"
4. Click "Generate"
5. Copy the 16-character password (save it somewhere safe)

## Step 3: Environment Variables
Create a `.env.local` file in your project root:

```env
# Gmail SMTP Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# For development, you can use these settings:
NODE_ENV=development
```

## Step 4: Update Email Service
Replace the email configuration in the API routes.

### Option A: Using Gmail SMTP
```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});
```

### Option B: Using Google Workspace (if you have @ciit.edu.ph domain)
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});
```

## Step 5: Rate Limits and Best Practices
- Gmail has sending limits: ~100 emails/day for regular accounts
- For production, consider using:
  - Google Workspace (higher limits)
  - SendGrid, Mailgun, or AWS SES (recommended for scale)

## Alternative: Use CIIT Email Server
If CIIT has its own email server, ask your IT department for:
- SMTP server address
- Port number
- Authentication credentials

Then configure like:
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.ciit.edu.ph', // Replace with actual CIIT SMTP
  port: 587,
  secure: false,
  auth: {
    user: process.env.CIIT_EMAIL_USER,
    pass: process.env.CIIT_EMAIL_PASSWORD,
  },
});
```

## Testing the Setup
1. Update the email configuration in the API files
2. Restart your development server
3. Try registering a new account
4. Check if emails are sent successfully

## Troubleshooting
- **"Invalid login"**: Double-check app password (not regular password)
- **"Less secure app access"**: Enable 2FA and use app passwords instead
- **Emails not sending**: Check spam folder and SMTP settings