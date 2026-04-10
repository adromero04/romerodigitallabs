import Link from "next/link";
import { Suspense } from "react";
import { BrewmoteTableSkeleton } from "@/components/brewmote/brewmote-skeletons";
import { SimplelistUserListsSection } from "./SimplelistUserListsSection";
import { SimplelistUserSearchResults } from "./SimplelistUserSearchResults";

type Props = {
  userEmail?: string;
  listsForUser?: string;
};

export function SimplelistSearchPanel({ userEmail, listsForUser }: Props) {
  return (
    <section className="panel-block admin-section" aria-labelledby="sl-search-heading">
      <h2 id="sl-search-heading" className="admin-section-title">
        Search &amp; user lists
      </h2>
      <p className="muted admin-section-desc">
        Filters stay in the address bar. Use a user’s id to load their lists (ids appear next to accounts in search results).
      </p>

      <div className="brewmote-search-grid">
        <div className="brewmote-search-col">
          <h3 className="brewmote-subheading">User by email</h3>
          <form className="brewmote-form" method="get" action="/admin/simplelist">
            {listsForUser ? <input type="hidden" name="listsForUser" value={listsForUser} /> : null}
            <label className="brewmote-form__label" htmlFor="slUserEmail">
              Email
            </label>
            <input
              id="slUserEmail"
              className="brewmote-form__input"
              name="userEmail"
              type="search"
              placeholder="user@example.com"
              defaultValue={userEmail ?? ""}
              autoComplete="off"
            />
            <div className="brewmote-form__actions">
              <button type="submit" className="btn">
                Search users
              </button>
              {userEmail ? (
                <Link
                  href={listsForUser ? `/admin/simplelist?listsForUser=${encodeURIComponent(listsForUser)}` : "/admin/simplelist"}
                  className="brewmote-form__clear muted"
                >
                  Clear email search
                </Link>
              ) : null}
            </div>
          </form>
          <div className="brewmote-search-results">
            <Suspense key={userEmail ?? "sl-user-idle"} fallback={<BrewmoteTableSkeleton cols={2} />}>
              <SimplelistUserSearchResults email={userEmail} />
            </Suspense>
          </div>
        </div>

        <div className="brewmote-search-col">
          <h3 className="brewmote-subheading">Lists for user (UUID)</h3>
          <form className="brewmote-form" method="get" action="/admin/simplelist">
            {userEmail ? <input type="hidden" name="userEmail" value={userEmail} /> : null}
            <label className="brewmote-form__label" htmlFor="slListsForUser">
              User id
            </label>
            <input
              id="slListsForUser"
              className="brewmote-form__input"
              name="listsForUser"
              type="search"
              placeholder="auth user UUID"
              defaultValue={listsForUser ?? ""}
              autoComplete="off"
            />
            <div className="brewmote-form__actions">
              <button type="submit" className="btn">
                Load lists
              </button>
              {listsForUser ? (
                <Link
                  href={userEmail ? `/admin/simplelist?userEmail=${encodeURIComponent(userEmail)}` : "/admin/simplelist"}
                  className="brewmote-form__clear muted"
                >
                  Clear lists filter
                </Link>
              ) : null}
            </div>
          </form>
          <div className="brewmote-search-results">
            <Suspense key={listsForUser ?? "sl-lists-idle"} fallback={<BrewmoteTableSkeleton cols={4} />}>
              <SimplelistUserListsSection userId={listsForUser} />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
