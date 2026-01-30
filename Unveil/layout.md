# CIIT Login App - Layout & Documentation

## Project Overview
A Next.js authentication system for CIIT students with email verification and password reset functionality.

## Folder Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── forgot-password/
│   │       │   └── route.ts          # POST: Send password reset email
│   │       ├── login/
│   │       │   └── route.ts          # POST: User authentication
│   │       ├── register/
│   │       │   └── route.ts          # POST: User registration with email verification
│   │       ├── reset-password/
│   │       │   └── route.ts          # POST: Reset user password
│   │       └── verify/
│   │           ├── route.ts            # POST: Verify email code
│   │           └── route.ts            # PUT:  Resend verification code
│   ├── forgot-password/
│   │   └── page.tsx                 # Forgot password form
│   ├── login/
│   │   └── page.tsx                 # Login form (Google/GitHub removed)
│   ├── register/
│   │   └── page.tsx                 # Registration form
│   ├── reset-password/
│   │   └── page.tsx                 # Password reset form
│   ├── verify/
│   │   └── page.tsx                 # Email verification form
│   └── dashboard/
│       └── page.tsx                 # Protected dashboard page
├── lib/
│   └── database.ts                  # In-memory database with helper functions
└── .env.local                       # Environment variables (RESEND_API_KEY)
```

---

## Registration Flow

### 1. Registration Page (`/register`)
**File:** `src/app/register/page.tsx`

**Form Fields:**
- `firstName` (string, required)
- `lastName` (string, required)
- `email` (string, must end with @ciit.edu.ph)
- `password` (string, min 8 characters)

**Validation:**
- Email must end with @ciit.edu.ph
- Password must be at least 8 characters
- All fields required

**API Call:** `POST /api/auth/register`
```javascript
{
  firstName: "John",
  lastName: "Doe", 
  email: "john.doe@ciit.edu.ph",
  password: "password123"
}
```

---

### 2. Registration API Endpoint
**File:** `src/app/api/auth/register/route.ts`

**Function Header:** `export async function POST(request: NextRequest)`

**Request Data:**
```typescript
{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
```

**Process:**
1. Validate email format (@ciit.edu.ph)
2. Check if user already exists
3. Validate password length
4. Create user (unverified)
5. Generate 6-digit verification code
6. Send verification email via Resend
7. Return success response

**Response Data:**
```typescript
{
  message: string;
  verificationCode?: string; // Only in development
}
```

**Email Sending:** Uses Resend API
- From: `onboarding@resend.dev`
- To: User's email
- Subject: "Verify your CIIT Account"
- Contains 6-digit verification code

---

### 3. Email Verification Page (`/verify`)
**File:** `src/app/verify/page.tsx`

**Form Fields:**
- `email` (string, required)
- `verificationCode` (string, 6 digits)

**API Calls:**
- `POST /api/auth/verify` - Submit verification code
- `PUT /api/auth/verify` - Resend verification code

---

### 4. Email Verification API
**File:** `src/app/api/auth/verify/route.ts`

**POST Function:** `export async function POST(request: NextRequest)`
```typescript
{
  email: string;
  code: string;
}
```

**PUT Function:** `export async function PUT(request: NextRequest)`
```typescript
{
  email: string;
}
```

**Process:**
1. Validate email format
2. Check if verification code exists and hasn't expired
3. Mark user as verified
4. Clean up verification code

---

## Login Flow

### 1. Login Page (`/login`)
**File:** `src/app/login/page.tsx` (Updated: Removed Google/GitHub options)

**Form Fields:**
- `email` (string, required, @ciit.edu.ph)
- `password` (string, required)
- `rememberMe` (boolean, optional)

**Validation:**
- Email must end with @ciit.edu.ph
- All fields required

**API Call:** `POST /api/auth/login`
```javascript
{
  email: "john.doe@ciit.edu.ph",
  password: "password123"
}
```

**Navigation Links:**
- "Register here" → `/register`
- "Forgot your password?" → `/forgot-password`

---

### 2. Login API Endpoint
**File:** `src/app/api/auth/login/route.ts`

**Function Header:** `export async function POST(request: NextRequest)`

**Request Data:**
```typescript
{
  email: string;
  password: string;
}
```

**Process:**
1. Validate email format
2. Check if user exists
3. Verify user is verified
4. Check password match
5. Return success response

**Response Data:**
```typescript
{
  message: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    isVerified: boolean;
  };
}
```

---

## Forgot Password Flow

### 1. Forgot Password Page (`/forgot-password`)
**File:** `src/app/forgot-password/page.tsx`

**Form Fields:**
- `email` (string, required, @ciit.edu.ph)

**API Call:** `POST /api/auth/forgot-password`
```javascript
{
  email: "john.doe@ciit.edu.ph"
}
```

---

### 2. Forgot Password API Endpoint
**File:** `src/app/api/auth/forgot-password/route.ts`

**Function Header:** `export async function POST(request: NextRequest)`

**Request Data:**
```typescript
{
  email: string;
}
```

**Process:**
1. Validate email format
2. Check if user exists (but don't reveal if not)
3. Generate password reset token (UUID)
4. Send reset email via Resend
5. Return success message

**Email Content:**
- From: `onboarding@resend.dev`
- Subject: "Reset your CIIT Account Password"
- Contains reset link: `/reset-password?token={uuid}&email={email}`

**Security:** Uses generic success message to prevent email enumeration

---

### 3. Reset Password Page (`/reset-password`)
**File:** `src/app/reset-password/page.tsx`

**URL Parameters:**
- `token` (string) - Password reset token
- `email` (string) - User email

**Form Fields:**
- `password` (string, min 8 characters)
- `confirmPassword` (string, must match password)

**API Call:** `POST /api/auth/reset-password`
```javascript
{
  email: "john.doe@ciit.edu.ph",
  token: "uuid-token-here",
  password: "newpassword123"
}
```

---

### 4. Reset Password API Endpoint
**File:** `src/app/api/auth/reset-password/route.ts`

**Function Header:** `export async function POST(request: NextRequest)`

**Request Data:**
```typescript
{
  email: string;
  token: string;
  password: string;
}
```

**Process:**
1. Validate email format
2. Check if reset token exists and hasn't expired
3. Verify token matches
4. Update user password
5. Clean up reset token

---

## Database Schema

### User Table
**Interface:** `User`
```typescript
interface User {
  id?: string;           // UUID, auto-generated
  firstName: string;     // User first name
  lastName: string;      // User last name
  email: string;         // Primary key, @ciit.edu.ph
  password: string;      // Plain text (in production: hash this!)
  isVerified: boolean;   // Email verification status
  createdAt: string;     // ISO timestamp
}
```

### Verification Codes
**Interface:** `VerificationCode`
```typescript
interface VerificationCode {
  code: string;          // 6-digit numeric code
  expires: number;       // Unix timestamp (15 minutes)
}
```

### Password Reset Tokens
**Interface:** `PasswordResetToken`
```typescript
interface PasswordResetToken {
  token: string;         // UUID token
  expires: number;       // Unix timestamp (15 minutes)
}
```

---

## Database Operations

### User Management
- `createUser(userData)` - Create new user
- `getUser(email)` - Get user by email
- `updateUser(email, updates)` - Update user data
- `userExists(email)` - Check if user exists

### Email Verification
- `setVerificationCode(email, code, expiresInMinutes)` - Store code (default 15 min)
- `getVerificationCode(email)` - Get stored code
- `deleteVerificationCode(email)` - Remove used code
- `clearExpiredCodes()` - Clean up expired codes

### Password Reset
- `setPasswordResetToken(email, token, expiresInMinutes)` - Store token (default 15 min)
- `getPasswordResetToken(email)` - Get stored token
- `deletePasswordResetToken(email)` - Remove used token
- `clearExpiredPasswordResetTokens()` - Clean up expired tokens

---

## Security Considerations

### Current Implementation
- Email format validation (@ciit.edu.ph only)
- Password length requirements (min 8 characters)
- Verification codes expire in 15 minutes
- Password reset tokens expire in 15 minutes
- Generic error messages to prevent enumeration

### Production Recommendations
1. **Password Hashing:** Use bcrypt or Argon2
2. **Rate Limiting:** Implement API rate limiting
3. **CSRF Protection:** Add CSRF tokens
4. **Session Management:** Proper JWT/session handling
5. **HTTPS:** Enforce SSL in production
6. **Input Validation:** More strict validation
7. **Logging:** Audit logging for security events

---

## Email Service Configuration

### Resend Integration
**Environment Variables:**
```
RESEND_API_KEY=re_your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000 (for development)
```

**Email Templates:**
1. **Verification Email:** Contains 6-digit code
2. **Password Reset:** Contains reset link with token

---

## Testing Flow

### Complete Authentication Test
1. **Register:** Create new account → Receive verification email → Verify email
2. **Login:** Log in with verified account → Access dashboard
3. **Forgot Password:** Request reset → Receive reset email → Reset password → Test new password
4. **Error Cases:** Test invalid emails, wrong codes, expired tokens

### Development Mode
- Verification codes are returned in API responses for testing
- Use @ciit.edu.ph email addresses only
- Monitor console for email sending logs

---

## Environment Setup

### Required Environment Variables
```
# Email Service
RESEND_API_KEY=your_resend_api_key

# Application URL (for password reset links)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### Installation
```bash
npm install
npm run dev
```

### Dependencies
- Next.js 16.1.6
- React 18
- TypeScript
- Tailwind CSS
- Resend (email service)
- Node.js built-in crypto (for UUID generation)