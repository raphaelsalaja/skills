---
name: forms
description: Builds forms that label every field, ask for the right keyboard, take typed and pasted input, validate on submit and never ask twice.
---

# Forms

This skill holds how forms take input on every screen. It covers labels, keyboards, limits, choices, long flows, validation, saving and sign-in.

## Every field meets these values

Use the project's form components and tokens wherever they exist. Where none exists, the values here are exact. A field that rejects pasted input, a pre-checked consent box or an error tied to nothing is a finding in any style.

The required asterisk and the error summary at three errors are house defaults. A project with its own established pattern for either keeps it.

Wording belongs to `copy`. Focus rings, hit areas, busy buttons and live regions belong to `defaults`. A dialog holding a form belongs to `overlays`, and input kept after a failed submit to `states`.

## Labels sit above and share the hit area

Clicking a control's visible label works the control, and a placeholder never stands in for it. A checkbox whose text does nothing when clicked is `forms-label-hit-area`.

Labels in a column to the left of their fields are `forms-label-above`. Checkboxes, radios and switches keep their label beside the control.

A radio or checkbox group with no `fieldset` and `legend` is `forms-group-in-fieldset`.

By default a required field is marked on its own label, such as `Email *`, with the asterisk in `aria-hidden="true"`. The input carries native `required`, which screen readers announce, even under `novalidate`. `aria-required="true"` goes only on a custom control with no native input, never beside `required`. One note saying every field is required is `forms-mark-required`. Login forms are exempt.

## Rules sit between the label and the field

Password and format rules show before anyone types, in the order label, hint, input, tied by `aria-describedby`. Rules in a placeholder, a tooltip, the error after submit or below the field, where the keyboard covers them, are `forms-rules-before-input`.

A hint is one line of plain text, read out with its field, where a link cannot be followed. A hint holding a `Learn More` link is `forms-plain-hint`.

## Fields ask for the right keyboard

Every field sets `type`, `inputmode` and `autocomplete` with the standard tokens. `autocomplete="off"` on a field the browser could fill is `forms-input-types`.

Usernames, emails and codes set `autocapitalize="none"`, `autocorrect="off"` and `spellcheck="false"`. Amounts take `inputmode="decimal"` and the Enter key a label through `enterkeyhint`, such as `send` or `search`. A username underlined as a misspelling is `forms-keyboard-hints`.

A `type="number"` field is only for a count someone steps up or down. Scroll wheels change it, long values turn into exponents and typed letters vanish silently. A card number, code or ZIP in `type="number"` instead of `type="text" inputmode="numeric"` is `forms-no-number-type`.

On mobile, an input under 16px makes iOS zoom the page on focus, which is `forms-input-16px`.

One Full Name field replaces a title select and split names, unless the system truly stores the parts apart. That is `forms-name-field`.

## Fields take what people paste and type

Strip formatting in code. A phone field that rejects `+1 (555) 010-2030` is `forms-accept-messy-input`. Never block paste, and trim the trailing space some keyboards add.

`maxlength` silently cuts a paste short, so say "You can enter up to 200 characters" above the field, and past 75% show a live count, announced politely once typing pauses. Over the limit it reads "12 characters too many" and submit shows a field error. `maxlength="200"` on a bio is `forms-soft-limit`.

## Fields fit what they hold

A ZIP field stretched across the form instead of `width: 6ch` is `forms-field-fits-input`. Two columns of unrelated fields is `forms-one-column`.

Inputs, selects and buttons on one row share one height from the scale, such as 36px. A 38px input beside a 32px button is `forms-control-height`.

A textarea grows through `field-sizing: content`, between `min-block-size: 3lh` and `max-block-size: 10lh`. A `scrollHeight` handler on every keystroke is `forms-field-sizing`.

A prefix or suffix icon sits inside the field, cleared by `padding-inline-start` or `padding-inline-end`, at `pointer-events: none` when decorative. An icon beside the box that swallows the click is `forms-adornment-inside`.

A value the user can see but not change takes `readonly`, which stays focusable, copyable and submitted. `disabled` drops it from the tab order, the submission and contrast rules, so an account email in a `disabled` input is `forms-readonly-not-disabled`.

## Choices show their options

