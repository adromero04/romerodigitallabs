import { BrewmoteStateCallout } from "@/components/brewmote/BrewmoteStateCallout";

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

type Props = { rows: Record<string, unknown>[] };

/**
 * Generic key/value table for arbitrary row previews (search results, etc.).
 * Uses shared `.brewmote-table` styles for layout parity with Brewmote admin.
 */
export function AdminRecordsTable({ rows }: Props) {
  const keys = Array.from(
    rows.reduce((acc, row) => {
      Object.keys(row).forEach((k) => acc.add(k));
      return acc;
    }, new Set<string>()),
  );

  if (keys.length === 0) {
    return (
      <BrewmoteStateCallout variant="empty" title="Rows have no columns">
        Unexpected empty shape.
      </BrewmoteStateCallout>
    );
  }

  return (
    <div className="brewmote-table-wrap">
      <table className="brewmote-table">
        <thead>
          <tr>
            {keys.map((k) => (
              <th key={k}>{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {keys.map((k) => (
                <td key={k}>{formatCell(row[k])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
