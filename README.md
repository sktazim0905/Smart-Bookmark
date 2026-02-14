# Smart Bookmark App

A secure and responsive bookmark manager built using Next.js and
Supabase with Google OAuth authentication and realtime synchronization.

------------------------------------------------------------------------

##  Tech Stack

-   Frontend: Next.js (App Router)
-   Styling: Tailwind CSS
-   Backend / Auth / Database: Supabase
-   Authentication Provider: Google OAuth

------------------------------------------------------------------------

##  How to Run the Project Locally

### 1. Clone the Repository

``` bash
git clone <your-repo-url>
cd smart-bookmarks
```

### 2. Install Dependencies

``` bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

    NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>

You can find these values in:

Supabase → Settings → API

### 4. Run the Development Server

``` bash
npm run dev
```

Visit:

http://localhost:3000
Vercel Link: https://smart-bookmark-gold.vercel.app

------------------------------------------------------------------------

##  Challenges Faced & Solutions Implemented

-   **Realtime synchronization:** Diagnosed and resolved a cross-tab
    sync issue where UI updates only appeared after refresh. Root causes
    included WebSocket auth key mismatch and missing table publication;
    fixes included switching to the correct anon JWT key, adding the
    `bookmarks` table to the `supabase_realtime` publication, and
    verifying successful `101 Switching Protocols` WebSocket handshake.

-   **Database & security design:** Refactored schema to production-safe
    standards by defining `user_id` as `UUID` referencing
    `auth.users(id)` and implementing proper `WITH CHECK` RLS policies
    to strictly enforce row ownership.

-   **OAuth flow reliability:** Resolved production redirect mismatches
    by correcting Supabase Site URL and Google Authorized JavaScript
    Origins, validating the complete OAuth handshake using network
    inspection and Supabase auth logs.

-   **Resilience & UX consistency:** Implemented optimistic UI updates
    alongside realtime subscriptions to ensure immediate feedback and
    smooth user experience even during temporary realtime disruptions.

------------------------------------------------------------------------

##  Final Result

-   Secure Google authentication
-   Private user data with Row Level Security (RLS)
-   Instant cross-tab realtime synchronization
-   Clean, responsive, production-ready UI
