# Catalog

The worst-case values for steps 2 and 3, grouped by what they break. Paste each value as written, because the exact string is the test. A value in double quotes inside a code span is a string literal, so its spaces and escapes count.

## Long values

| Case | Value | Passes when |
| --- | --- | --- |
| Email, 64 characters | `bartholomew.fitzgerald@northwind-industries-holdings.example.com` | It wraps with `overflow-wrap: anywhere`, or truncates with the whole address reachable |
| File name | `IMG_20250914_183022_HDR_portrait_edited_edited.HEIC` | It truncates in the middle and `.HEIC` stays visible |
| One 30-letter word | `Benachrichtigungseinstellungen` | It wraps or truncates and pushes no neighbour out |
| UUID | `3f9c2b1e-8d4a-4f6b-9e2c-7a1d5b8c0f34` | It fits its cell and copies whole |
| URL with a query string | `https://example.com/search?q=quarterly+revenue+report&filters=region%3Aemea%2Cstatus%3Aactive&sort=-updated_at&page=12&utm_source=newsletter&utm_campaign=2025-q3` | The text wraps or shortens and the `href` stays whole |
| At the column limit | `"Quarterly planning review ".repeat(10).slice(0, 255)` | It clamps to its lines and the full value opens on demand |

## Shortest values

| Case | Value | Passes when |
| --- | --- | --- |
| One letter | `J` | The initials read `J` and the row keeps its height |
| Two letters | `Jo` | The column keeps its minimum width |
| Shortest email | `a@b.test` | Actions beside it stay in their column |

## Names for initials

| Case | Value | Passes when |
| --- | --- | --- |
| Emoji with a skin tone and a joiner | `👩🏽‍💻 Priya` | The initial is the whole emoji or `P`, never half a glyph |
| Emoji first | `🦊 Fox` | The initial is `🦊` or `F` |
| Four words with a suffix | `Christopher Alexander Montgomery III` | The initials read `CM`, skipping `III` |
| Lowercase single name | `dana` | The initial reads `D` |
| Spaces at both edges | `" Sam Lee "` | The initials read `SL` and the name shows trimmed |
| Chinese name | `王秀英` | The initial is `王` |

Take the first grapheme with `Intl.Segmenter`, never `name[0]`, which splits an emoji in half.

## Tall scripts and mixed direction

The Vietnamese, Thai and Arabic names run here as user data through the fixture. A clipped mark or a misplaced full stop in one of them is a `viewports` finding.

| Case | Value | Passes when |
| --- | --- | --- |
| Vietnamese marks above and below | `Đặng Thị Ngọc Hân` | No mark is clipped by a fixed `height` or `line-height: 1` |
| Thai stacked marks | `สมศักดิ์ ศรีสุวรรณ` | No mark is clipped and the row keeps its rhythm |
| Arabic in a left-to-right row | `نور الهدى عبد الرحمن` | The name reads right to left and the count after it stays on its own side, isolated with `dir="auto"` or `<bdi>` |
| Stacked combining marks | `"Z\u0335\u0321\u031Ba\u0337l\u0338g\u0335o\u0336"` | The marks stay inside the row and never cover the rows above or below |
| A right-to-left override | `"invoice\u202Efdp.exe"` | The reversal stays inside its own element, isolated with `<bdi>` or `unicode-bidi: isolate`, and the next column reads normally |

## Literal markup

| Case | Value | Passes when |
| --- | --- | --- |
| A script tag | `<script>alert(1)</script>` | It shows as text, never runs and is never stripped |
| An entity | `&amp;` | It shows as `&amp;`, not `&` and not `&amp;amp;` |
| Formatting syntax | `**bold**` | It shows with its asterisks, unless the field renders formatting |

## Breaks and blanks

| Case | Value | Passes when |
| --- | --- | --- |
| A newline in a single-line field | `"Line one\nLine two"` | Rows and titles show one line, and the edit form keeps the break |
| Empty title | `""` | It shows the fallback `states-blank-strings` sets |
| Whitespace title | `"   "` | It shows the fallback `states-blank-strings` sets |
| Zero-width title | `"\u200B"` | It counts as blank and shows the fallback `states-blank-strings` sets |
| A real title of the fallback word | `Untitled` | It shows as the user typed it and is never treated as missing |

## Numbers out of range

