import Link from "next/link";
import { Suspense } from "react";
import { BrewmoteCafeSearchResults } from "./BrewmoteCafeSearchResults";
import { BrewmoteTableSkeleton } from "./brewmote-skeletons";
import { BrewmoteUserSearchResults } from "./BrewmoteUserSearchResults";

type Props = {
  userEmail?: string;
  cafeName?: string;
};

export function BrewmoteSearchPanel({ userEmail, cafeName }: Props) {
  return (
    <section className="panel-block admin-section" aria-labelledby="brewmote-search-heading">
      <h2 id="brewmote-search-heading" className="admin-section-title">
        Search
      </h2>
      <p className="muted admin-section-desc">
        Searches stay in the address bar so you can bookmark or share. Each field keeps the other filter when you search.
      </p>

      <div className="brewmote-search-grid">
        <div className="brewmote-search-col">
          <h3 className="brewmote-subheading">User by email</h3>
          <form className="brewmote-form" method="get" action="/admin/brewmote">
            {cafeName ? <input type="hidden" name="cafeName" value={cafeName} /> : null}
            <label className="brewmote-form__label" htmlFor="userEmail">
              Email
            </label>
            <input
              id="userEmail"
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
                <Link href={cafeName ? `/admin/brewmote?cafeName=${encodeURIComponent(cafeName)}` : "/admin/brewmote"} className="brewmote-form__clear muted">
                  Clear user search
                </Link>
              ) : null}
            </div>
          </form>
          <div className="brewmote-search-results">
            <Suspense key={userEmail ?? "user-idle"} fallback={<BrewmoteTableSkeleton cols={2} />}>
              <BrewmoteUserSearchResults email={userEmail} />
            </Suspense>
          </div>
        </div>

        <div className="brewmote-search-col">
          <h3 className="brewmote-subheading">Cafe by name</h3>
          <form className="brewmote-form" method="get" action="/admin/brewmote">
            {userEmail ? <input type="hidden" name="userEmail" value={userEmail} /> : null}
            <label className="brewmote-form__label" htmlFor="cafeName">
              Name contains
            </label>
            <input
              id="cafeName"
              className="brewmote-form__input"
              name="cafeName"
              type="search"
              placeholder="e.g. Downtown"
              defaultValue={cafeName ?? ""}
              autoComplete="off"
            />
            <div className="brewmote-form__actions">
              <button type="submit" className="btn">
                Search cafes
              </button>
              {cafeName ? (
                <Link
                  href={userEmail ? `/admin/brewmote?userEmail=${encodeURIComponent(userEmail)}` : "/admin/brewmote"}
                  className="brewmote-form__clear muted"
                >
                  Clear cafe search
                </Link>
              ) : null}
            </div>
          </form>
          <div className="brewmote-search-results">
            <Suspense key={cafeName ?? "cafe-idle"} fallback={<BrewmoteTableSkeleton cols={1} />}>
              <BrewmoteCafeSearchResults name={cafeName} />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
