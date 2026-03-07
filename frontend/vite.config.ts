import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

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
    },
    server: {
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
