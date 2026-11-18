# Brio ACP — application design and workflow audit

18 November 2026 · Workspace: `C:/Users/AbdulHaqAdiy/Desktop/ACP` · Preview: `http://localhost:8443/`

## Assessment

The application has a coherent visual foundation: restrained yellow actions, Inter typography, shared tables, customer context, explicit status labels and a useful assignment review. The largest opportunity is completing and safeguarding workflows, followed by responsive controls and accessible editor interactions. A visual redesign is not the first priority.

**45 findings: 8 High, 28 Medium, 9 Low.** No Critical issue was established. Counts include confirmed behavior, source findings and labeled recommendations; they are not a defect count or usability score. Severity describes user impact in this prototype, not a claim about a deployed production service.

## Scope and evidence

This audit covers this workspace. The existing Chrome ACP tab pointed to an ngrok-hosted application with extra Forwarding, Vacation and Domains tools. Those screens are absent from this workspace and **were not audited**. Findings must not be transferred to that other implementation without verification.

- **UI + source:** inspected in the preview and traced to implementation.
- **UI:** observed in the browser's current persisted demo state; may differ from fresh seed data.
- **Source:** implementation reviewed; its acceptance check was not necessarily executed.
- **Recommendation:** a task-based improvement hypothesis, not a proven defect or confirmed business requirement.

Read all application pages, shared workflow components, state/data helpers, CSV parsing, global styling and package/build configuration. Runtime inspection covered customers, active/pending overview, directory, template list, creation validation, Font/Escape behavior, assignment selection/review/back, scheduled setup, delegate owner/add dialog, history expansion and onboarding dialog.

Desktop screenshots were inspected at available 1101px/1280px widths; assignment was checked at 375×812 and review at 768×1024. This is not a complete viewport matrix for every screen.

Sign-in, save/delete commits, batch execution/failure, delegate mutations, CSV upload/download contents and persistence exceptions were source-reviewed, not executed end to end. No credential file was submitted, no customer/template/delegation records were created or deleted, and no Gmail changes or email notifications were performed. Temporary form/selection state was discarded and the preview returned to Customers.

## Verification

- `npm run build` — passed. Vite 8.0.5 completed successfully; Node emitted a module.register deprecation warning.
- `npx tsc --noEmit` — passed with no TypeScript errors.
- No test or lint script is defined in package.json.
- No automated accessibility scan, screen-reader session, contrast sweep, real authentication/API authorization, network-failure suite or cross-browser suite was run.
- Application source was not changed. Existing working-tree changes were preserved; audit files are separate deliverables.

## Screen-by-screen coverage

### Sign in

Source-reviewed credentials, show/hide password, demo-fill, busy and error states. Improve announced validation and access support (ACP-06–07). Real authentication and recovery ownership are unverified.

### Customers

Inspected dense desktop table, actions, search/status/plan controls, pagination, long values and Auto sizing. Improve sorting/findability, filter application, Auto sizing and zero/unavailable semantics (ACP-08–11).

### Add customer

Inspected instructions, scopes, upload/admin/display-name fields and scrolling. Source-reviewed local key validation and pending outcome. Finish setup/retry, provide sample onboarding without a real key and improve copying setup values (ACP-12–14). Connected API permission correctness was not assessed.

### Customer overview

Inspected active and pending metadata/tab context; source-reviewed error banner. Improve repair actions, metadata density and the source/editing of branding data (ACP-12,15–16). Pending customers cannot become ready through this UI.

### Directory

Inspected rows, status and filters; reviewed shared pagination and selection. Make signature-relevant user details discoverable (ACP-17), alongside shared mobile/filter improvements. Whether profiles are edited here or elsewhere is a product decision.

### Signature template list and deletion

Inspected library/actions; source-reviewed delete confirmation and persistence. The confirmation already explains that historical assignments remain. Improve template identification and save/assignment lifecycle (ACP-18–21).

### Template creation/editing and preview

Inspected variables, visual/HTML modes, preview, validation and footer. Reviewed command/selection restoration and media insertion. Improve HTML safety, popovers, toolbar state, media validation and fallbacks (ACP-22–26). Browser preview does not certify real email-client rendering fidelity.

### Notification defaults

Inspected field structure; source-reviewed autocomplete, keyboard behavior, freeform addresses, duplicates, chips and timing. Prevent silently omitted typed addresses and expose actual destinations (ACP-27–28). Current sample groups and unavailable email delivery are labeled.

### Assignment and CSV

Inspected direct entry, template choice, selection, Back preservation, review and scheduled controls. Source-reviewed all/matching selection, parser/report and import lifecycle. Improve scheduling availability, import gating, hidden selections and error correction/undo (ACP-29–32). Preserve existing quoting, BOM, duplicate, unknown and ineligible handling.

