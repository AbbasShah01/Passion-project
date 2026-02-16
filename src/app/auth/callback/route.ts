import { NextResponse } from "next/server";
import { isDemoModeServer } from "@/lib/runtime-config";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error_description");

  if (error) {
    const redirectUrl = new URL("/auth/login", requestUrl.origin);
    redirectUrl.searchParams.set("error", error);
    return NextResponse.redirect(redirectUrl);
  }

  if (isDemoModeServer()) {
    return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
  }

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      const redirectUrl = new URL("/auth/login", requestUrl.origin);
      redirectUrl.searchParams.set("error", exchangeError.message);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
}
