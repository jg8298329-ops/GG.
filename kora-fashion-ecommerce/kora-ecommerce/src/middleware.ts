import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/store-control')) {
    return response;
  }

  // Prevent search engine indexing of admin routes
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');

  const isAuthPage =
    pathname === '/store-control/login' ||
    pathname === '/store-control/reset-password';

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.headers.set('X-Robots-Tag', 'noindex, nofollow');
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isAuthPage) {
    const loginUrl = new URL('/store-control/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (user && !isAuthPage) {
    const { data: adminRecord } = await supabase
      .from('admin_users')
      .select('id, is_active')
      .eq('id', user.id)
      .eq('is_active', true)
      .single();

    if (!adminRecord) {
      const loginUrl = new URL('/store-control/login?error=unauthorized', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/store-control/:path*'],
};