### Review and preflight

Inspected summary, overwrite warning and preview. Source-reviewed readiness, suspended recipients, length, missing/unknown fields and image checks. Improve image parsing (ACP-33). Keep explicit local-demo disclosure and overwrite warnings.

### Batch progress/results

Source-reviewed simulated processing, commit, counts, close gating and History navigation. Improve partial-failure outcomes, accessible progress and exception recovery (ACP-34–35). Execution states were not runtime-tested.

### Delegates

Inspected owner select, disabled add and eligible-user modal. Source-reviewed active/self/already-assigned exclusions, additions, removal confirmation and logs. Improve new-record status, owner search/overview and eligible-set labels/filters (ACP-36–38). Permission scope, cross-domain eligibility, limits and propagation rules remain unverified.

### History, export and retry

Inspected summary and expanded mixed-result batch. Source-reviewed search/filters, result pagination, export and retry. Improve immutable retry content with preflight, timestamp clarity and sample provenance (ACP-39–41). Real retry idempotency and spreadsheet export safety need integration-specific verification; no exploit or CSV round trip was tested.

### Shell, help, profile and shared details

Reviewed sidebar/mobile sheet, profile/logout, issue-report download, toasts and sticky footers. Help accurately says it downloads a file for the user to share. Improve URL/draft/focus/storage safeguards, mobile filters, hit areas, field descriptions and primitive consistency (ACP-01–05,42–45).

## Process audit

1. **Onboard:** add → local validation → pending → **dead end**. No verify/reconfigure/retry path (ACP-12). Explain local key handling before upload (ACP-13).
2. **Create template:** details → design/preview → notification defaults → save. Overlength content can be saved (ACP-18), Next commits implicitly (ACP-19), and navigation can discard drafts (ACP-02).
3. **Assign existing template:** opens at Step 2 → recipients → review → simulated results → history. Selection/review were exercised; execution was source-reviewed. Clarify progress and gate imports (ACP-20,30).
4. **Schedule:** dates/time → review → **disabled completion**. No schedule creation/list/edit/cancel lifecycle (ACP-29).
5. **Correct CSV:** upload → parse → immediate selection replacement → abbreviated exception report. Add complete rejected-row detail and undo; prevent advancing during import (ACP-30,32).
6. **Delegate access:** choose owner → inspect → eligible selection → local add; removal has confirmation. Add status and scalable lookup (ACP-36–38). Mutations were not submitted.
7. **Recover failures:** history → retry → immediate simulation using current template. Add immutable version choice, current checks and parent-run trace (ACP-39).
8. **Report a problem:** Help → describe → download → user shares. Coherent for a demo; confirm the real support destination before adding a send action.

## Implementation order

**First, the eight High findings:** safe HTML (ACP-22), setup completion (ACP-12), scheduling dead end (ACP-29), draft protection (ACP-02), CSV race (ACP-30), retry correctness (ACP-39), mobile filters (ACP-42) and URL navigation (ACP-01).

**Next:** persistence recovery, route focus/validation, editor overlays/media, length checks, hidden selections, CSV exceptions, batch failure recovery and delegate status. Add focused regression checks for risky state transitions.

**Then:** operational findability, compact metadata, timestamp/destination clarity and remaining token/primitive consistency. Validate recommendation items with representative agents and realistic record counts.

## Preserve these strengths

- Quiet surfaces, Inter and a clear dominant yellow action.
- Text alongside semantic status color.
- Current assignment review/results disclose demo execution and absent Gmail/email effects.
- Customer context, reusable pagination, sticky headers and responsive table detail treatments.
- Tab arrow/Home/End support, Radix dialogs/mobile sheet and existing visible focus styles.
- Review summaries, overwrite/suspension warnings, missing-variable checks and CSV duplicate/ineligible handling.

## Open product decisions

- Is this a demonstration or the design contract for a connected portal? Define setup lifecycle and credential custody accordingly.
- Which company/profile fields are editable here, and which come from another source?
- Must retry preserve the original template or intentionally use the latest? Which actions need bulk review/approval?
- Is mobile a full operational surface or primarily monitoring? Every visible control must still remain readable.
- Define scheduling/timezone, rollback, retention, permissions and delivery rules before implementing them. Shared Brio styling does not establish these business rules.

## Detailed findings

Tests below are proposed acceptance checks unless evidence explicitly describes runtime execution. Source locations refer to the audited working tree and may shift after changes.

### Global navigation

#### ACP-01 · High · Navigation has no URL or browser-history state

Evidence level: **Source**

