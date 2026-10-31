# Frontend Development Guidelines

> Best practices for frontend development in this project.

---

## Overview

This directory contains guidelines for frontend development. Fill in each file with your project's specific conventions.

---

## Guidelines Index

| Guide | Description | Status |
|-------|-------------|--------|
| [Directory Structure](./directory-structure.md) | Module organization and file layout | To fill |
| [Component Guidelines](./component-guidelines.md) | Component patterns, props, composition | To fill |
| [Hook Guidelines](./hook-guidelines.md) | Custom hooks, data fetching patterns | To fill |
| [State Management](./state-management.md) | Local state, global state, server state | To fill |
| [Quality Guidelines](./quality-guidelines.md) | Code standards, forbidden patterns | To fill |
| [Type Safety](./type-safety.md) | Type patterns, validation | To fill |
| [Font Release Operations](./font-release-operations.md) | Immutable external font catalog release transaction and recovery | Active |

---

## How to Fill These Guidelines

For each guideline file:

1. Document your project's **actual conventions** (not ideals)
2. Include **code examples** from your codebase
3. List **forbidden patterns** and why
4. Add **common mistakes** your team has made

The goal is to help AI assistants and new team members understand how YOUR project works.

---

**Language**: All documentation should be written in **English**.

## Authoritative Design-page Contract

This repository keeps the complete, public design-page rules in `docs/rules/`; do not duplicate them here. Before changing `src/designs/**`, shared rendering, fonts, URLs, Reveal, or the action menu, read:

- `AGENTS.md` for the eight mandatory gates and task routing;
- `docs/rules/design-contract.md`, `data-and-i18n.md`, `visual-language.md`, `accessibility-responsive.md`, `pitfalls.md`, and `operations.md`;
- `docs/fonts/selection-guide.md` for any new font;
- `docs/adr/0011-design-specific-js-progressive-enhancement.md` for optional per-design JavaScript.

Before handoff, run the full `.agents/skills/design-page-verify/SKILL.md` flow and update `docs/verification/<id>.md`. A successful `npm run build` alone is not design verification.