Two or three options are visible radios, and a `select` holding Yes and No is `forms-radio-over-select`. Options wrapped across a row, each label nearer the next box than its own, are `forms-stack-options`.

More than 15 options is a searchable combobox, and 15 or fewer stays a plain `select`. A country `select` of 200 names is `forms-search-long-lists`.

An unavailable option stays in place, disabled, so the others keep their positions. `options.filter(o => o.available)` is `forms-keep-disabled-options`.

A switch applies the moment it flips, so a switch that waits for Save is `forms-switch-applies-now`.

A native `<select>` sets `background-color` and `color` from role tokens, or some platforms open a white option list in a dark theme. A dark `<select>` with neither set is `forms-select-colors`.

A date field accepts typing with any separator and no leading zeros, and shows the month as a name, as in `11 Oct 2026`. A calendar suits only dates within about a year. A birth date picked by paging back 30 years is `forms-type-the-date`.

A drop zone wraps a real, labelled `<input type="file">` whose `accept` matches the types the hint names. Hide it visually if needed, never with `display: none`, which drops it from the tab order. A `div` that only takes dropped files is `forms-real-file-input`.

## Nothing moves or asks on its own

Focusing or changing a control never navigates, submits or opens a window. `<select onChange={e => router.push(e.target.value)}>` is `forms-no-change-on-input`.

Autofocus only a page's single primary field, and only under `(pointer: fine)`, so a touch screen never raises its keyboard on load. `autofocus` on a phone's sign-up form is `forms-no-touch-autofocus`.

A pre-checked opt-in, data share or paid add-on is `forms-consent-unchecked`. A billing step that makes the user retype the shipping address is `forms-never-ask-twice`.

## Long flows ask one thing at a time

A long unfamiliar flow opening on ten questions, rather than one per page with its label as the `h1`, is `forms-one-question-per-page`.

A stepped flow ends on one review page before submit. A skipped optional answer there reads "Not Provided", where `states` leaves an empty detail line out. Each row's Change link names its field in hidden text and returns to the review. Submitting with no review is `forms-check-answers`.

## Enter submits

Enter submits from a one-field form or the last field, and ⌘ or Ctrl with Enter from a textarea. A search field that needs a click is `forms-enter-submits`.

A custom Enter handler returns early when `e.isComposing` is true or `e.keyCode` is `229`, then calls `form.requestSubmit()`. Sending a half-composed word is `forms-ime-safe-enter`.

A `button` in a form defaults to `type="submit"`, and Enter in any field clicks the first one. `<button onClick={addRow}>` with no `type="button"` is `forms-button-type`.

## Forms validate on submit

Submit stays enabled until the request starts. On submit, each error shows beside its field, and with one or two errors the first invalid field takes focus. A submit disabled until the form is valid is `forms-validate-on-submit`.

A form that shows its own errors sets `novalidate` and keeps `required`, `type` and `pattern`, because a submit attempt still flags each field for `:user-invalid`. Submit through a button or `form.requestSubmit()`, since `form.submit()` skips that step. Browser bubbles over the form's own errors are `forms-novalidate`.

By default, three or more errors raise a summary at the top, headed "There Is a Problem", at `tabindex="-1"` and focused. Each link matches its inline error word for word. Five errors with no summary is `forms-error-summary`.

A failed submit prefixes the title with "Error: " until the errors are fixed, and an unchanged title is `forms-error-title`. An error not tied by `aria-invalid="true"` and `aria-describedby` is `forms-errors-tied-to-field`.

Reserve the line an error takes, so the submit button stays under the pointer. A button pushed down by an error message is `forms-error-holds-layout`.

When the likely correction is known, offer it as one button, such as "Did you mean gmail.com?" under `gmial.com`, or the city from a ZIP code. An error that leaves a known fix to the keyboard is `forms-offer-the-fix`.

Errors first appear on submit. From then on each field re-checks on every input, dropping its message the moment the value passes and showing one again if it breaks. An error left on a fixed field is `forms-clear-errors-live`.

Error styles follow the same order. `:user-invalid` alone turns a field red on blur before any submit, so scope it as `form[data-submitted] :user-invalid`, with the attribute set in the submit handler. `:invalid` at load, or red before the first submit, is `forms-user-invalid`.

A server check silent past 1s, with no progress indicator inside the field, is `forms-validating-indicator`.

