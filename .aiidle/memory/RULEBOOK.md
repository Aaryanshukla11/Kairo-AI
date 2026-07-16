==================================================
AIIDLE ENGINEERING CONSTITUTION
==================================================

Rule 1 — Vision First

The long-term vision always takes priority over short-term convenience.
Never sacrifice architecture, scalability, maintainability or engineering quality for temporary speed.

--------------------------------------------------

Rule 2 — Offline First

Every feature must work completely offline unless internet access is explicitly required by the user.

--------------------------------------------------

Rule 3 — Human Approval Required

The AI may analyze, plan and prepare work automatically.

Any destructive action or project-modifying operation requires explicit user approval before execution.

--------------------------------------------------

Rule 4 — Documentation First

Every major architectural decision, public module, engineering change or feature addition must be documented before the task is considered complete.

--------------------------------------------------

Rule 5 — Persistent Memory

Every completed task must update the permanent project memory.

The project must never lose context between sessions.

--------------------------------------------------

Rule 6 — Modular Architecture

Every feature belongs to its own module.

Modules must remain independent and loosely coupled.

--------------------------------------------------

Rule 7 — Single Responsibility

Every file, component, class, service and module must have one clearly defined responsibility.

--------------------------------------------------

Rule 8 — No Architecture Compromise

Never introduce shortcuts that will require large refactoring later.

Build correct architecture from the beginning whenever practical.

--------------------------------------------------

Rule 9 — Security First

Every filesystem operation, terminal execution and future AI action must be sandboxed, validated and permission-controlled.

--------------------------------------------------

Rule 10 — Webview Separation

The VS Code Extension manages

• lifecycle

• CSP

• communication

React manages

• UI

• rendering

Never mix these responsibilities.

--------------------------------------------------

Rule 11 — Feature Isolation

Every major feature must be independently replaceable without affecting unrelated modules.

--------------------------------------------------

Rule 12 — Public Entry Points Only

Every module exposes exactly one public entry point.

Internal implementation details remain private.

Modules must never depend on another module's internal files.

--------------------------------------------------

Rule 13 — Small Focused Modules

If a file grows beyond a single responsibility,

split it before adding new functionality.

Prefer many small modules over large multifunction files.

--------------------------------------------------

Rule 14 — Prompt Minimalism

Repository-wide rules must never be repeated inside every implementation prompt.

Prompts describe only the delta required for the current task.

--------------------------------------------------

Rule 15 — One Capability Per Task

Each engineering task introduces one meaningful capability.

Avoid extremely small tasks.

Avoid implementing entire systems inside a single prompt.

--------------------------------------------------

Rule 16 — Composition Root

App.tsx must remain a composition root only.

Business logic belongs inside reusable modules and components.

--------------------------------------------------

Rule 17 — Reusable Components

Every visible UI component must be reusable.

Avoid page-specific implementations whenever possible.

--------------------------------------------------

Rule 18 — Design System Only

No inline CSS.

No inline colors.

No duplicated spacing.

No duplicated typography.

Everything must come from the Design System.

--------------------------------------------------

Rule 19 — Replaceable UI

Every visible component must be independently replaceable without affecting the rest of the application.

--------------------------------------------------

Rule 20 — Professional Before Decorative

The interface must feel like professional software before it feels visually impressive.

Whitespace, hierarchy and usability take priority over decorative effects.

--------------------------------------------------

Rule 21 — Single VS Code Bridge

window.acquireVsCodeApi()

may only exist inside

vscodeBridge.ts

Every component communicates with VS Code only through that bridge.

--------------------------------------------------

Rule 22 — No Duplicate Logic

Business logic must exist in only one place.

Shared behavior belongs inside reusable services or utilities.

--------------------------------------------------

Rule 23 — Backward Compatibility

New features must not break existing completed functionality unless an approved architecture migration explicitly requires it.

--------------------------------------------------

Rule 24 — Quality Gate

No task is complete until

✓ Build succeeds

✓ Lint succeeds

✓ Tests pass (when applicable)

✓ Extension runs successfully inside VS Code Extension Host

✓ No runtime errors exist

--------------------------------------------------

Rule 25 — No Magic Values

Hardcoded colors,

spacing,

timeouts,

configuration,

URLs,

magic strings,

magic numbers

must never be scattered throughout the project.

Use constants, configuration files or the Design System.

--------------------------------------------------

Rule 26 — Protocol strictness

All inter-module communication must use the shared protocol.
No module may invent its own message format.

==================================================
FINAL DIRECTIVES
==================================================

These rules override implementation preferences.

Whenever uncertainty exists,

choose the option that best satisfies this constitution.

All future prompts must automatically follow RULEBOOK.md.

Do not repeat these rules inside future prompts.