- **Evidence:** src/store.tsx:80,94: route is React state initialized to customers; navigate only calls setRoute. The preview URL stayed / while moving through customer, editor and assignment screens.
- **User impact:** Refresh loses location; browser Back, bookmarks and shared links cannot restore a customer, tab or workflow.
- **Recommended change:** Represent customer, tab, template and review routes in the URL; preserve appropriate list context on return.
- **Acceptance check:** Open a customer history link in a new tab, refresh it, and use browser Back/Forward across tabs and workflows.

#### ACP-02 · High · Unsaved work can be discarded without warning

Evidence level: **Source**

- **Evidence:** src/pages/flows/TemplateWizard.tsx:27,41; src/components/Shell.tsx:62,308: drafts are component state and Cancel, Customers, home and Logout do not check dirty state.
- **User impact:** An agent can lose a carefully formatted signature or recipient selection through ordinary navigation.
- **Recommended change:** Track dirty state, offer keep editing/discard/save, and preserve drafts across accidental reload when appropriate.
- **Acceptance check:** Edit an existing template, then try Cancel, sidebar home, Logout and refresh; verify recovery and explicit discard.

#### ACP-03 · Medium · Screen changes do not move focus or announce the destination

Evidence level: **Source**

- **Evidence:** src/store.tsx:94: navigation updates route and scroll only; no route-heading focus management is implemented.
- **User impact:** Keyboard and screen-reader users can lose context when the invoking control unmounts.
- **Recommended change:** Focus the destination heading or main region on full-page navigation, while retaining the existing tab keyboard model.
- **Acceptance check:** Navigate customer → editor → assignment using only keyboard and verify the announced page and logical next Tab target.

#### ACP-04 · Medium · Persistence failures have no recovery state

Evidence level: **Source**

- **Evidence:** src/store.tsx:65–85: JSON reads are caught but schema is not validated; localStorage.setItem is unguarded. Agent identity and all demo records share one persisted object.
- **User impact:** A storage quota, blocked storage or valid JSON with an incompatible schema can break persistence or rendering without a useful explanation.
- **Recommended change:** Validate and version persisted data, catch writes, and show a recoverable local-save failure with an export/reset option.
- **Acceptance check:** Exercise blocked storage, quota exhaustion and an old/incompatible payload without losing recoverable user work.

#### ACP-05 · Low · Error toasts expire as quickly as success messages

Evidence level: **Source**

- **Evidence:** src/store.tsx:88–92 and src/components/Shell.tsx:318: every tone expires after 3.6 seconds; toasts are pointer-events-none and have no dismiss action.
- **User impact:** A user may miss an error or be unable to keep it visible while correcting the problem.
- **Recommended change:** Keep actionable failures inline or persistent; allow dismissal and pause transient notifications on focus/hover.
- **Acceptance check:** Trigger an error and verify it remains available long enough to understand and recover.

### Sign in

#### ACP-06 · Medium · Sign-in validation is generic and unannounced

Evidence level: **Source**

- **Evidence:** src/pages/Login.tsx:23–34,83,116: noValidate bypasses native email validation; the error paragraph lacks role=alert, aria-describedby and input-specific aria-invalid.
- **User impact:** Malformed email goes through a simulated sign-in delay, and assistive technology may not announce the failure.
- **Recommended change:** Validate email before submit; associate errors with the relevant fields and announce authentication failures without revealing which credential was wrong.
- **Acceptance check:** Submit empty, malformed-email and incorrect-credential cases with keyboard and a screen reader.

#### ACP-07 · Low · Sign-in lacks an access-recovery path

Evidence level: **Recommendation**

- **Evidence:** src/pages/Login.tsx: sign in and demo-fill are the only entry actions; no recovery or contact-admin route is shown.
- **User impact:** An agent who cannot sign in has no next step.
- **Recommended change:** Add a contact-admin or approved password-recovery path once the authentication ownership model is confirmed.
- **Acceptance check:** A first-time agent who lacks credentials can identify the correct support path without leaving the product to guess.

### Customer list

#### ACP-08 · Medium · Large customer lists have no sorting or direct page access

Evidence level: **Recommendation**

- **Evidence:** src/pages/Customers.tsx: table headers are static; src/components/TablePagination.tsx: only previous/next. The preview contains 1,312 customers and 219 pages at its current Auto size.
- **User impact:** Agents cannot quickly prioritize attention-needed customers by recent activity or jump through a large directory.
- **Recommended change:** Add useful sorting, especially name/status/activity, and consider direct page access or a stronger quick-jump search.
- **Acceptance check:** Find the most recently active attention-needed customer and a customer near the end of a large list.

#### ACP-09 · Low · Filter application differs between screens

