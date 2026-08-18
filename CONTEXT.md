# NFC Nürnberg Club Website

The domain context for the club website: a Next.js site with public pages, a member dashboard, and (per `docs/roles-and-permissions.md`) a target permissions model this project is being built toward.

## Language

**Feature (Capability)**:
A cohesive slice of user-facing behavior spanning whatever pages/roles touch it (e.g. Event Scheduling & Attendance spans a public page and a dashboard page). The unit that requirement documents are split by.
_Avoid_: Page, module, area — those describe *where* code lives, not the capability itself.

**Requirement document**:
A markdown spec in `docs/features/`, one per capability, written PRD-style (problem statement, user stories, acceptance criteria, out-of-scope) plus a current-vs-target table. Feeds — but is not itself — a set of GitHub issues.
_Avoid_: Spec (too generic — this repo also has role specs), PRD (implies a stricter/external template than what's used here).

**Workitem**:
A GitHub issue filed in `upretiraman/playgroundNFC`, matching the repo's existing branch-per-issue / PR-per-issue workflow.
_Avoid_: Ticket, task (not tied to a concrete system in this repo).
