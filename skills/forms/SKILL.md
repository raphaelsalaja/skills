---
name: forms
description: Builds forms that label every field, ask for the right keyboard, take typed and pasted input, validate on submit and never ask twice.
---

# Forms

This skill holds how forms take input on every screen. It covers labels, keyboards, field sizes, limits, choices, dates, uploads, long flows, validation, Enter, saving, consent and sign-in.

## Every field meets these values

Use the project's form components and tokens wherever they exist. Where none exists, the attributes and values here are exact. A field that rejects pasted input, a pre-checked consent box or an error tied to nothing is a finding in any style.

Label, hint and error wording belongs to `copy`. Focus rings, hit areas, busy buttons and live regions belong to `defaults`. A dialog that holds a form belongs to `overlays`. Keeping input after a failed submit belongs to `states`. Building fields with the project's primitive belongs to `reuse`.

## Labels share the hit area

Every control has a visible label outside the field, never a placeholder alone, and clicking the label works the control. A checkbox whose text does nothing when clicked is `forms-label-hit-area`.

A label sits above its field and starts on the same left edge, so one glance takes in both. Checkboxes, radios and switches keep their label beside the control. Labels in a column to the left of their fields are `forms-label-above`.

A group of radios or checkboxes sits in a `fieldset` whose `legend` asks the question. Radios under a bold `div` with no `legend` is `forms-group-in-fieldset`.

## Required fields are marked where they are

Each required field is marked on its own label, such as `Email *`, and sets `aria-required="true"`. One note at the top saying every field is required is `forms-mark-required`. Login forms are exempt.

## Rules sit between the label and the field

Password and format rules show before anyone types, in the order label, hint, then input, and the field points at them with `aria-describedby`. Rules left in a placeholder, a tooltip or the error after submit, or set below the field where the keyboard or an error covers them, are `forms-rules-before-input`.

A hint between a label and its field is one short line of plain text, read out with its field, where a link inside cannot be followed. Links and longer explanations go in the page above the field. A hint holding a `Learn More` link is `forms-plain-hint`.

## Fields ask for the right keyboard

Every field sets `type`, `inputmode` and `autocomplete`, so the keyboard and autofill fit it. Use the standard tokens, such as `email`, `tel`, `username`, `street-address`, `postal-code`, `cc-number`, `cc-exp` and `cc-csc`. An email field typed as plain text, or `autocomplete="off"` on a field the browser could fill, is `forms-input-types`.

Usernames, emails, codes and identifiers set `autocapitalize="none"`, `autocorrect="off"` and `spellcheck="false"`, so nothing rewrites or underlines them. Codes take `inputmode="numeric"`, amounts `inputmode="decimal"` and the Enter key a label through `enterkeyhint`, such as `send`, `search` or `done`. An email field that capitalises its first letter, or a username underlined as a misspelling, is `forms-keyboard-hints`.

A `type="number"` field is only for a count someone might step up or down, such as guests or seats. Arrow keys and scroll wheels change its value, and long values round or turn into exponents. Typed letters vanish without a word. Card numbers, codes, ZIP codes and account numbers take `type="text" inputmode="numeric"`. A card number in `type="number"` is `forms-no-number-type`.

On mobile, inputs render at 16px or larger, or iOS zooms the page on focus. A 14px input on a phone is `forms-input-16px`.

## A name is one field

Ask for a name in one Full Name field with `autocomplete="name"` and `spellcheck="false"`, and no title select. Split First Name and Last Name only when the system truly stores the parts apart. Split name fields under a Mr, Mrs and Ms select is `forms-name-field`.

## Fields accept what people paste

A field takes input the way people type or paste it, such as spaces in a card number or brackets in a phone number. Strip the formatting in code and show the value cleanly. A phone field that rejects `+1 (555) 010-2030` is `forms-accept-messy-input`. Never block paste, and trim the trailing space some keyboards add.

## Limits never block typing

