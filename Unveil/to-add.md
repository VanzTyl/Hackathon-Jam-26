# Supabase Database Integration - To-Do List

This document tracks which pages and components have forms/data that need to be connected to Supabase database.

## Status Legend
- ✅ **Implemented** - Already connected to Supabase
- 🔄 **In Progress** - Partially implemented
- 📋 **To Do** - Ready for implementation
- 🔧 **Raw State** - Currently has raw/hardcoded data, needs backend connection

---

## Pages & Components

### 1. Register Page (`/register`)
**Status:** ✅ **Implemented**
**Forms:**
- User registration form (email, password, first_name, last_name)

**Database Operations:**
- ✅ Create Supabase auth user
- ✅ Create user record in `users` table
- ✅ Generate masked name
- ✅ Set initial mask mode to 'student'

**Code Location:** `src/app/register/page.tsx`

---

### 2. Login Page (`/login`)
**Status:** ✅ **Implemented**
**Forms:**
- Login form (email, password)

**Database Operations:**
- ✅ Authenticate via Supabase auth

**Code Location:** `src/app/login/page.tsx`

---

### 3. Signals Page (`/signals`)
**Status:** ✅ **Implemented**
**Forms:**
- Create Signal Modal
  - Title (text)
  - Description (textarea)
  - Tags (comma-separated)
- Edit Signal Modal
  - Title (text)
  - Description (textarea)
  - Tags (comma-separated)

**Database Operations:**
- ✅ Get signals from `signals` table
- ✅ Create new signal in `signals` table
- ✅ Update existing signal in `signals` table
- ✅ Delete signal from `signals` table
- ✅ Get current user data

**Code Location:** `src/app/signals/page.tsx`

---

### 4. Home Page (`/`)
**Status:** 🔄 **In Progress**
**Features:**
- Display user profile information
- Forum feed placeholder

**Database Operations Needed:**
- ✅ Get current user data
- 📋 **Get user's forum posts** (placeholder data)
- 📋 **Get user's connections** (placeholder data)
- 🔧 **Swap Mask functionality** (frontend only, needs backend)

**Current Data:** Hardcoded forum posts and connections

**Code Location:** `src/app/page.tsx`, `src/components/profile-panel.tsx`

---

### 5. Forums Page (`/forums`)
**Status:** 📋 **To Do**
**Features:**
- Display forum posts
- Create new thread input

**Database Operations Needed:**
- 📋 **Get forum posts** (currently placeholder data)
- 📋 **Create new forum post**
- 📋 **Add response/comment to forum post**
- 📋 **Bookmark forum post**

**Current Data:** Hardcoded forum posts

**Code Location:** `src/app/forums/page.tsx`, `src/components/forum-feed.tsx`

---

### 6. Chat Page (`/chat`)
**Status:** 📋 **To Do**
**Features:**
- Display chat interface
- Real-time messaging

**Database Operations Needed:**
- 📋 **Get chat messages**
- 📋 **Send new message**
- 📋 **Get signal chats** (for help requests)
- 📋 **Create signal chat room**
- 📋 **Add user to signal chat**
- 📋 **Real-time subscription** for new messages

**Current Data:** Placeholder chat interface

**Code Location:** `src/app/chat/page.tsx`

---

## Key Database Tables & Operations

### users Table
| Operation | Status | Code Location |
|-----------|--------|---------------|
| Create user | ✅ | `src/lib/database.ts:58` |
| Get user | ✅ | `src/lib/database.ts:69` |
| Update user | ✅ | `src/lib/database.ts:80` |

**Additional Operation Needed:**
- 📋 **Update mask field** - Swap mask functionality needs to persist to database

---

### signals Table
| Operation | Status | Code Location |
|-----------|--------|---------------|
| Create signal | ✅ | `src/lib/database.ts:92` |
| Get signals | ✅ | `src/lib/database.ts:109` |
| Get signal by ID | ✅ | `src/lib/database.ts:130` |
| Update signal | ✅ | `src/lib/database.ts:147` |
| Delete signal | ✅ | `src/lib/database.ts:159` |

---

### signalChat Table
| Operation | Status | Code Location |
|-----------|--------|---------------|
| Create signal chat | ✅ | `src/lib/database.ts:168` |

---

### signalChatUsers Table
| Operation | Status | Code Location |
|-----------|--------|---------------|
| Add user to signal chat | ✅ | `src/lib/database.ts:179` |
| Get signal chat users | ✅ | `src/lib/database.ts:190` |

---