Evidence level: **Recommendation**

- **Evidence:** src/pages/Customers.tsx: draft filters require Search; src/components/UserTable.tsx: filters apply immediately.
- **User impact:** A status dropdown can appear changed while the customer results still reflect the previous filter.
- **Recommended change:** Use a consistent application model, or label the action Apply filters and indicate pending changes clearly.
- **Acceptance check:** Change only the customer status filter and verify that the displayed state and results cannot be mistaken for one another.

#### ACP-10 · Medium · Auto pagination measures only the first row

Evidence level: **UI + source**

- **Evidence:** src/pages/Customers.tsx:43–55 uses the first tbody row height to calculate capacity. At the first desktop inspection the footer said 1–9 while lower rows needed internal scrolling because long names/domains increased row heights.
- **User impact:** Auto does not reliably fit the visible rows and changes page boundaries with viewport size.
- **Recommended change:** Use a stable row-density rule, measure cumulative actual row heights, or replace Auto with predictable page sizes.
- **Acceptance check:** Mix short and very long values at 1280px, 1024px and compact heights; verify the Auto promise and stable navigation.

#### ACP-11 · Low · Zero and unavailable metrics share the same dash

Evidence level: **Source**

- **Evidence:** src/pages/Customers.tsx: users || '—' and delegates || '—' render both zero values and unavailable values identically.
- **User impact:** Agents cannot distinguish no delegates from unknown delegate data.
- **Recommended change:** Use 0 for known zero, and an explicit unavailable/not loaded treatment for missing data; define the signature-coverage denominator.
- **Acceptance check:** Compare a ready customer with no delegates to a pending customer without directory data.

### Customer setup

#### ACP-12 · High · Pending/error customer setup has no completion or repair path

Evidence level: **UI + source**

- **Evidence:** src/components/AddCustomerDialog.tsx:124 saves Setup pending; src/store.tsx:117 fixes the new status to pending; src/pages/CustomerDetail.tsx offers no verify, reconnect, replace-key or retry action. Atlas Studio showed Not configured and Directory unavailable with no repair CTA.
- **User impact:** The onboarding process reaches a dead end; later assignment checks tell users to set up a directory they cannot configure here.
- **Recommended change:** Design a setup status panel with explicit local-demo limitations and a concrete verify/retry/reconfigure path for the intended connected implementation.
- **Acceptance check:** Trace add customer → pending → verified ready and invalid permission → repair → retry, preserving entered metadata.

#### ACP-13 · Medium · The demo requires a real-form private-key file for a local placeholder

Evidence level: **UI + source**

- **Evidence:** src/components/AddCustomerDialog.tsx:17–59 validates an RSA private key, returns only the account email and discards the key. The local-only explanation is below the form and initially below the modal fold.
- **User impact:** Users may provide a real credential to a demonstration that cannot connect or complete setup.
- **Recommended change:** Offer a clearly labeled sample/demo onboarding path and put the local-only handling explanation before the upload. Define secure credential handling separately for any connected version.
- **Acceptance check:** A new user can understand what is read, retained and connected before selecting any file; demo onboarding works without a real key.

#### ACP-14 · Low · Setup instructions are hard to copy and verify

Evidence level: **UI + source**

- **Evidence:** src/components/AddCustomerDialog.tsx:158–182: scopes appear in a single-line input; setup asks for client ID but readServiceAccountEmail only returns email.
- **User impact:** An agent must inspect the original file and manually copy a long truncated string to follow the instructions.
- **Recommended change:** Provide Copy scopes with feedback and show the parsed non-secret client ID/account identity for confirmation.
- **Acceptance check:** Complete the copy-and-compare steps without opening the JSON manually or missing a scope.

### Customer overview

#### ACP-15 · Medium · Large static customer metadata precedes every tool

Evidence level: **Recommendation**

- **Evidence:** src/pages/CustomerDetail.tsx:56–83: the six-field overview is always expanded above every tab. It becomes several rows on narrow viewports.
- **User impact:** Frequent users repeatedly scroll past address, website and service account to reach operational tools.
- **Recommended change:** Keep customer/domain/status visible and make secondary metadata collapsible, remembering the agent's preference.
- **Acceptance check:** On a 375px screen, reach directory and signature actions quickly while still being able to inspect full customer metadata.

#### ACP-16 · Medium · Branding fields used by signatures have no editing flow

Evidence level: **Source**

- **Evidence:** src/data.ts:298–313 derives company fields from Customer; customerLogo generates a mark. Customer has no logo field; src/store.tsx has no updateCustomer action.
- **User impact:** Agents can preview website/address/logo variables but cannot correct those customer values from this application.
- **Recommended change:** Provide a customer branding/details editor or identify the authoritative external source and its sync behavior.
- **Acceptance check:** Correct a company address and logo and verify every affected template preview reflects the intended source values.