| Case | Value | Passes when |
| --- | --- | --- |
| Over 100% | `142%` | The bar stops at full and the label reads `142%` |
| Negative | `-3%` | The bar is empty and the label keeps its sign |
| Float error | `0.30000000000000004` | It shows rounded, such as `0.3` |
| Large count | `1000000` | It shows grouped, such as `1,000,000` or `1M` |
| Zero | `0` | It shows `0`, and `{count && <Badge />}` renders no stray `0` |
| Negative money with cents | `-1234567.891` | It shows `-$1,234,567.89` in `en-US` through `Intl.NumberFormat`, the sign and the grouping kept |
| An ID past the safe integer | `9007199254740993` | It shows and links as `9007199254740993`, never `9007199254740992`, because the ID stays a string |

## Sort order

| Case | Value | Passes when |
| --- | --- | --- |
| Accents and case | `Zack`, `adam`, `Émile` and `zoë` | They sort `adam`, `Émile`, `Zack`, `zoë` with `Intl.Collator`, never capitals first and `Émile` last |
| Numbers inside names | `Item 10` and `Item 9` | `Item 9` sorts first, with `Intl.Collator(undefined, { numeric: true })` |

## Time edges

| Case | Value | Passes when |
| --- | --- | --- |
| Now | the pinned now, with the screen's clock pinned to it | It reads `Just now`, never `0 seconds ago` |
| A duration of zero | 0 seconds | It reads `0s` or `0:00`, never blank |
| A future date | 3 days after the pinned now | It reads `in 3 days`, never `-3 days ago` |
| The zero date | `1970-01-01` | A real date shows as written, and a null cast to zero shows as missing |
| A date with no time | `2024-02-29` | It reads 29 February 2024 in every time zone, never 28 February west of UTC, because `new Date("2024-02-29")` parses as UTC midnight |
| Across a date line | `2025-12-31T23:30:00-08:00` | It reads 31 December 2025 at `-08:00` and 1 January 2026 in UTC, the year right in both |
| A duration past its unit | `1,284 hours` | It reads `53 days` or `1,284 h` and fits its cell |

## Collection edges

| Case | Value | Passes when |
| --- | --- | --- |
| None | 0 rows | The empty state `states` sets shows |
| One | 1 row | Labels are singular, such as `1 item` |
| Exactly one page | the page size, such as 25 | No next-page control leads to nothing |
| One past a page | the page size + 1 | The last row is reachable |
| Many | 1,000+ rows | It scrolls and filters without freezing |
| Same names | two rows named `Alex Kim` | A second detail, such as the email, tells them apart |
| Same ID | two rows sharing one `id` | Both rows render, and editing one leaves the other unchanged |
| Many tags | 12 tags on one row | They wrap to a set number of lines or end in a `+N` count |
| One wide tag | `Customer success escalations (EMEA)` | It truncates inside its own chip |
| Every status | each enum value once in one list | It passes `states-every-status-at-once` |
| The current user | the signed-in user as a row | It passes `states-current-user` |

## Extreme images

| Case | Value | Passes when |
| --- | --- | --- |
| Very wide | a 4000×200 image | It crops with `object-fit: cover` and its box keeps its size |
| Very tall | a 200×4000 image | It crops the same way and the row keeps its height |
| Dark logo in dark mode | a transparent dark PNG | It stays visible on a light plate or an outline |
| Slow | an image delayed 3s by the mock | Its box holds its size until it loads |
| Broken | a URL that answers 404 | Its box keeps its size and the record's fallback shows |

## Responses

Slow and Failed run as data sets from step 2. Run the rest by changing one route handler at a time.

| Case | Value | Passes when |
| --- | --- | --- |
| Slow | every response held 3s | The loading state shows, then the data, with no layout jump |
| Never answers | a response that never settles | The wait ends in a failure instead of loading forever |
| Server error | every request answered with a 500 | The failed state shows in the region, with Retry |
| Expired session | a 401 on the next request | The user is asked to sign in again and their input survives |
| Field missing | one row with an optional field absent from the JSON | The row renders without `undefined` and the other rows are unaffected |
| An unknown status | `"status": "ARCHIVED"`, a value the enum does not list | It shows a neutral label, never a crash or a blank badge |

## Limits that disagree

A failure here is an `invariants` finding.

| Case | Value | Passes when |
| --- | --- | --- |
| A 50-character input over a 255-character column | a 255-character value written by an import or the API, opened in the edit form | The form shows all 255 characters and saves them back unchanged, or the limits match |
