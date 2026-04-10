import { AdminRecordsTable } from "@/components/admin/AdminRecordsTable";
import { BrewmoteStateCallout } from "@/components/brewmote/BrewmoteStateCallout";
import { loadSimpleListListsForUser } from "@/server/simplelistPageLoaders";

export async function SimplelistUserListsSection({ userId }: { userId: string | undefined }) {
  const result = await loadSimpleListListsForUser(userId);

  if (result.status === "idle") {
    return (
      <div className="panel-block admin-section" style={{ marginTop: "1.5rem" }}>
        <h3 className="brewmote-subheading">Selected user&apos;s lists</h3>
        <BrewmoteStateCallout variant="info" title="No user selected">
          Search by email and click <strong>View lists</strong>, or paste a user id into the lists field above.
        </BrewmoteStateCallout>
      </div>
    );
  }

  if (result.status === "invalid_param") {
    return (
      <div className="panel-block admin-section" style={{ marginTop: "1.5rem" }}>
        <h3 className="brewmote-subheading">Selected user&apos;s lists</h3>
        <BrewmoteStateCallout variant="error" title="Invalid user id">
          {result.message}
        </BrewmoteStateCallout>
      </div>
    );
  }

  if (result.status === "not_configured") {
    return (
      <div className="panel-block admin-section" style={{ marginTop: "1.5rem" }}>
        <h3 className="brewmote-subheading">Selected user&apos;s lists</h3>
        <BrewmoteStateCallout variant="todo" title="Lists aren’t connected">
          {result.message}
        </BrewmoteStateCallout>
      </div>
    );
  }

  if (result.status === "error") {
    return (
      <div className="panel-block admin-section" style={{ marginTop: "1.5rem" }}>
        <h3 className="brewmote-subheading">Selected user&apos;s lists</h3>
        <BrewmoteStateCallout variant="error" title="Could not load lists">
          {result.message}
        </BrewmoteStateCallout>
      </div>
    );
  }

  if (result.status === "empty") {
    return (
      <div className="panel-block admin-section" style={{ marginTop: "1.5rem" }}>
        <h3 className="brewmote-subheading">Selected user&apos;s lists</h3>
        <p className="muted" style={{ marginBottom: "0.5rem" }}>
          User id: <code className="admin-code">{userId}</code>
        </p>
        <BrewmoteStateCallout variant="empty" title="No lists for this user">
          This account has no lists on file, or lists are stored under a different owner field than expected.
        </BrewmoteStateCallout>
      </div>
    );
  }

  return (
    <div className="panel-block admin-section" style={{ marginTop: "1.5rem" }}>
      <h3 className="brewmote-subheading">Selected user&apos;s lists</h3>
      <p className="muted" style={{ marginBottom: "0.75rem" }}>
        User id <code className="admin-code">{userId}</code> — showing up to 100 lists.
      </p>
      <AdminRecordsTable rows={result.rows} />
    </div>
  );
}