### Directory

#### ACP-17 · Medium · Directory details cannot explain missing signature fields

Evidence level: **Recommendation**

- **Evidence:** src/components/UserTable.tsx: rows show name/email/title/department/org unit/status but no detail action for phone, mobile or location; these fields are used by signature variables.
- **User impact:** An agent who sees a missing-mobile warning cannot inspect the complete user record or identify how to correct it.
- **Recommended change:** Add a read-only user details panel and a clear source/update path for missing profile values.
- **Acceptance check:** From a missing-field warning, identify the affected record, view its relevant fields and understand how to fix them.

### Signature templates

#### ACP-18 · Medium · Templates can be saved despite being too long to assign

Evidence level: **Source**

- **Evidence:** src/pages/flows/TemplateWizard.tsx:30–39 only validates name, description and nonempty content; the 10,000-character block is deferred to src/components/Preflight.tsx:45.
- **User impact:** Agents can save a template and proceed to recipients before discovering a known blocking issue.
- **Recommended change:** Validate the length at save and provide a draft status if retaining an invalid draft is intentional. Also check personalized output against the product's agreed size policy.
- **Acceptance check:** Save content above the configured limit and content that expands beyond it after variables resolve; show an actionable editor error.

#### ACP-19 · Medium · Next silently commits template changes

Evidence level: **Source**

- **Evidence:** src/pages/flows/TemplateWizard.tsx:41–60 calls saveTemplate before navigating to assignment; the button is labeled Next.
- **User impact:** An agent may expect a reversible next step and unintentionally update a reusable template even if assignment is later abandoned.
- **Recommended change:** Label the action Save and choose recipients, and state whether changes affect only future assignments or existing deployments.
- **Acceptance check:** Edit a template, advance, cancel assignment and verify the user understood whether the template was saved.

#### ACP-20 · Medium · Wizard numbering does not explain entry points or total steps

Evidence level: **Source**

- **Evidence:** src/components/FormLayout.tsx:3 renders only Step N; src/pages/flows/AssignWizard.tsx:133 starts direct assignment at Step 2.
- **User impact:** Users entering from Assign Signature appear to have skipped a step and cannot see the process ahead.
- **Recommended change:** Use named progress steps and correct totals for Create → Recipients → Review versus direct Recipients → Review.
- **Acceptance check:** Start assignment from both entry points and verify progress, Back, Exit and completed-step behavior.

#### ACP-21 · Medium · Template identification will become ambiguous as the library grows

Evidence level: **Recommendation**

- **Evidence:** src/pages/tabs/SignaturesTab.tsx has no search or preview action; TemplateWizard accepts duplicate names and has no name-length limit.
- **User impact:** Long or duplicate names make the assignment select hard to use and increase the chance of choosing the wrong template.
- **Recommended change:** Define a name policy, add search when needed, and offer quick preview/assign from a template row with recognizable metadata.
- **Acceptance check:** Find and select the correct template among 50 entries including duplicates and very long names.

### Signature editor

#### ACP-22 · High · Raw signature HTML is injected without sanitization

Evidence level: **Source**

- **Evidence:** src/components/SignatureEditor.tsx:115 writes html into innerHTML; link/image tools interpolate strings into HTML; src/components/SignaturePreview.tsx uses dangerouslySetInnerHTML; src/data.ts:318 replaces variables but does not sanitize markup.
- **User impact:** Pasted or authored HTML can introduce unsafe attributes, URLs or page-affecting markup into the application context. This is a confirmed unsafe sink; an exploit was not executed.
- **Recommended change:** Apply a documented allowlist sanitizer at input, save and rendering boundaries; safely construct link/image nodes and restrict URL protocols. Consider an isolated preview.
- **Acceptance check:** Use inert sanitizer fixtures for event attributes, disallowed protocols, style leakage and malformed markup, preserving approved email-signature formatting.

#### ACP-23 · Medium · Editor popovers lack expected keyboard dismissal and focus behavior

Evidence level: **UI + source**

- **Evidence:** src/components/SignatureEditor.tsx:528–640 uses custom popovers closed only by mousedown outside. In the preview, pressing Escape while Font was expanded left it expanded.
- **User impact:** Keyboard users cannot reliably dismiss, navigate or return focus from editor menus.
- **Recommended change:** Use the approved Radix-backed popover/menu primitives with Escape, focus return, appropriate roles and keyboard navigation.
- **Acceptance check:** Complete font/color/link/image operations by keyboard; Escape closes each overlay and restores a meaningful focus position.

