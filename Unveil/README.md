# Unveil - CIIT College Academic App (Experiment)

An anonymous mentoring platform for CIIT students where users can create help signals and receive assistance from mentors while maintaining anonymity through masked identities.

## Features

- **Anonymous Mentoring**: Users interact through masked identities (e.g., "SecretPanda482")
- **Role-Based System**: Start as a student (mentee), can switch to mentor mode
- **Signal System**: Create help requests with titles, descriptions, and tags
- **Real-time Updates**: View signals from the community
- **Supabase Integration**: Full authentication and database management
- **CIIT-Only Access**: Only @ciit.edu.ph email addresses can register

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI**: Tailwind CSS, Lucide Icons
- **Backend/Auth**: Supabase (PostgreSQL, Authentication)
- **Email**: Brevo SMTP (configured in Supabase)

## Database Schema

The application uses the following tables:

### Users
- `user_id`: Unique identifier (references Supabase auth)
- `first_name`: User's first name
- `last_name`: User's last name
- `email_address`: User's email
- `mask`: Current role ('student' or 'mentor')
- `masked_name`: Anonymous identity displayed to others

### Signals
- `signal_id`: Unique signal identifier
- `user_id`: Creator of the signal
- `title`: Signal title
- `description`: Detailed description of the problem
- `tags`: Array of tags for categorization
- `status`: 'open', 'in_progress', or 'closed'
- `created_at` / `updated_at`: Timestamps

### Signal Chat
- `signalChatID`: Unique chat room identifier
- `signal_id`: Associated signal
- `created_at`: Creation timestamp

### Signal Chat Users
- `signalChatID`: Chat room identifier
- `user_id`: User in the chat
- `role`: User's role in the chat

### Signal Messages
- `message_id`: Unique message identifier
- `signalChatID`: Chat room identifier
- `sender_id`: Message sender
- `content`: Message content
- `created_at`: Timestamp

### Masked Names
- `id`: Unique identifier
- `user_id`: User identifier
- `role`: Role for this masked name
- `masked_name`: Anonymous identity

## Setup Instructions

### 1. Database Setup

Run the SQL schema in your Supabase SQL Editor:

```bash
# Copy and paste the contents of database.schema into Supabase SQL Editor
```

### 2. Environment Setup

Update `src/supabase-client.ts` with your Supabase credentials:

```typescript
export const supabase = createClient(
  "YOUR_SUPABASE_URL",
  "YOUR_SUPABASE_ANON_KEY"
)
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Password Management

Supabase handles password hashing automatically using bcrypt. You cannot retrieve user passwords - use the password reset flow for forgotten passwords. See `PASSWORD_MANAGEMENT.md` for detailed information.

## Application Flow

1. **Registration**: Users register with @ciit.edu.ph email and receive a masked identity
2. **Login**: Users sign in with their credentials
3. **Dashboard**: Users view all available signals
4. **Create Signal**: Students create help requests with details and tags
5. **Mentor Response**: Mentors can view and respond to signals (coming soon)
6. **Chat**: Signal creators and mentors communicate via anonymous chat (placeholder for now)

## Future Enhancements

- [ ] Real-time chat functionality
- [ ] Forum discussions
- [ ] Mentor rating system
- [ ] Signal filtering by tags
- [ ] User reputation system
- [ ] Course-based signal categorization

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only edit/delete their own signals
- Anonymous identities protect user privacy
- Email verification required (configurable in Supabase)

## File Structure

```
experiment/Unveil/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Home page
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── signals/           # Signals page (main feature)
│   │   ├── chat/              # Chat placeholder
│   │   ├── forums/            # Forums placeholder
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── AuthGuard.tsx      # Authentication protection
│   │   └── sidebar.tsx        # Navigation sidebar
│   ├── lib/
│   │   ├── database.ts        # Supabase database functions
│   │   └── utils.ts          # Utility functions
│   └── supabase-client.ts     # Supabase client configuration
├── database.schema            # SQL schema for Supabase
├── PASSWORD_MANAGEMENT.md     # Password handling documentation
└── package.json
```

## Contributing

This is an experimental version focusing on the signals functionality. Chat and forums features are placeholders for future development.

## License

Internal CIIT Project