Never set `maxlength`, which blocks typing and silently cuts a paste short. Between the label and the field say "You can enter up to 200 characters", and past 75% show a live count, announced politely once typing pauses. Over the limit, the count reads "12 characters too many". Submitting then shows a field error, worded as `copy` sets out. A limit people keep hitting gets raised. `maxlength="200"` on a bio is `forms-soft-limit`.

## Fields fit what they hold

A field's width matches the input it expects, such as `width: 6ch` on a ZIP code. A ZIP field stretched across the form is `forms-field-fits-input`.

Forms run in one column. Short related fields, such as City, State and ZIP, may share a row. Two columns of unrelated fields is `forms-one-column`.

Inputs, selects and buttons on one row share one height from the scale, such as 36px, so the row lines up. A 38px input beside a 32px button is `forms-control-height`.

A textarea grows with its text through `field-sizing: content`, between `min-block-size: 3lh` and `max-block-size: 10lh`. A `scrollHeight` handler resizing it on every keystroke is `forms-field-sizing`.

## Icons sit inside the field

A prefix or suffix icon sits inside the field, absolutely positioned, with `padding-inline-start` or `padding-inline-end` on the input clearing it. A decorative icon takes `pointer-events: none`, so a click on it focuses the input. A search icon beside the box that swallows the click is `forms-adornment-inside`.

## Locked values stay readable

A value the user can see but not change, such as an account ID, takes `readonly`. It stays focusable, copyable and submitted with the form. The `disabled` attribute drops it from the tab order and the submission, and contrast rules stop covering it. An account email shown in a `disabled` input is `forms-readonly-not-disabled`.

## Choices show their options

Two or three options are radios, all visible at once, not a `select`. Familiar values such as a birth date or a quantity are typed. A `select` holding Yes and No is `forms-radio-over-select`.

Radio and checkbox groups stack one option per line. A group wrapped across a horizontal row, where each label sits nearer the next box than its own, is `forms-stack-options`.

A choice of more than 15 options is a searchable combobox, and one of 15 or fewer stays a plain `select`. Four or five exclusive options may show as radios too. A country `select` scrolled through 200 names is `forms-search-long-lists`.

An unavailable option stays in place, disabled, so the others keep their positions. `options.filter(o => o.available)` is `forms-keep-disabled-options`.

A switch takes effect the moment it flips. Inside a form with a Submit button, use a checkbox. A switch that waits for Save is `forms-switch-applies-now`.

A native `<select>` sets `background-color` and `color` from role tokens, so a dark theme never opens a white option list on some platforms. A dark-themed `<select>` with neither set is `forms-select-colors`.

## Dates are typed

A date field accepts typing with any separator and without leading zeros, and shows the month as a name, such as 11 Oct 2026. A calendar suits only dates within about a year, and impossible dates are disabled. A birth date picked by paging back 30 years is `forms-type-the-date`.

## Uploads use a real file input

A drop zone wraps a real `<input type="file">` with a visible label, so a click, Enter or Space opens the picker. Hide the input visually if needed, never with `display: none`, which takes it out of the tab order. The hint above it names the types and the size limit, and `accept` matches them, such as `accept=".csv,.ods"`. A `div` that only takes dropped files is `forms-real-file-input`.

## Changing a field never moves the page

Focusing or changing a control never navigates, submits or opens a window. Use links, or a `select` with a Go button. `<select onChange={e => router.push(e.target.value)}>` is `forms-no-change-on-input`.

## Autofocus never raises the keyboard

Autofocus only a page's single primary field, such as the query on a search page, and only under `(pointer: fine)`. A touch screen never opens its on-screen keyboard on load. `autofocus` on a phone's sign-up form is `forms-no-touch-autofocus`.

## Consent starts unchecked

Marketing opt-ins, data sharing and paid add-ons start unchecked, so the user chooses them. A pre-checked "Email Me Offers" box is `forms-consent-unchecked`.

## Nothing is asked twice

A flow never asks again for something the user already gave. Fill it in, or offer a Same as Shipping checkbox. A billing step that makes the user retype the shipping address is `forms-never-ask-twice`.

## Long flows ask one thing at a time

