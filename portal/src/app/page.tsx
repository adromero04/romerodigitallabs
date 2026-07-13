import { getCurrentProfile } from "@/lib/auth/session";
import { homePathForRole } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  redirect(homePathForRole(profile.role));
}
