import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import { idlFactory } from "../declarations/backend.did.js";
import { _SERVICE } from "../declarations/backend.did";

const canisterId = import.meta.env.VITE_BACKEND_CANISTER_ID;

export const createBackendActor = async (identity?: Identity) => {
    const host = import.meta.env.DEV ? "http://127.0.0.1:4943" : "https://ic0.app";

    const agent = new HttpAgent({
        host,
        identity,
    });

    // Fetch root key for certificate validation during development
    if (import.meta.env.DEV) {
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
