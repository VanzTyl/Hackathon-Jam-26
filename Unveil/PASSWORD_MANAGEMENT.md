# Password Management in Supabase

## How Passwords Work in Supabase

Supabase uses PostgreSQL's built-in authentication system (based on `auth.users` table) to manage user passwords. Here's how it works:

### Password Storage

1. **Automatic Hashing**: When a user registers with a password, Supabase automatically hashes the password using bcrypt. You do NOT need to hash passwords manually - Supabase handles this for you.

2. **Secure Storage**: The hashed password is stored in the `auth.users` table in your Supabase project. This table is managed by Supabase and cannot be directly accessed or modified by your application code.

3. **No Plain Text**: Passwords are NEVER stored in plain text. The original password cannot be retrieved from the database - only the hashed version exists.

### Authentication Flow

#### Registration
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@ciit.edu.ph',
  password: 'userPassword123'  // Supabase automatically hashes this
})
```

1. User submits email and password
2. Supabase validates the email format and password strength
3. Supabase hashes the password using bcrypt
4. User is created in `auth.users` table with the hashed password
5. If email verification is enabled, a verification email is sent

#### Login
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@ciit.edu.ph',
  password: 'userPassword123'
})
```

1. User submits email and password
2. Supabase finds the user by email
3. Supabase compares the submitted password with the stored hash
4. If they match, the user is authenticated and receives a session token

### Password Retrieval

**Important: You CANNOT retrieve a user's password - even the hashed version.**

Supabase intentionally does not expose password hashes to applications for security reasons. This is a security best practice.

If a user forgets their password, they must:
1. Request a password reset
2. Receive an email with a reset link
3. Set a new password

Example:
```typescript
const { data, error } = await supabase.auth.resetPasswordForEmail(
  'user@ciit.edu.ph',
  {
    redirectTo: 'https://yourapp.com/reset-password'
  }
)
```

### Email Verification with Brevo SMTP

Supabase can be configured to use Brevo (formerly SendinBlue) as the SMTP provider for sending verification and password reset emails.

#### Configuration Steps:

1. **Get Brevo SMTP Credentials**:
   - Login to your Brevo account
   - Go to SMTP & API settings
   - Get your SMTP server, port, username, and password

2. **Configure in Supabase Dashboard**:
   - Go to Authentication → Email Templates
   - Configure SMTP settings with your Brevo credentials:
     - SMTP Host: `smtp-relay.brevo.com`
     - SMTP Port: `587` (TLS) or `2525` (non-secure)
     - SMTP User: Your Brevo login email
     - SMTP Password: Your Brevo SMTP key

3. **Customize Email Templates**:
   - Modify the confirmation email template
   - Modify the password reset email template
   - Include your app branding

### Password Security Best Practices

1. **Never store passwords in plain text**: Supabase handles this automatically
2. **Never try to retrieve passwords**: Use password reset flow instead
3. **Require strong passwords**: Consider adding password strength validation in your frontend
4. **Use HTTPS**: Always use HTTPS in production
5. **Enable email verification**: Require users to verify their email before accessing the app
6. **Set session expiration**: Configure appropriate session timeout in Supabase
7. **Implement rate limiting**: Prevent brute force attacks (Supabase handles this)

### Example Password Reset Flow

```typescript
// 1. User requests password reset
await supabase.auth.resetPasswordForEmail('user@ciit.edu.ph', {
  redirectTo: `${window.location.origin}/reset-password`
})

// 2. User clicks link and goes to reset page
// On the reset password page:

const { data, error } = await supabase.auth.updateUser({
  password: 'newStrongPassword123'
})
```

### Summary

- **Passwords are automatically hashed** by Supabase using bcrypt
- **Passwords cannot be retrieved** - use password reset flow
- **Email verification** is handled by Supabase SMTP settings
- **Brevo SMTP** can be configured in Supabase Dashboard
- **Security is built-in** - you don't need to implement password hashing yourself

This architecture ensures that your users' credentials remain secure while providing a smooth authentication experience.
