# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Playwright **API-testing** learning repo — there are no UI/browser tests and no application source code. It exercises three live third-party HTTP APIs, each as its own Playwright project:

- **`fakeapi.platzi`** (`tests/fakeapi.platzi/`) — Platzi Fake Store API: products and users CRUD
- **`newsapi.org`** (`tests/newsapi.org/`) — NewsAPI.org: article search (`/everything`)
- **`conduit`** (`tests/conduit/`) — Conduit/RealWorld API (`demo.learnwebdriverio.com` backend): auth, articles, user settings

`package.json` defines no npm scripts; everything runs through the Playwright CLI directly. There is no `tsconfig.json` and TypeScript is not a direct dependency — Playwright/`tsx` transpile `.ts` files at runtime, so there is no separate typecheck/build step.

## Commands

Run all tests:
```
npx playwright test
```

Run a single project (must match a `name` in `playwright.config.ts`):
```
npx playwright test --project=conduit
npx playwright test --project=fakeapi.platzi
npx playwright test --project=newsapi.org
```

Run a single file or test by name:
```
npx playwright test tests/conduit/article/articleList.spec.ts
npx playwright test -g "filtering products by categoryId"
```

Run by tag (see `tests/app/tags.ts` — shared across all three projects, not project-scoped):
```
npx playwright test --grep @smoke
npx playwright test --grep @regression
```

View the last HTML report:
```
npx playwright show-report
```

## Environment

Config is loaded from `.env` via `dotenv` in `playwright.config.ts`. Required variables:

- `PLATZI_BASE_URL` — base URL for the `fakeapi.platzi` project
- `NEWS_BASE_URL`, `NEWS_API_KEY` — base URL and key for the `newsapi.org` project
- `CONDUIT_BASE_URL` — base URL for the `conduit` project (defaults to `https://conduit-api.learnwebdriverio.com` if unset)
- `CONDUIT_EMAIL`, `CONDUIT_PASSWORD`, `CONDUIT_USERNAME` — credentials for the pre-existing Conduit test account used by auth fixtures

`global-setup.ts` runs once before the suite: it logs in to Conduit with `CONDUIT_EMAIL`/`CONDUIT_PASSWORD` and writes the token to `.token` at the repo root. `tests/fixtures/auth.fixtures.ts` *also* independently reads/validates/refreshes that same `.token` file per-test (checking it against `/api/user`) — the two token paths overlap by design (global setup pre-warms it, the fixture re-validates/refreshes lazily), so don't "simplify" one away without checking the other still works standalone.

CI (`.github/workflows/playwright.yml`) runs on push to `main`, injecting these same variables from repo secrets, and uploads the HTML report as an artifact.

## Architecture

**Projects are the top-level split, not directories of convention.** `playwright.config.ts` defines three projects, each with its own `testDir` and `baseURL`. There is no root-level `use.baseURL` — every request is relative to whichever project is running, so specs never hardcode hosts. `expect.timeout` is globally raised to 25s (these are live third-party APIs, not local/mocked ones).

**No `page` fixture anywhere.** Every spec uses `request`/`APIRequestContext` (stock or a custom-built one) — this repo never launches a browser.

**Conduit has three independent, overlapping fixture styles** — know which file a spec imports from before extending it:
- `tests/fixtures/getToken.fixtures.ts` — simplest: logs in fresh every time, overrides `request` with a token header. No caching.
- `tests/fixtures/auth.fixtures.ts` — reads/validates/refreshes the shared `.token` file (see above), exposes `isAuthorized` (set `test.use({ isAuthorized: false })` to get an unauthenticated `request`) plus `nonAuthRequest` and a `randomString` fixture for unique test data.
- `tests/fixtures/auth2.fixtures.ts` — registers a **brand-new** user per test (`registerUser` → `registeredUser` → `authToken` → `authRequest`), so tests using this get full isolation instead of sharing the seeded account.
- `tests/fixtures/api-fixtures.ts` builds *on top of* `auth.fixtures.ts`, adding controller instances (`articleController`, `userController`, `authController`) constructed from its `request`.

When adding a new Conduit spec, pick the fixture file matching the isolation you need (shared seeded account vs. fresh-registered user) rather than inventing a fourth pattern.

**Conduit also has a controller/OOP layer** under `tests/app/conduit/controllers/` (`BaseController` → `ArticleController`/`AuthController`/`UserController`, aggregated by `ApiController`), plus a `@step` method decorator (`tests/app/conduit/utils/stepsDecorator.ts`) that wraps a method in `test.step` using `ClassName.methodName` as the label. This is layered *in addition to* the fixtures above, not a replacement — specs mix both styles (e.g. `articleCreate.spec.ts` uses `articleController` from a fixture *and* instantiates `ApiController` directly in the same file). `AuthController.login()` and `ArticleController`'s `ArticleSteps` subclass are unfinished stubs — don't extend them as if they're the established pattern; prefer the direct controller/fixture usage already exercised by passing specs.

**Reusable request helpers live next to the resource they touch**, outside the fixture/controller systems, for the Platzi suite specifically: `product/create-products.ts` exports `createProduct(request, overrides)`, used by every product spec that needs one to exist first; `product/get-existing-category.ts` looks up a valid `categoryId`. `data-generator.ts` (`generateUniqueTitle`/`Email`/`Username`) is shared across all three projects.

**Tagging convention.** `tests/app/tags.ts` defines a single `TAG` enum shared by all projects (`@smoke`, `@regression`, `@functional`, plus resource-specific tags like `@postProducts`, `@filter`). Tags are attached via `test.describe(name, { tag: [...] }, fn)`, not inline in the title string, and many `describe` blocks also carry an `annotation: { type: "issue", description: "MG-###" }` linking to a tracked ticket — carry that convention forward for new suites tied to a ticket.

**Zod schemas are inconsistently wired up.** `newsapi.org/schemas/news.schema.ts` and `conduit/schemas/article.schema.ts` are actively used with `safeParse` inside specs (`news.params.spec.ts`, `article.spec.ts`) alongside heavy use of `expect.soft` for per-field assertions so one bad field doesn't hide the rest. `fakeapi.platzi/schemas/*` exist but are only partially exercised — don't assume a schema file implies every response is validated against it.

**Known API bugs are intentionally asserted, not worked around.** E.g. `articleCreate.spec.ts` expects a `500` (not `422`) when `title` is missing from article creation, and `articleList.spec.ts` expects an unknown `author` filter to be silently ignored (full list returned) instead of yielding an empty result. When touching these tests, preserve the "known bug" comment and assertion rather than "fixing" the expectation — it documents real upstream API behavior.
