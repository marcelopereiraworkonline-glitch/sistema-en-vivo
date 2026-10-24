import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function userClient() {
  const store = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll();
        },
        setAll(list: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            list.forEach(({ name, value, options }) => {
              store.set({ name, value, ...options });
            });
          } catch {
            // Server Components cannot write cookies.
          }
        },
      },
    }
  );
}

export async function currentUser() {
  const db = await userClient();
  const { data: { user } } = await db.auth.getUser();
  return user;
}