#### ACP-24 · Low · Font and history controls do not communicate actual state

Evidence level: **Source**

- **Evidence:** src/components/SignatureEditor.tsx:257 always displays Sans Serif; Undo/Redo are always enabled; command-state tracking covers toggles but not font/size or undo availability.
- **User impact:** The toolbar can imply a different font or available action from the current selection.
- **Recommended change:** Reflect selection font/size, handle mixed values and disable history controls when no action is available.
- **Acceptance check:** Select text with multiple fonts and sizes and verify toolbar state, Undo and Redo after both visual and HTML editing.

#### ACP-25 · Medium · Link and image insertion lacks labeled validation

Evidence level: **Source**

- **Evidence:** src/components/SignatureEditor.tsx:354–374,609–622: prompts rely on placeholders; image width is arbitrary text, images have no alt field and URL strings have no structured validation.
- **User impact:** Agents can insert broken images, unintended links or inaccessible content without guidance.
- **Recommended change:** Use visible labels, protocol-aware URL validation, positive width constraints, image alt text and useful inline errors/preview.
- **Acceptance check:** Try empty, malformed, variable-based, mailto/tel and image URLs, invalid widths and meaningful alternative text.

#### ACP-26 · Medium · Missing variables can leave broken visual fragments

Evidence level: **Recommendation**

- **Evidence:** src/data.ts:318–324 replaces missing values with empty strings; default HTML includes separators and an image token. Preview and preflight warn but do not offer field fallbacks or conditional blocks.
- **User impact:** A signature can contain orphan separators, empty contact lines or a broken image when customer/user data is incomplete.
- **Recommended change:** Offer optional fallback values or conditional blocks, and make affected-user previews reachable from warnings.
- **Acceptance check:** Preview users missing mobile/title/location and customers without branding; ensure output remains intentional.

### Notifications

#### ACP-27 · Medium · Typed notification addresses are lost unless explicitly committed

Evidence level: **Source**

- **Evidence:** src/pages/flows/NotifyPicker.tsx: query is local state; only suggestion selection or Enter invokes add. TemplateWizard saves only notify, with no knowledge of pending query.
- **User impact:** An agent may type an address then save, expecting that address to receive notifications later, while it is silently omitted.
- **Recommended change:** Provide an explicit Add recipient action or commit valid pending input on save/blur; block saving on invalid uncommitted input.
- **Acceptance check:** Type a valid address then click Save without Enter, and verify it is committed or an explicit correction is required.

#### ACP-28 · Low · Selected notification chips can hide the actual address

Evidence level: **Source**

- **Evidence:** src/pages/flows/NotifyPicker.tsx: selected chips display the directory label with the email only in title and the remove control's accessible name.
- **User impact:** Agents cannot easily distinguish similarly named recipients during review, especially on touch devices.
- **Recommended change:** Expose the address in chip detail or a focus/touch-accessible disclosure and make freeform-address support visible.
- **Acceptance check:** Select two people with the same display name and verify each destination without relying on mouse hover.

### Assignment

#### ACP-29 · High · Scheduled assignment is selectable but cannot complete

Evidence level: **UI + source**

- **Evidence:** src/pages/flows/AssignWizard.tsx:195 enables Scheduled and date inputs; line 152 disables final assignment for every scheduled execution. The initial helper only says a scheduler is required.
- **User impact:** Users spend time configuring a flow that has no success path.
- **Recommended change:** Disable/mark scheduling unavailable at the first decision, or implement schedule creation, management, editing and cancellation before enabling it.
- **Acceptance check:** No user can enter an apparently completable scheduling path that only reveals its blocking limitation at review.

#### ACP-30 · High · CSV import does not gate progression in signature assignment

Evidence level: **Source**

- **Evidence:** src/components/RecipientPicker.tsx:41–47 reads files asynchronously; src/pages/flows/AssignWizard.tsx:235 does not receive onImportingChange, so Review assignment remains enabled while reading.
- **User impact:** A user can advance with the previous recipient selection while an import is still processing; on unmount its result is discarded.
- **Recommended change:** Propagate import state to assignment, disable progression while reading and clearly announce when the imported selection becomes authoritative.
- **Acceptance check:** With a delayed file read, click Review immediately after upload and verify the final recipient set cannot be stale.

#### ACP-31 · Medium · Selections outside the current filter need a visible management view

Evidence level: **Recommendation**

