import { Howl } from 'howler';
import { SOUNDS } from '@/config/sounds';

/**
 * SoundPool — Lazy-loads and recycles Howl instances to prevent
 * "Audio pool exhausted" errors and reduce garbage collection pressure.
 *
 * Each sound source gets a fixed-size pool of Howl nodes, created on first play.
 * When all nodes are busy, the oldest active node is recycled (stopped + replayed).
 * Failed sources are tracked to avoid retry spam.
 */

interface PoolEntry {
    howls: Howl[];
    nextIndex: number;
}

const DEFAULT_POOL_SIZE = 4;
const PRIORITY_POOL_SIZE = 6; // Larger pool for frequently-triggered sounds

// Sounds that get a larger pool due to rapid-fire usage
const PRIORITY_SOUNDS = new Set([
    SOUNDS.GAME.LEVEL_UP,
    SOUNDS.GAME.HARVEST,
    SOUNDS.GAME.CASH,
    SOUNDS.GAME.UPGRADE_INSTALL,
    SOUNDS.UI.CLICK,
]);

class SoundPool {
    private pools: Map<string, PoolEntry> = new Map();
    private failedSources: Set<string> = new Set();
    private initialized = false;

    /**
     * Mark pool as ready. Pools are created lazily on first play().
     */
    init(): void {
        if (this.initialized) return;
        this.initialized = true;
    }

    /**
     * Play a sound from the pool. If all nodes are busy, recycle the oldest.
     * Silently fails if the source previously failed to load.
     */
    play(src: string, volume: number = 1.0): void {
        // Skip sources that already failed to load
        if (this.failedSources.has(src)) return;

        try {
            const pool = this.ensurePool(src);
            if (!pool) return; // Pool creation failed

            const howl = pool.howls[pool.nextIndex];

            // If this node is still playing, stop it (recycle)
            if (howl.playing()) {
                howl.stop();
            }

            howl.volume(volume);
            howl.play();

            // Advance round-robin index
            pool.nextIndex = (pool.nextIndex + 1) % pool.howls.length;
        } catch {
            // Silently fail — audio should never crash the game
        }
    }

    /**
     * Ensure a pool exists for the given source. Creates one lazily if missing.
     * Returns null if the source is in the failed set.
     */
    private ensurePool(src: string): PoolEntry | null {
        if (this.failedSources.has(src)) return null;

        let pool = this.pools.get(src);
        if (pool) return pool;

        const size = PRIORITY_SOUNDS.has(src) ? PRIORITY_POOL_SIZE : DEFAULT_POOL_SIZE;
        const howls: Howl[] = [];
        let loadFailed = false;

        for (let i = 0; i < size; i++) {
            howls.push(
                new Howl({
                    src: [src],
                    preload: true,
                    volume: 1.0,
                    onloaderror: () => {
                        if (!loadFailed) {
                            loadFailed = true;
                            console.warn(`[SoundPool] Failed to load: ${src} — will not retry`);
                            this.failedSources.add(src);
                        }
                    },
                    onplayerror: () => {
                        // Silent — don't spam console on play errors
                    },
                })
            );
        }

        pool = { howls, nextIndex: 0 };
        this.pools.set(src, pool);
        return pool;
    }

    /**
     * Stop all sounds in all pools.
     */
    stopAll(): void {
        for (const [, pool] of this.pools) {
            for (const howl of pool.howls) {
                howl.stop();
            }
        }
    }

    /**
     * Unload all pools and free memory.
     */
    destroy(): void {
        for (const [, pool] of this.pools) {
            for (const howl of pool.howls) {
                howl.unload();
            }
        }
        this.pools.clear();
        this.failedSources.clear();
        this.initialized = false;
    }
}

// Singleton instance
export const soundPool = new SoundPool();

