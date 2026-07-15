# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Playwright API-testing learning repo (no UI tests). It exercises two external services:

- **Platzi Fake Store API** (`tests/fakeapi.platzi/`) — products and users CRUD
- **Conduit API** (`tests/demo.learnwebdriverio/`) — auth/registration, plus a separate News API fixture

There are no application source files here — the repo is purely Playwright test suites, fixtures, and helpers targeting live third-party HTTP APIs. `package.json` defines no scripts; all commands run through the Playwright CLI directly.

## Commands

Run all tests:

```
npx playwright test
```

Run a single project (matches `playwright.config.ts` project names):

```
npx playwright test --project=fakeapi.platzi
npx playwright test --project=demo.learnwebdriverio
```

Run a single file or test by name:

```
npx playwright test tests/fakeapi.platzi/product/create-products.spec.ts
npx playwright test -g "filtering products by categoryId"
```

Run by tag (see `tests/fakeapi.platzi/tags.ts`):

```
npx playwright test --grep @smoke
npx playwright test --grep @regression
```

View the last HTML report:

```
npx playwright show-report
```

There is no lint/build/typecheck script configured (no `tsconfig.json`, TypeScript is not installed as a direct dependency — `tsx` transpiles at runtime).

## Environment

Config is loaded from `.env` via `dotenv` in `playwright.config.ts`. Required variables:

- `PLATZI_BASE_URL` — base URL for the `fakeapi.platzi` project
- `CONDUIT_BASE_URL` — base URL for the `demo.learnwebdriverio` project (defaults to `https://conduit-api.learnwebdriverio.com` if unset)
- `CONDUIT_EMAIL`, `CONDUIT_PASSWORD` — Conduit credentials
- `NEWS_API_KEY`, `NEWS_BASE_URL` — used by `news.fixture.ts`

## Architecture

**Projects are the top-level split.** `playwright.config.ts` defines two Playwright projects, each scoped to its own `testDir` and `baseURL`. There is no `use.baseURL` at the root — every request is relative to whichever project is running, so specs never hardcode hosts.

**API-only, no browser.** Tests use the `request` fixture (or a custom request fixture) exclusively — no `page` interactions anywhere in the suite.

**Fixtures compose, rather than tests calling setup code directly.** For example `auth.fixtures.ts` chains `registerUser` (data) → `registeredUser` (POSTs to `/api/users`, returns the created user) → `authToken` (extracts just the token). Specs request whichever fixture level they need. `news.fixture.ts` follows the same `test.extend` pattern to build an authenticated `APIRequestContext` for the News API. When adding new auth- or resource-scoped setup, extend the relevant fixture file rather than duplicating request calls in specs.

**Reusable request helpers live next to the resource they touch.** `product/create-products.ts` exports `createProduct(request, overrides)`, used by every product spec that needs a product to exist first. `data-generator.ts` centralizes unique-value generation (`generateUniqueTitle`, `generateUniqueEmail`, `generateUniqueUsername`) and is imported across both `fakeapi.platzi` and `demo.learnwebdriverio` suites.

**Tagging convention.** `tests/fakeapi.platzi/tags.ts` defines a `TAG` enum (`@smoke`, `@regression`, `@functional`, plus resource-specific tags like `@postProducts`, `@filter`). Tags are attached via the `test.describe(name, { tag: [...] }, fn)` options object, not inline in the title string. New specs should tag through this enum rather than raw string tags, and reuse it from `../fakeapi.platzi/tags` even inside `demo.learnwebdriverio` specs — it isn't project-scoped.

**Zod schemas exist but are only wired up in `fakeapi.platzi/schemas/`** (e.g. `products-schema.ts`) as standalone `safeParse` checks — they are not yet consistently used for response validation inside specs.

**Known WIP/inconsistent files**: `tests/demo.learnwebdriverio/AuthController.spec.ts` is an incomplete/broken scratch file (references an undefined `BaseControllers` class, unclosed test body) — prefer the working pattern in `auth/auth.spec.ts` when writing new Conduit tests instead of extending that file.
