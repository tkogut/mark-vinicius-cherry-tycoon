// Build identity — the one place the app is allowed to know what it is.
//
// `frontend/package.json`'s `version` is the single source of truth for the
// human-facing number. It moves only when a roadmap milestone closes, and every
// bump is accompanied by a git tag (`v0.9.0`). It does NOT move per commit —
// that is what the SHA is for.
//
// Rules for changing the version live in CLAUDE.md → Releasing. Do not write a
// version literal anywhere else in the UI; `uiConventions.test.ts` fails the
// build if one appears, because the old hardcoded "v3.8" was pure fiction —
// nothing produced it and nothing incremented it.

export interface BuildInfo {
    /** Milestone version from package.json, e.g. "0.9.0". */
    version: string;
    /** Short commit SHA of the build, or "nogit"/"dev" outside a checkout. */
    sha: string;
    /** ISO-8601 timestamp of the commit this bundle was built from. */
    builtAt: string;
    /** Which network this bundle was built for: local | playground | ic. */
    network: string;
}

export const BUILD: BuildInfo = {
    version: __BUILD_VERSION__,
    sha: __BUILD_SHA__,
    builtAt: __BUILD_TIME__,
    // Injected by vite.config.ts. (It used to be a separate constant because
    // `import.meta.env.VITE_DFX_NETWORK` was forced to "local" on every deploy that set only
    // VITE_DFX_NETWORK; DEPLOY-01 fixed that, the constant is kept so the badge cannot regress.)
    network: __BUILD_NETWORK__,
};

/** What the badge shows: `0.9.0 · a14352e`. */
export const buildLabel = (b: BuildInfo = BUILD): string => `${b.version} · ${b.sha}`;

/**
 * The full line, for the badge's title attribute. Answers "is this the build I
 * just pushed, and where is it pointing?" — the question that cost a wrong
 * conclusion on 2026-08-07, when a stale Playground canister was mistaken for a
 * failed deploy.
 */
export const buildDetail = (b: BuildInfo = BUILD): string =>
    `${b.network} · built ${b.builtAt.replace('T', ' ').replace('Z', ' UTC')}`;