A long or unfamiliar flow starts with one question per page, and the label or `legend` is the page's `h1`. Ten unrelated questions on an application's first page is `forms-one-question-per-page`.

A flow of several steps ends on one review page before submit, where a skipped optional answer reads "Not Provided". Each row has a Change link whose hidden text names the field, and the edit returns to the review page. A last step that submits with no review is `forms-check-answers`.

## Enter submits

Enter submits a form with one field, or from the form's last field. In a textarea, Enter adds a line and ⌘ or Ctrl with Enter submits. A search field that needs a click to submit is `forms-enter-submits`.

A custom Enter handler returns early when `e.isComposing` is true or `e.keyCode` is `229`, then calls `form.requestSubmit()`. Sending a half-composed word on Enter is `forms-ime-safe-enter`.

A `button` inside a form defaults to `type="submit"`. Every button there that does not submit sets `type="button"`, or a click on Add Row sends the form. If that button comes before Submit, Enter in any field clicks it instead. `<button onClick={addRow}>` inside a form is `forms-button-type`.

## Forms validate on submit

Submit stays enabled until the request starts, then turns busy as `defaults` sets out. On submit, show each error beside its field, and with one or two errors focus the first invalid field. A submit button disabled until the form is valid is `forms-validate-on-submit`.

A form that shows its own errors sets `novalidate`, so the browser's bubbles never appear beside them. Keep `required`, `type` and `pattern` on the fields, because a submit attempt still flags each one for `:user-invalid`. Submit through a button or `form.requestSubmit()`, since `form.submit()` skips that step. Browser bubbles over the form's own errors are `forms-novalidate`.

With three or more errors, a summary at the top of the form, headed "There Is a Problem" and set to `tabindex="-1"`, takes focus. It links each error to its field, each link worded exactly like the inline error. Five errors with no summary, or links worded apart from their errors, is `forms-error-summary`.

A failed submit prefixes the page title with "Error: ", as in `<title>Error: Your Details</title>`, and drops the prefix once the errors are fixed. A title unchanged after a failed submit is `forms-error-title`.

Each error sets `aria-invalid="true"` on its field and is linked by `aria-describedby`, so the field reads its error on focus. An error paragraph tied to nothing is `forms-errors-tied-to-field`.

Once an error shows, its field re-checks on every input and drops the message the moment the value passes. A field with no error showing waits for submit. An error left on a fixed field until the next submit is `forms-clear-errors-live`.

Error styles use `:user-invalid`, which waits until the user has interacted. `:invalid`, red across an untouched form at page load, is `forms-user-invalid`.

A check that waits on the server, such as username availability, shows a progress indicator inside the field once it runs past 1s. A field that sits silent while it checks is `forms-validating-indicator`.

## Submit stands alone

A form has no Reset or Clear Form button beside Submit, where one slip erases everything. A Clear button beside Submit is `forms-no-reset-button`.

A form has one Save button, never one per section, and a page that autosaves has none. Three Save buttons down one settings page is `forms-one-save`.

## Leaving a changed form asks first

While a form holds unsaved changes, leaving asks first, through `beforeunload` for a closing tab and a router guard for a route change. A clean form leaves without asking. A typed draft lost to one Back click is `forms-guard-unsaved`.

## Sign-in never needs recall

Sign-in never blocks paste or password managers. Split one-time-code boxes accept a full pasted code and set `autocomplete="one-time-code"`, and a puzzle CAPTCHA offers a passkey or an email link instead. A code box that takes one digit from a paste is `forms-login-without-recall`.

A password field is never prefilled by the app, and sets `autocomplete="current-password"`, or `new-password` on sign-up. A password field rendered with a value is `forms-no-prefilled-password`.

