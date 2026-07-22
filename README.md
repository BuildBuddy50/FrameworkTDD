# Nova Store — E2E Test Framework

Playwright + TypeScript **Page Object Model** framework for the Nova Store
application, with a smoke suite, a regression suite, multi-environment
support, and a ready-to-run Jenkins pipeline.
C:\Users\biswaranjan patra\Downloads\novastore-e2e\tests

## Stack

- **Playwright Test** (`@playwright/test`) — runner, assertions, fixtures
- **TypeScript** — typed page objects and data factories
- **Page Object Model** — one class per screen under `src/pages`
- **Custom fixtures** — page objects injected into every test
- **Reporters** — list + HTML + JUnit (for Jenkins) + JSON

## Layout

```
novastore-e2e/
├── app/                      # the application under test (Nova Store API + frontend.html)
│   ├── server.js             # REST API
│   ├── frontend.html         # single-page UI
│   ├── static-server.js      # serves frontend.html over http for tests
│   └── .env.test             # env used when the framework boots the app
├── src/
│   ├── pages/                # Page Objects
│   │   ├── BasePage.ts        # shared nav/waits; pins the SPA to the target API
│   │   ├── AuthPage.ts        # login / register
│   │   ├── ShopPage.ts        # storefront: search, sort, add-to-cart
│   │   ├── CartPage.ts        # cart + checkout + confirmation
│   │   └── AdminPage.ts       # admin dashboard + product CRUD
│   ├── fixtures/pageFixtures.ts  # injects page objects into tests
│   ├── data/testData.ts       # unique users/products/checkout factories
│   └── utils/env.ts           # environment resolver (local/dev/qa/prod)
├── tests/
│   ├── smoke/smoke.spec.ts        # 5 smoke tests  (@smoke)
│   └── regression/regression.spec.ts  # 5 regression tests (@regression)
├── playwright.config.ts       # projects, reporters, webServer
├── Jenkinsfile                # CI pipeline
└── package.json
```

## How the app is served

Nova Store ships `frontend.html` as a standalone file and a separate REST
API. For tests, `playwright.config.ts` boots **two** local servers via
`webServer`:

1. the REST API (`node --env-file=app/.env.test app/server.js`) on port 4000
2. a static server (`app/static-server.js`) hosting `frontend.html` on port 8080

`BasePage.open()` sets the SPA's `localStorage` API base to the target
environment before the app loads, so the UI talks to the right backend.

## Setup

```bash
npm install               # framework deps
npm run app:install       # app-under-test runtime deps
npm run install:browsers  # Playwright browsers (Chromium/Firefox/WebKit)
```

## Running

```bash
npm test                  # everything, all browsers
npm run test:smoke        # only @smoke
npm run test:regression   # only @regression
npm run test:chromium     # chromium only
npm run test:headed       # watch it run
npm run test:ui           # Playwright UI mode
npm run report            # open the last HTML report
```

## Environments

Select with the `ENV` variable (default `local`). `local`, `dev`, and `qa`
boot the app locally; `prod` (or any `NO_WEBSERVER=1` run) points at a
deployed URL and skips the local servers.

```bash
ENV=qa npm run test:smoke
ENV=prod BASE_URL=https://novastore.example API_URL=https://novastore.example/api NO_WEBSERVER=1 npm test
```

`src/utils/env.ts` holds the per-environment URLs; override `BASE_URL` /
`API_URL` from the shell or Jenkins.

## Test cases

**Smoke (`@smoke`) — critical path**

1. SMOKE-01 storefront loads with products
2. SMOKE-02 new customer can register
3. SMOKE-03 admin can log in and reach the dashboard
4. SMOKE-04 a product can be added to the cart
5. SMOKE-05 guest completes checkout end-to-end

**Regression (`@regression`) — deeper coverage**

1. REG-01 login fails with invalid credentials
2. REG-02 duplicate-email registration is rejected
3. REG-03 product search filters the grid
4. REG-04 sort by price low-to-high orders ascending
5. REG-05 admin creates a product and it appears in the store

## Jenkins

The `Jenkinsfile` runs inside the official Playwright Docker image
(browsers preinstalled). It exposes build parameters for **ENV**, **SUITE**
(all/smoke/regression), and **BROWSER**, publishes the HTML report,
records JUnit results for the test-trend graph, and archives traces,
screenshots, and videos on failure.

Create a **Pipeline** job → _Pipeline script from SCM_ → point at this repo;
the `Jenkinsfile` is picked up automatically. Requires the _HTML Publisher_,
_AnsiColor_, and _Timestamper_ plugins.

## Notes

- Every run generates unique data (timestamped emails/product names), so
  tests are isolated and re-runnable without cleanup.
- Traces are retained on failure — open them with
  `npx playwright show-trace <trace.zip>`.

  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
