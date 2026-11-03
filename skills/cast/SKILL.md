---
name: cast
description: Adds a dev-only demo mode that fills the real app with named people, coherent numbers and a short live script for screenshots and recordings.
---

# Cast

This skill fills the running app with a realistic cast so it looks ready to show. The same views, types and components stay, and only the data changes, in development only.

## The product at its best

Use it when the user wants realistic demo data, a demo mode or to replace lorem ipsum or placeholders. Also use it to make the app look alive for screenshots, recordings, launches or demos.

The switch and the script clock are exact. The switch is `?demo`. When the project already has a demo flag, use that one. A second switch is `cast-one-switch`.

The cast shows the product on a good day. Names, amounts and dates stay inside a realistic range. A 180-character name or thousands of rows, added to see what breaks, is `cast-best-not-worst`. Testing a field against a long realistic value belongs to `defaults`.

A database seed is not a demo mode. That is `cast-not-a-seed`. Rows on a temporary variant page belong to `prototype`. Forcing every state open belongs to `lab`.

Labels follow `copy`. How a surface behaves follows `defaults`. How a beat moves follows `motion`. Contrast of an avatar follows `color`. Recording the result belongs to `clip`.

## 1. Read the views and the boundary

Read the routes and the types the views already render. Find the fetch, loader, query or store each view reads. A cast written before that read is `cast-read-the-boundary`.

## 2. Mock at that boundary

Return the cast from the boundary the view already uses, behind the dev flag, with the same types. A copied screen, a `Demo` component or a second markup tree is `cast-same-components`.

Guard the import with the bundler's dev flag, such as `import.meta.env.DEV` or `process.env.NODE_ENV !== "production"`, so the production build drops the module. Production ignores the switch even if the query is present. A cast that ships, or a `?demo` that works in production, is `cast-dev-only`.

## 3. Write one cast

Give every data view a full, believable state. An empty list, a skeleton or lorem left on a view in demo mode is `cast-every-view`.

One story. Each person has one name, one role and one avatar on every view. Maya Chen as both the lead and an unnamed customer is `cast-one-story`.

No lorem ipsum and no placeholder names such as "John Doe", "User 1", "foo" or "test". A placeholder sentence is `cast-no-lorem`.

Avatars are initials or a generated mark seeded from the name, so the same person looks the same everywhere. A stock photo URL is `cast-generated-avatars`.

Numbers add up. A total equals the sum of its parts. Parts of a whole sum to 100. A count equals the rows shown. A headline of `1284` over rows that sum to `960` is `cast-numbers-add-up`.

Dates are offsets from `Date.now()` on one timeline. A reply never predates its message. A fixed `2021-01-02` beside "2 hours ago" is `cast-relative-dates`. Pass values the view already formats.

## 4. Add a live script when the screen should look in use

Skip the script for a still fill. Add it when the user wants screenshots, a recording, a launch or a demo to look in use.

Three beats at most, and only events the view already renders: a message arrives, a chart ticks and a toast fires. A chart added so it can tick is `cast-live-script`.

The clock is exact. The first beat lands at `1200ms`, the next beats `2400ms` apart, then the full cast holds for `2400ms` and the script restarts. The order is message, chart and toast, skipping any the view does not have. The same order runs on every load.

Under reduced motion, show the full cast and skip the script.

No banner, badge or watermark that says Demo. The switch is the URL. Chrome in the frame is `cast-no-frame-chrome`.

## 5. Open it

Start the dev server and open the app with the switch off, then on. Look at every view. A path in the reply with nothing opened is `cast-open-it`.

When the user wants a recording, record with `clip` after cast. Ending that ask without the hand-off is `cast-then-clip`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `cast-one-switch` | `?preview=1` added beside an existing `?demo` | The project's `?demo` |
| `cast-best-not-worst` | A 180-character name and 4000 rows | A normal week, every row a plausible one |
| `cast-not-a-seed` | `prisma/seed.ts` inserting the cast | The fetch returns the cast in development |
| `cast-read-the-boundary` | A `cast.ts` written before the loader is read | The loader and its types read first |
| `cast-same-components` | A `DemoInbox` with its own markup | `getInbox()` returns the cast, `Inbox` renders it |
| `cast-dev-only` | `?demo` served from the production bundle | Import gated by `import.meta.env.DEV`, switch ignored in production |
| `cast-every-view` | Inbox filled, dashboard still "No data" | Both views filled from the same cast |
| `cast-one-story` | Maya Chen listed again as "Customer" | Maya Chen, Support Lead, on every view |
| `cast-no-lorem` | `Lorem ipsum dolor sit amet` | "The renewal landed. I moved the invoice to Friday." |
| `cast-generated-avatars` | `https://i.pravatar.cc/80?u=maya` | Initials `MC` on a fill hashed from the name |
| `cast-numbers-add-up` | Headline `1284`, rows summing to `960` | Headline `960`, equal to the rows |
| `cast-relative-dates` | `2021-01-02` on a reply "2 hours ago" | Thread opened 3 days ago, reply 2 hours ago, both from `Date.now()` |
| `cast-live-script` | A chart mounted only so a bar can tick | The existing chart ticks at `1200ms`, then a toast at `3600ms` |
| `cast-no-frame-chrome` | A "Demo Mode" banner across the top | No banner. The switch is `?demo` |
| `cast-open-it` | "Added `?demo`" | The app opened with the switch off, then on |
| `cast-then-clip` | A recording ask closed after the screenshot | "Record with `clip` after cast." |

## Reporting

**Severity.** `HIGH` is a cast that ships in production, a second screen standing in for the real one or a cast written into the database. `MEDIUM` is a second switch, an unread boundary, an empty or lorem view, two roles for one person or a stock photo. It is also a total that disagrees with its rows, a stale date, stress data, a beat the view cannot show or a Demo badge in the frame. `LOW` is a demo that was not opened or a recording ask with no hand-off to `clip`.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark every view you could not open as `Not verified`.