A password field has a Show button, a `type="button"` with `aria-controls` that switches the field between `password` and `text`. It switches back to `password` on submit, so the browser never saves it as an ordinary autofill value. With Show in place, no Confirm Password field is needed. A password with no Show button, or a second field to retype it, is `forms-show-password`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `forms-label-hit-area` | A checkbox beside a bare `span` | The checkbox and its text inside one `label` |
| `forms-label-above` | Labels in a left column, fields in a right column | Each label above its field, on the same left edge |
| `forms-group-in-fieldset` | Radios under `<div class="bold">Plan</div>` | `<fieldset><legend>Plan</legend>` around the radios |
| `forms-mark-required` | "All fields are required" above the form | `Email *` on the label with `aria-required="true"` |
| `forms-rules-before-input` | `placeholder="8+ characters, one number"`, or the rules below the field | Label, then the rules as text, then the field, tied by `aria-describedby="password-hint"` |
| `forms-plain-hint` | A hint reading "Used for receipts. `Learn More` about how we store it." | "Used for receipts" between the label and the field, the link in the page above |
| `forms-input-types` | `<input type="text">` for an email | `type="email" autocomplete="email"` |
| `forms-keyboard-hints` | A username field that capitalises its first letter | `autocapitalize="none" autocorrect="off" spellcheck="false"` |
| `forms-no-number-type` | `<input type="number">` for a card number | `type="text" inputmode="numeric" autocomplete="cc-number"` |
| `forms-input-16px` | `font-size: 14px` on a mobile input | `font-size: 16px` |
| `forms-name-field` | A title select, then First Name and Last Name | One `Full Name` field with `autocomplete="name" spellcheck="false"` |
| `forms-accept-messy-input` | A phone field that rejects `+1 (555) 010-2030` | Accepted, stored as `+15550102030` and shown formatted |
| `forms-soft-limit` | `maxlength="200"` cutting a pasted bio short | "You can enter up to 200 characters", a count past 150 that reads "12 characters too many" once over, then an error on submit |
| `forms-field-fits-input` | A ZIP field at `width: 100%` | `width: 6ch` |
| `forms-one-column` | Two columns of unrelated fields | One column, with City, State and ZIP on one row |
| `forms-control-height` | `height: 38px` on an input beside a 32px button | `height: var(--control-height)`, 36px on both |
| `forms-field-sizing` | `el.style.height = el.scrollHeight + "px"` on input | `field-sizing: content; min-block-size: 3lh; max-block-size: 10lh` |
| `forms-adornment-inside` | A search icon beside the input that swallows the click | The icon inside at `pointer-events: none`, the input padded with `padding-inline-start` |
| `forms-readonly-not-disabled` | `<input disabled value={user.email}>` | `<input readonly value={user.email}>` |
| `forms-radio-over-select` | A `select` holding Yes and No | Two radios |
| `forms-stack-options` | Plan radios wrapping across one row | One radio per line inside the `fieldset` |
| `forms-search-long-lists` | A `select` of 200 countries | A combobox that filters as the user types |
| `forms-keep-disabled-options` | `options.filter(o => o.available)` | Every option rendered, the unavailable ones `disabled` |
| `forms-switch-applies-now` | A switch inside a form that waits for Save | A checkbox in the form, or a switch that saves at once |
| `forms-select-colors` | A dark-themed `<select>` opening a white list | `select { background-color: var(--surface); color: var(--text-primary) }` |
| `forms-type-the-date` | A calendar paged back 30 years for a birth date | A typed field reading `11 Oct 2026` |
| `forms-real-file-input` | A `div` that only handles `onDrop` | A drop zone wrapping a labelled `<input type="file" accept=".csv">` |
| `forms-no-change-on-input` | `<select onChange={e => router.push(e.target.value)}>` | Links, or a `select` with a `Go` button |
| `forms-no-touch-autofocus` | `autofocus` on the first field of a sign-up form on a phone | `if (matchMedia("(pointer: fine)").matches) query.focus()` on a search page |
| `forms-consent-unchecked` | `<input type="checkbox" name="offers" defaultChecked>` | The same checkbox, unchecked |
| `forms-never-ask-twice` | Empty billing address fields after shipping | `Same as Shipping`, checked, with the address filled in |
| `forms-one-question-per-page` | Ten unrelated questions on an application's first page | One question per page, its label as the `h1` |
| `forms-check-answers` | A last step that submits with no review | A review page of rows, each with `Change<span class="visually-hidden"> Email</span>` |
| `forms-enter-submits` | A search field with no `form` around it | A `form` whose `onSubmit` runs the search |
| `forms-ime-safe-enter` | `if (e.key === "Enter") send()` | `if (e.key === "Enter" && !e.isComposing && e.keyCode !== 229) form.requestSubmit()` |
| `forms-button-type` | `<button onClick={addRow}>` inside a form | `<button type="button" onClick={addRow}>` |
| `forms-validate-on-submit` | `disabled={!isValid}` on submit | Enabled, with errors shown on submit and the first invalid field focused |
| `forms-novalidate` | Browser bubbles over the form's own errors | `<form noValidate>`, with `required` kept on the fields |
| `forms-error-summary` | Five inline errors and focus left on Submit | "There Is a Problem" at the top, focused, linking each error to its field |
| `forms-error-title` | `<title>Your Details</title>` after a failed submit | `<title>Error: Your Details</title>` until the errors are fixed |
| `forms-errors-tied-to-field` | `<p class="error">` beside a field with no link | `aria-invalid="true" aria-describedby="email-error"` on the field |
| `forms-clear-errors-live` | "Enter an email address like name@example.com" still showing after a valid email is typed | The error removed on the input event that made the value valid |
| `forms-user-invalid` | `input:invalid { border-color: red }` | `input:user-invalid { border-color: red }` |
| `forms-validating-indicator` | A username field silent while availability is checked | A progress indicator inside the field after 1s |
| `forms-no-reset-button` | `Clear Form` beside `Submit` | `Submit` alone |
| `forms-one-save` | A `Save` button under every section of one settings page | One `Save` for the form, or none where it autosaves |
| `forms-guard-unsaved` | A typed draft lost to one Back click | `beforeunload` and a router guard while the form is dirty |
| `forms-login-without-recall` | `onPaste={e => e.preventDefault()}` on a code box | One `autocomplete="one-time-code"` field that takes the pasted code |
| `forms-no-prefilled-password` | `<input type="password" value={savedPassword}>` | An empty field with `autocomplete="current-password"` |
| `forms-show-password` | `Password` and `Confirm Password` fields | One field with a `Show` button that switches its `type` |

