import { redirect } from "next/navigation";

/** Marketing for this deployable is unused — send operators straight to the dashboard. */
export default function HomePage() {
  redirect("/admin");
}
