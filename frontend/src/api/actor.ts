import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import { idlFactory } from "../declarations/backend.did.js";
import { _SERVICE } from "../declarations/backend.did";

// OFFICIAL Backend Canister ID for Playground (6mce5)
// Hardcoded to break any "ID Ghost" loops from stale service-worker caches.
// This resolves IC0537: "Canister has no wasm module" caused by stale `5vsfh` routing.
const OFFICIAL_BACKEND_CANISTER_ID = "6mce5-laaaa-aaaab-qacsq-cai";


export const createBackendActor = async (identity?: Identity) => {
    const isLocal = window.location.hostname.includes("localhost") || window.location.hostname.includes("127.0.0.1");

    // Dual Entrypoint Resolution:
    // Priority: explicit env var -> OFFICIAL hardcoded fallback
    const canisterId =
        (isLocal || window.location.hostname.includes("icp0.io"))
            ? (import.meta.env.VITE_BACKEND_CANISTER_ID || OFFICIAL_BACKEND_CANISTER_ID)
            : (import.meta.env.VITE_BACKEND_MAINNET_CANISTER_ID || import.meta.env.VITE_BACKEND_CANISTER_ID || OFFICIAL_BACKEND_CANISTER_ID);

    console.log("[actor.ts] OFFICIAL_BACKEND_CANISTER_ID =", OFFICIAL_BACKEND_CANISTER_ID);
    console.log("[actor.ts] Final resolved canisterId =", canisterId);

    if (!canisterId) {
        throw new Error("Canister ID is required for backend actor creation. Check environment variables.");
    }
    const host = isLocal ? "http://127.0.0.1:8000" : "https://ic0.app";

    const agent = new HttpAgent({
        host,
        identity,
    });

    // Fetch root key for certificate validation during development
    if (isLocal) {
        await agent.fetchRootKey().catch((err) => {
            console.warn(
                "Unable to fetch root key. Check to ensure that your local replica is running"
            );
            console.error(err);
        });
    }

    // Creates an actor with using the candid interface and the HttpAgent
    return Actor.createActor<_SERVICE>(idlFactory, {
        agent,
        canisterId,
    });
};