## Reporting

**Severity.** `HIGH` breaks use, access or the user's input. That is a field that rejects pasted formatting, a submit disabled until valid or a consent box that starts checked. It is also an Enter handler that fires mid-composition, a control that navigates on change, an error tied to nothing or a password the app prefilled. It is also sign-in that blocks paste or password managers, or that offers only a puzzle. It is also `maxlength` cutting a paste short, or a changed form that leaves without asking. It is also a button that submits the form by accident, or an upload only a mouse can reach.

`MEDIUM` is a field with the wrong keyboard, a mobile input under 16px, a dead label or a group with no `legend`. It is also Enter that does not submit, an unmarked required field or error styles on an untouched form. It is also rules hidden until the error or set below their field. It is also a flow that asks twice, a switch that waits for Save, a `select` for two options, options that vanish or a date that cannot be typed. It is also a `select` of more than 15 options with no search. It is also a Reset button beside Submit. It is also three or more errors with no summary, a title with no error prefix, a stepped flow with no review page or a Save button per section. It is also a keyboard raised on load or a dark theme opening a white option list. It is also a card number in a number field, a locked value in a `disabled` input or an error that outlives its fix. It is also a password with no Show button, or a Confirm Password field.

`LOW` is a missing keyboard hint, a field far wider than its input, unrelated fields in two columns or a textarea resized by script. It is also a link inside a hint, split name fields, an icon beside its field or a server check with no indicator. It is also a long unfamiliar flow that opens on many questions at once. It is also controls of mixed heights on one row, or options wrapped across a row. It is also labels set to the left of their fields, or browser bubbles beside the form's own errors.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a file you did not read. Fill and submit the form when a check depends on behaviour, and mark every check you could not run as `Not verified`.