- **Evidence:** src/components/UserTable.tsx: selections persist independently of filtering; the assignment footer shows total selected, but there is no Show selected or global clear action in the signature picker.
- **User impact:** Users can forget hidden selections while narrowing to another department and include unintended recipients.
- **Recommended change:** Add Show selected, Clear selection and a visible hidden-selection count; retain the existing explicit all-matching/entire-directory labels.
- **Acceptance check:** Select users across departments and pages, apply another filter, then inspect and clear the complete selection.

### CSV import

#### ACP-32 · Medium · Import exceptions cannot be fully inspected or corrected

Evidence level: **Source**

- **Evidence:** src/components/RecipientPicker.tsx:171–196 shows counts plus only the first three unmatched/ineligible addresses; invalid records are counted without row details. A successful import immediately replaces the selection.
- **User impact:** Agents cannot identify all rejected rows or recover their previous selection after a mistaken replacement.
- **Recommended change:** Offer a full row-level import report and an apply/replace confirmation or undo that preserves the prior selection.
- **Acceptance check:** Import a mixed file with more than three errors; identify every rejected row and restore the prior selection.

### Assignment review

#### ACP-33 · Medium · Preflight image checks miss equivalent HTML forms

Evidence level: **Source**

- **Evidence:** src/components/Preflight.tsx:33 matches only src="http:// with exact casing and double quotes; valid single-quoted, uppercase or spaced attributes are not inspected.
- **User impact:** The same problematic image can either trigger a warning or be missed depending on HTML formatting.
- **Recommended change:** Parse sanitized HTML and inspect normalized image sources and relevant output fields rather than using a narrow string match.
- **Acceptance check:** Equivalent image markup with double/single quotes, spacing and casing produces the same check result.

### Batch results

#### ACP-34 · Medium · Batch progress and completion do not communicate enough state

Evidence level: **Source**

- **Evidence:** src/components/BatchModal.tsx:109–137: the progress display is a styled div without progressbar semantics; completion always uses a green check regardless of failed count. Modal Close remains visible while its callback is a no-op during processing.
- **User impact:** Assistive technology misses progress, failures look successful at a glance, and a visible close button appears broken during work.
- **Recommended change:** Use an announced progress/status model, outcome-specific heading/icon and explicit busy-dismissal behavior with a reason.
- **Acceptance check:** Run all-success, partial-failure and all-failure fixtures and verify accurate announcements, outcome styling and close behavior.

#### ACP-35 · Medium · Unexpected batch exceptions can leave a permanent running dialog

Evidence level: **Source**

- **Evidence:** src/components/BatchModal.tsx:50–84 invokes job.run and commitBatch inside a timer without a failure handler; processing dialogs cannot close.
- **User impact:** An unexpected execution error has no visible failure or recovery route.
- **Recommended change:** Wrap execution/commit in explicit pending/success/failure states and retain a retry or safe-close path, preserving diagnostic context.
- **Acceptance check:** Inject a failing job and a failing commit and verify the dialog exits Running with actionable recovery.

### Delegates

#### ACP-36 · Medium · New delegate records have no status

Evidence level: **Source**

- **Evidence:** src/pages/tabs/DelegatesTab.tsx:86–93 creates entries without status; the table renders status ?? '—' at line 184, although Delegation supports active/pending.
- **User impact:** Newly added delegates are less informative than existing records, and agents cannot tell whether access is pending or active.
- **Recommended change:** Define the demo status and the connected lifecycle explicitly; set status on creation and show what Pending means.
- **Acceptance check:** Add a delegate fixture and verify a meaningful status, timestamp and history result are consistent.

#### ACP-37 · Medium · Mailbox-owner selection does not scale and access has no customer-wide overview

Evidence level: **Recommendation**

- **Evidence:** src/pages/tabs/DelegatesTab.tsx:38,111–128: all owners are placed in a native select, and rows are shown only for the chosen owner.
- **User impact:** At large directory sizes, finding an owner or discovering mailboxes that currently have delegates becomes slow.
- **Recommended change:** Use a searchable owner picker and consider a customer-wide delegation view with owner/delegate search and filters.
- **Acceptance check:** Find an owner among 1,000 users and answer which mailboxes currently have delegated access.

#### ACP-38 · Low · Delegate picker exposes filters and labels that do not fit its eligible set

Evidence level: **UI + source**

- **Evidence:** src/components/UserTable.tsx: status options always include suspended; DelegatesTab prefilters to active users. The dialog's header checkbox is announced Select entire directory even though only eligible delegates are present.
- **User impact:** A Suspended filter predictably returns nothing and select-all wording overstates the target population.
- **Recommended change:** Derive status options from eligible data or omit the redundant filter; parameterize selection wording to Select all eligible delegates.
- **Acceptance check:** Inspect every delegate filter and select-all label, including empty eligible sets and suspended owners.

### History and retry

