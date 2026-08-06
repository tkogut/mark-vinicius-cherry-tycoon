import { defineConfig, devices } from '@playwright/test';

// QUAL-03 — Playwright was in devDependencies with zero configuration and zero
// tests. This wires it to layer L4 of the pyramid.
//
// SCOPE DECISION: these specs drive the DEV HARNESSES
// (frontend/harness.html, frontend/marketplace-harness.html), not the full app.
//
// The harnesses mount the real components with mocked props and no auth or
// canister, so a run is deterministic. Driving the full app instead was tried
// repeatedly by hand during the UX work and was flaky for reasons that have
// nothing to do with the code under test: a random weather event modal
// ("Severe Drought") intercepts clicks, and test-player initialisation against
// Playground intermittently fails. Those are real gameplay behaviours, not bugs
// to assert around, so full-journey coverage against an ephemeral local replica
// is deliberately a separate, later project (see QUAL-10) rather than being
// mixed in here and made everyone's flake.
//
// Config lives in frontend/ (not the repo root) because that is the only npm
// project — node_modules, the dev server and the harness pages are all here.

const PORT = 5199; // dedicated port: 5173 is vite's default and 5180 is used by ad-hoc dev servers
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
    testDir: './e2e',
    // A harness page is deterministic, so a passing test that only passes
    // sometimes is a real signal. Retries stay off locally to surface that.
    retries: process.env.CI ? 2 : 0,
    forbidOnly: !!process.env.CI,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

    use: {
        baseURL: BASE_URL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },

    projects: [
        {
            name: 'harness-chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    webServer: {
        command: `npm run dev -- --port ${PORT} --strictPort`,
        // Point the readiness probe at a harness page rather than `/`: the app
        // root mounts the full App, which reaches for a canister that is not
        // running here.
        url: `${BASE_URL}/harness.html`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stdout: 'ignore',
        stderr: 'pipe',
    },
});
