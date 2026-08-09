import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

// ── Build identity ──────────────────────────────────────────────────────────
// The version badge used to be the literal string "v3.8" in App.tsx. Nothing
// produced that number, nothing incremented it, and it appeared nowhere else in
// the repo — package.json still read 0.0.0 and there were no git tags at all.
//
// Worse, a semver alone cannot answer the question the badge exists to answer.
// On 2026-08-07 the same version shipped four times in one afternoon; screenshots
// of a stale Playground canister were read as "the fix did not deploy", and the
// investigation that followed went through bundle diffing before finding the
// real cause. A visible commit SHA settles that in two seconds.
//
// So the badge carries both: `version · sha`, where the version is the milestone
// marker from package.json and the SHA is what is actually running.

const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'));

/** Short commit SHA. Falls back rather than failing a build outside a checkout. */
function buildSha(): string {
    // CI provides it directly; actions/checkout defaults to a depth-1 clone, which
    // still resolves HEAD, but reading the env var avoids depending on that.
    const fromCi = process.env["GITHUB_SHA"];
    if (fromCi) return fromCi.slice(0, 7);
    try {
        return execSync('git rev-parse --short=7 HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
            .toString().trim();
    } catch {
        return 'nogit';
    }
}

/**
 * COMMIT time, not build time — deliberately.
 *
 * Wall-clock `new Date()` would change on every run, so the bundle hash would
 * change too and every deploy would re-upload an identical main chunk. Commit
 * time makes the build reproducible: the same commit always produces the same
 * bytes. It also answers the more useful question — when the code was written,
 * not when CI happened to run it.
 */
function commitTime(): string {
    const utc = (d: Date) => d.toISOString().replace(/\.\d+Z$/, 'Z');
    try {
        // %cI is ISO-8601 with the committer's local offset; normalise to UTC so
        // the badge means the same thing regardless of who built it.
        const raw = execSync('git log -1 --format=%cI', { stdio: ['ignore', 'pipe', 'ignore'] })
            .toString().trim();
        const parsed = new Date(raw);
        return Number.isNaN(parsed.getTime()) ? utc(new Date()) : utc(parsed);
    } catch {
        return utc(new Date());
    }
}

const buildIdentity = {
    version: String(pkg.version ?? '0.0.0'),
    sha: buildSha(),
    builtAt: commitTime(),
};

const network = process.env["DFX_NETWORK"] || process.env["VITE_DFX_NETWORK"] || "local";
const isDev = network !== "ic";

type Network = "ic" | "local";

interface CanisterIds {
    [key: string]: { [key in Network]: string };
}

let canisterIds: CanisterIds;
try {
    const network = process.env["DFX_NETWORK"] || process.env["VITE_DFX_NETWORK"] || "local";
    let idsPath = path.resolve(__dirname, "../canister_ids.json"); // Default

    if (network === "local") {
        idsPath = path.resolve(__dirname, "../.dfx/local/canister_ids.json");
    } else if (network === "playground") {
        idsPath = path.resolve(__dirname, "../.dfx/playground/canister_ids.json");
    }

    canisterIds = JSON.parse(fs.readFileSync(idsPath).toString());
} catch (e) {
    console.warn("\n⚠️  Could not find canister_ids.json. Falling back to environment variables.\n");
    canisterIds = {};
}

// List of all canisters to expose to the frontend
const CANISTER_NAMES = ["backend", "backend_mainnet", "internet_identity"];

// Generate environment variables based on canister IDs
const canisterEnvDefinitions = CANISTER_NAMES.reduce((acc, name) => {
    const network = process.env["DFX_NETWORK"] || process.env["VITE_DFX_NETWORK"] || "local";

    // Priority: CANISTER_ID_NAME > VITE_NAME_CANISTER_ID > canister_ids.json
    const canisterId =
        process.env[`CANISTER_ID_${name.toUpperCase()}`] ||
        process.env[`VITE_${name.toUpperCase()}_CANISTER_ID`] ||
        canisterIds[name]?.[network];

    if (canisterId) {
        acc[`import.meta.env.VITE_${name.toUpperCase()}_CANISTER_ID`] = JSON.stringify(canisterId);
        acc[`process.env.${name.toUpperCase()}_CANISTER_ID`] = JSON.stringify(canisterId);
        acc[`process.env.VITE_${name.toUpperCase()}_CANISTER_ID`] = JSON.stringify(canisterId);
    } else {
        console.warn(`⚠️  Canister ID not found for ${name} on network ${network}`);
    }

    return acc;
}, {} as Record<string, string>);

console.log("Environment definitions:", canisterEnvDefinitions);

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    define: {
        // Define the environment variables globally for the app
        ...canisterEnvDefinitions,
        "process.env.DFX_NETWORK": JSON.stringify(process.env["DFX_NETWORK"]),
        "process.env.NODE_ENV": JSON.stringify(isDev ? "development" : "production"),
        "import.meta.env.VITE_DFX_NETWORK": JSON.stringify(process.env["DFX_NETWORK"] || "local"),
        __BUILD_VERSION__: JSON.stringify(buildIdentity.version),
        __BUILD_SHA__: JSON.stringify(buildIdentity.sha),
        __BUILD_TIME__: JSON.stringify(buildIdentity.builtAt),
    },
    server: {
        port: 5173,
        host: true,
        strictPort: true,
        fs: {
            allow: ["."],
        },
        proxy: {
            // Proxy API requests to the local replica
            "/api": {
                target: "http://127.0.0.1:8000",
                changeOrigin: true,
            },
        },
    },
});