#### ACP-39 · High · Retry bypasses review and uses the current template

Evidence level: **Source**

- **Evidence:** src/pages/tabs/HistoryTab.tsx:113–145 fetches the current template and immediately creates a batch for failed user IDs; it does not reuse signatureChecks or preserve original rendered content/version in LogEntry.
- **User impact:** A retry after a template edit can assign different content from the original batch, including content that current preflight would block.
- **Recommended change:** Store an immutable batch template snapshot/version, show retry scope/content, rerun preflight and link retry history to the parent run.
- **Acceptance check:** Fail a run, edit the template, then retry: verify explicit version choice, current checks and parent-child audit trace.

#### ACP-40 · Medium · History dates omit year and timezone

Evidence level: **Source**

- **Evidence:** src/data.ts:432–439 formats month/day/time only; CustomerDetail also splits that localized string on a comma. History offers no date-range filter.
- **User impact:** Old and recent activity can look identical across years, and distributed agents may interpret timestamps differently.
- **Recommended change:** Use explicit localized date formatting with year and timezone where relevant; format date-only values separately and add date-range filtering when history grows.
- **Acceptance check:** Compare records spanning years and two timezones; verify exports and UI describe the same instant.

#### ACP-41 · Medium · Persisted sample history makes a real API-success claim

Evidence level: **UI**

- **Evidence:** In the inspected preview, Brio Technologies → History → Company standard displayed Signature updated via Gmail API and Gmail API: 429 rate limit exceeded. Current execution is explicitly local demo. These messages may be legacy persisted data rather than current seed strings.
- **User impact:** Users can mistake historical demo rows for verified external actions.
- **Recommended change:** Label sample history at row/detail level and migrate legacy stored messages; keep demo/live provenance as explicit data.
- **Acceptance check:** Open both fresh and existing browser storage and verify no sample entry implies a real Gmail operation.

### Responsive and accessibility

#### ACP-42 · High · Recipient filters become unreadable on a 375px screen

Evidence level: **UI + source**

- **Evidence:** At 375×812, assignment search remained wide while Department and Account status shrank to narrow arrow-only controls. src/components/UserTable.tsx combines a shrinking filter group with flex inputs and min-w-0 selects.
- **User impact:** Mobile users cannot see which filters are selected or confidently change recipient scope.
- **Recommended change:** Use a responsive grid or full-width filter rows with minimum readable widths; keep selected labels visible.
- **Acceptance check:** At 375px and 320px, with long selected labels and zoom, every filter value and action remains readable and operable.

#### ACP-43 · Medium · Checkbox hit areas are only 18px

Evidence level: **Source**

- **Evidence:** src/components/ui.tsx:218 uses size-4.5 for role=checkbox buttons. No larger control wrapper is provided; row clicks increase mouse coverage but do not consistently enlarge the checkbox's own target.
- **User impact:** Small selection controls are difficult for touch and motor-impaired users, particularly in dense tables.
- **Recommended change:** Keep the visible checkbox compact within a larger hit area, checking target spacing and row interaction for each table.
- **Acceptance check:** Measure effective targets and spacing in selection tables on touch viewports; verify keyboard toggling remains clear.

#### ACP-44 · Medium · Shared Field couples label, hint and error text into accessible names

Evidence level: **UI + source**

- **Evidence:** src/components/ui.tsx:115–152 wraps children, hint and error in a label without IDs/describedby. In the preview the template input name became Template name Enter a template name. and description included its character counter.
- **User impact:** Screen-reader field names change when errors appear, and helper content is not exposed as a stable separate description.
- **Recommended change:** Use explicit htmlFor/id and aria-describedby/aria-errormessage; focus the first invalid field after submission and mark required semantics consistently.
- **Acceptance check:** Submit invalid forms and inspect accessible name, description, required state and focus before and after correction.

### Design system

#### ACP-45 · Low · Legacy visual and primitive patterns remain alongside Brio components

Evidence level: **Source**

- **Evidence:** src/pages/Login.tsx uses a dark gradient panel; ui.tsx/SignatureEditor/HistoryTab retain slate/violet/emerald literals, off-grid gaps and custom controls. ui/input.tsx and ui.tsx expose parallel input implementations; complex editor overlays are custom rather than Radix-backed.
- **User impact:** Future fixes and visual changes can drift between screens despite the strong shared yellow/Inter foundation.
- **Recommended change:** Consolidate primitives incrementally and map remaining UI colors/spacing/motion to approved tokens, preserving signature-content formatting as its own concern.
- **Acceptance check:** Review sign-in, dialogs, tables and editor against the same control, token and keyboard behavior inventory; verify actual shadcn/Radix usage rather than assuming compliance.

