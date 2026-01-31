
import { createBrowserClient } from '@supabase/ssr'

// This client automatically manages cookies so the Server can see the login
export const supabase = createBrowserClient(
  "https://ymjiaznhhzkxbskuqmra.supabase.co",
  "sb_publishable_pHfjDdl-eOWIPMTswW2oEw_Sz22rAYt"
)