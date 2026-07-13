import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import { redirect } from "next/navigation";
import { homePathForRole, isAdmin } from "@/lib/permissions";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error || !data) return null;
  return data as Profile;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireProfile() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.is_active) redirect("/login?error=inactive");
  return profile;
}

export async function requireAdmin() {
  const profile = await requireProfile();
  if (!isAdmin(profile)) redirect("/dashboard");
  return profile;
}

export async function requireClient() {
  const profile = await requireProfile();
  if (isAdmin(profile)) redirect("/admin");
  return profile;
}

export async function redirectIfAuthenticated() {
  const profile = await getCurrentProfile();
  if (profile) redirect(homePathForRole(profile.role));
}
