import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

const isDev = process.env["DFX_NETWORK"] !== "ic";

type Network = "ic" | "local";

interface CanisterIds {
    [key: string]: { [key in Network]: string };
}

let canisterIds: CanisterIds;
try {
    canisterIds = JSON.parse(
        fs.readFileSync(
            isDev ? ".dfx/local/canister_ids.json" : "./canister_ids.json"
        ).toString()
    );
} catch (e) {
    console.error("\n⚠️  Could not find canister_ids.json. You may need to run `dfx deploy` first.\n");
    canisterIds = {};
}

// List of all canisters to expose to the frontend
const CANISTER_NAMES = ["backend", "internet_identity"];

// Generate environment variables based on canister IDs
const canisterEnvDefinitions = CANISTER_NAMES.reduce((acc, name) => {
    const network = process.env["DFX_NETWORK"] || "local";
    const canisterId = process.env[`CANISTER_ID_${name.toUpperCase()}`] || canisterIds[name]?.[network];

    if (canisterId) {
        acc[`VITE_${name.toUpperCase()}_CANISTER_ID`] = JSON.stringify(canisterId);
        acc[`process.env.${name.toUpperCase()}_CANISTER_ID`] = JSON.stringify(canisterId);
    } else {
        console.warn(`⚠️  Canister ID not found for ${name} on network ${network}`);
    }

    return acc;
}, {} as Record<string, string>);

console.log("Environment definitions:", canisterEnvDefinitions);

// https://vitejs.dev/config/
export default defineConfig({
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