### signalMessages Table
| Operation | Status | Code Location |
|-----------|--------|---------------|
| Create signal message | ✅ | `src/lib/database.ts:206` |
| Get signal messages | ✅ | `src/lib/database.ts:223` |

---

### masked_names Table
| Operation | Status | Code Location |
|-----------|--------|---------------|
| Get user masked names | ✅ | `src/lib/database.ts:240` |
| Create masked name | ✅ | `src/lib/database.ts:250` |

---

## Swap Mask Functionality

### Current Implementation: Frontend Only
**Status:** 🔧 **Raw State**

**What It Does:**
- Allows users to toggle between 'student' (mentee) and 'mentor' mode
- Displays current mode in sidebar
- Modal to select between mentee/mentor

**What's Missing:**
- 📋 Database persistence - Need to update `users.mask` field in Supabase
- 📋 Generate new masked name when switching modes
- 📋 Store multiple masked names per user (one for each role)

**Implementation Plan:**
1. Add `updateUserMask(userId, mask)` function to `src/lib/database.ts`
2. On swap mask:
   - Generate new masked name for target mode (if not exists)
   - Update user's `mask` field in `users` table
   - Store in `masked_names` table if new

**Code Locations:**
- `src/components/sidebar.tsx` - Swap mask modal and state
- All pages - Pass `maskMode` and `setMaskMode` props

---

## Forum Posts (To Implement)

### Tables Needed:
- `forum_posts` - Main forum posts
- `forum_responses` - Comments/responses to posts
- `forum_bookmarks` - User's bookmarked posts

### Fields for forum_posts:
- `post_id` (UUID, PK)
- `user_id` (UUID, FK to users)
- `title` (VARCHAR)
- `content` (TEXT)
- `tags` (TEXT[])
- `is_anonymous` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Fields for forum_responses:
- `response_id` (UUID, PK)
- `post_id` (UUID, FK)
- `user_id` (UUID, FK)
- `content` (TEXT)
- `created_at` (TIMESTAMP)

### Fields for forum_bookmarks:
- `bookmark_id` (UUID, PK)
- `user_id` (UUID, FK)
- `post_id` (UUID, FK)
- `created_at` (TIMESTAMP)

---

## User Connections (To Implement)

### Tables Needed:
- `connections` - User's connections/mentors

### Fields for connections:
- `connection_id` (UUID, PK)
- `user_id` (UUID, FK - owner)
- `connected_user_id` (UUID, FK - connected user)
- `status` (VARCHAR - pending, accepted)
- `created_at` (TIMESTAMP)

---

## Chat Functionality (To Implement)

### Tables Already Available:
- ✅ `signalChat` - Chat rooms for signals
- ✅ `signalChatUsers` - Users in chat
- ✅ `signalMessages` - Messages in chat

### Real-time Features Needed:
- 📋 WebSocket/Realtime subscription for new messages
- 📋 Typing indicators
- 📋 Read receipts
- 📋 Online status

---

## Priority Implementation Order

### Phase 1: Complete Swap Mask (High Priority)
1. Add `updateUserMask()` function to database.ts
2. Generate/store masked names when switching
3. Update user's `mask` field in Supabase
4. Test flow: mentee ↔ mentor switching

### Phase 2: Forum Posts (High Priority)
1. Create `forum_posts`, `forum_responses`, `forum_bookmarks` tables
2. Add CRUD functions to database.ts
3. Replace placeholder data with real database calls
4. Implement post creation form
5. Implement response/comment system

### Phase 3: Chat Real-time (Medium Priority)
1. Test existing signal chat functions
2. Implement real-time subscriptions
3. Build chat UI with message history
4. Add typing indicators

### Phase 4: User Connections (Medium Priority)
1. Create `connections` table
2. Add connection request/accept functions
3. Build connections UI (currently placeholder)
4. Implement mentor/mentee matching

---

## Files to Update

1. **`src/lib/database.ts`** - Add missing CRUD functions
2. **`src/app/page.tsx`** - Pass maskMode props to components
3. **`src/app/forums/page.tsx`** - Connect to real forum data
4. **`src/app/chat/page.tsx`** - Connect to signal chat system
5. **`src/components/sidebar.tsx`** - ✅ Update with swap mask props (done)
6. **`src/components/profile-panel.tsx`** - ✅ Display real/masked name (done)

---

## Notes

- All pages with Supabase operations use the `@/lib/database` functions
- AuthGuard component wraps authenticated pages
- RLS is DISABLED for prototyping - needs to be enabled for production
- Current masked name generation: adjective + animal + random 3-digit number
