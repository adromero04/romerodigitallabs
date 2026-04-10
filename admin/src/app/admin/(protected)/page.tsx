import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { getDashboardSnapshot } from "@/server/dashboardOverview";

export default async function AdminHomePage() {
  const snapshot = await getDashboardSnapshot();
  return <DashboardOverview snapshot={snapshot} />;
}