## Submit stands alone

A Reset or Clear Form button beside Submit is `forms-no-reset-button`. A Save button per section, or one on a page that autosaves, is `forms-one-save`.

A form with unsaved changes asks before leaving, through `beforeunload` and a router guard. A draft lost to one Back click is `forms-guard-unsaved`.

## Sign-in never needs recall

Sign-in never blocks paste or password managers. Split code boxes take a full pasted code with `autocomplete="one-time-code"`, and a puzzle CAPTCHA offers a passkey or email link instead. A code box taking one digit from a paste is `forms-login-without-recall`.

A password field rendered with a value instead of `autocomplete="current-password"`, or `new-password` on sign-up, is `forms-no-prefilled-password`.

A password field has a Show button, `type="button"` with `aria-controls`, switching between `password` and `text`. It reverts to `password` on submit, so the browser never saves it as plain autofill. A missing Show button, or a Confirm Password field, is `forms-show-password`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `forms-label-hit-area` | A checkbox beside a bare `span` | The checkbox and its text inside one `label` | `MEDIUM` |
| `forms-label-above` | Labels in a left column, fields in a right column | Each label above its field, on the same left edge | `LOW` |
| `forms-group-in-fieldset` | Radios under `<div class="bold">Plan</div>` | `<fieldset><legend>Plan</legend>` around the radios | `MEDIUM` |
| `forms-mark-required` | "All fields are required", or `aria-required` beside `required` | `Email *` with the asterisk `aria-hidden`, native `required` on the input | `MEDIUM` |
| `forms-rules-before-input` | `placeholder="8+ characters, one number"` | Label, rules, then field, tied by `aria-describedby` | `MEDIUM` |
| `forms-plain-hint` | A hint ending in a `Learn More` link | "Used for receipts", the link in the page above | `LOW` |
| `forms-input-types` | `<input type="text">` for an email | `type="email" autocomplete="email"` | `MEDIUM` |
| `forms-keyboard-hints` | A username field that capitalises its first letter | `autocapitalize="none" autocorrect="off" spellcheck="false"` | `LOW` |
| `forms-no-number-type` | `<input type="number">` for a card number | `type="text" inputmode="numeric" autocomplete="cc-number"` | `MEDIUM` |
| `forms-input-16px` | `font-size: 14px` on a mobile input | `font-size: 16px` | `MEDIUM` |
| `forms-name-field` | A title select, then First Name and Last Name | One `Full Name` field with `autocomplete="name" spellcheck="false"` | `LOW` |
| `forms-accept-messy-input` | A phone field that rejects `+1 (555) 010-2030` | Stored as `+15550102030`, shown formatted | `HIGH` |
| `forms-soft-limit` | `maxlength="200"` cutting a pasted bio short | "You can enter up to 200 characters", a count past 150, an error on submit | `HIGH` |
| `forms-field-fits-input` | A ZIP field at `width: 100%` | `width: 6ch` | `LOW` |
| `forms-one-column` | Two columns of unrelated fields | One column, with City, State and ZIP on one row | `LOW` |
| `forms-control-height` | `height: 38px` on an input beside a 32px button | `height: var(--control-height)`, 36px on both | `LOW` |
| `forms-field-sizing` | `el.style.height = el.scrollHeight + "px"` on input | `field-sizing: content; min-block-size: 3lh; max-block-size: 10lh` | `LOW` |
| `forms-adornment-inside` | A search icon beside the input that swallows the click | The icon inside at `pointer-events: none`, the input padded | `LOW` |
| `forms-readonly-not-disabled` | `<input disabled value={user.email}>` | `<input readonly value={user.email}>` | `MEDIUM` |
| `forms-radio-over-select` | A `select` holding Yes and No | Two radios | `MEDIUM` |
| `forms-stack-options` | Plan radios wrapping across one row | One radio per line inside the `fieldset` | `LOW` |
| `forms-search-long-lists` | A `select` of 200 countries | A combobox that filters as the user types | `MEDIUM` |
| `forms-keep-disabled-options` | `options.filter(o => o.available)` | Every option rendered, the unavailable ones `disabled` | `MEDIUM` |
| `forms-switch-applies-now` | A switch inside a form that waits for Save | A checkbox in the form, or a switch that saves at once | `MEDIUM` |
| `forms-select-colors` | A dark-themed `<select>` opening a white list | `select { background-color: var(--surface); color: var(--text-primary) }` | `MEDIUM` |
| `forms-type-the-date` | A calendar paged back 30 years for a birth date | A typed field reading `11 Oct 2026` | `MEDIUM` |
| `forms-real-file-input` | A `div` that only handles `onDrop` | A drop zone wrapping a labelled `<input type="file" accept=".csv">` | `HIGH` |
| `forms-no-change-on-input` | `<select onChange={e => router.push(e.target.value)}>` | Links, or a `select` with a `Go` button | `HIGH` |
| `forms-no-touch-autofocus` | `autofocus` on the first field of a sign-up form on a phone | `if (matchMedia("(pointer: fine)").matches) query.focus()` | `MEDIUM` |
| `forms-consent-unchecked` | `<input type="checkbox" name="offers" defaultChecked>` | The same checkbox, unchecked | `HIGH` |
| `forms-never-ask-twice` | Empty billing fields after shipping | `Same as Shipping`, checked | `MEDIUM` |
| `forms-one-question-per-page` | Ten unrelated questions on an application's first page | One question per page, its label as the `h1` | `LOW` |
| `forms-check-answers` | A last step that submits with no review | A review page, each row with `Change<span class="visually-hidden"> Email</span>` | `MEDIUM` |
| `forms-enter-submits` | A search field with no `form` around it | A `form` whose `onSubmit` runs the search | `MEDIUM` |
| `forms-ime-safe-enter` | `if (e.key === "Enter") send()` | `if (e.key === "Enter" && !e.isComposing && e.keyCode !== 229) form.requestSubmit()` | `HIGH` |
| `forms-button-type` | `<button onClick={addRow}>` inside a form | `<button type="button" onClick={addRow}>` | `HIGH` |
| `forms-validate-on-submit` | `disabled={!isValid}` on submit | Enabled, with errors shown on submit and the first invalid field focused | `HIGH` |
| `forms-novalidate` | Browser bubbles over the form's own errors | `<form noValidate>`, with `required` kept on the fields | `LOW` |
| `forms-error-summary` | Five inline errors and focus left on Submit | "There Is a Problem" at the top, focused, linking each error to its field | `MEDIUM` |
| `forms-error-title` | `<title>Your Details</title>` after a failed submit | `<title>Error: Your Details</title>` until the errors are fixed | `MEDIUM` |
| `forms-errors-tied-to-field` | `<p class="error">` beside a field with no link | `aria-invalid="true" aria-describedby="email-error"` on the field | `HIGH` |
| `forms-error-holds-layout` | The submit button pushed down by an error line | The error's line reserved below the field | `MEDIUM` |
| `forms-offer-the-fix` | "Check the email domain" under `gmial.com` | "Did you mean gmail.com?" with the domain as a button | `LOW` |
| `forms-clear-errors-live` | An email error still showing after a valid email is typed | The error removed on the input that made it valid | `MEDIUM` |
| `forms-user-invalid` | `input:invalid`, or `:user-invalid` red before any submit | `form[data-submitted] :user-invalid { border-color: red }` | `MEDIUM` |
| `forms-validating-indicator` | A username field silent while availability is checked | A progress indicator inside the field after 1s | `LOW` |
| `forms-no-reset-button` | `Clear Form` beside `Submit` | `Submit` alone | `MEDIUM` |
| `forms-one-save` | A `Save` under every section | One `Save`, or none where it autosaves | `MEDIUM` |
| `forms-guard-unsaved` | A typed draft lost to one Back click | `beforeunload` and a router guard while the form is dirty | `HIGH` |
| `forms-login-without-recall` | `onPaste={e => e.preventDefault()}` on a code box | One `autocomplete="one-time-code"` field that takes the pasted code | `HIGH` |
| `forms-no-prefilled-password` | `<input type="password" value={savedPassword}>` | An empty field with `autocomplete="current-password"` | `HIGH` |
| `forms-show-password` | `Password` and `Confirm Password` fields | One field with a `Show` button that switches its `type` | `MEDIUM` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a file you did not read. Fill and submit the form when a check depends on behaviour, and mark every check you could not run as `Not verified`.
