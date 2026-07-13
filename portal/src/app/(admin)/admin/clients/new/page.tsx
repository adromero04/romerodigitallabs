import Link from "next/link";
import { ClientForm } from "@/components/admin/ClientForm";
import { PageHeader } from "@/components/ui/Primitives";

export const metadata = { title: "New client" };

export default function NewClientPage() {
  return (
    <div className="stack">
      <PageHeader
        title="New client"
        description="Create a client organization, then invite owners and members."
        actions={
          <Link className="btn btn-ghost btn-sm" href="/admin/clients">
            Back to clients
          </Link>
        }
      />
      <ClientForm />
    </div>
  );
}
