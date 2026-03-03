import { Howl } from 'howler';
import { SOUNDS } from '@/config/sounds';

/**
 * SoundPool — Pre-loads and recycles Howl instances to prevent
 * "Audio pool exhausted" errors and reduce garbage collection pressure.
 *
 * Each sound source gets a fixed-size pool of Howl nodes.
 * When all nodes are busy, the oldest active node is recycled (stopped + replayed).
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

// Sounds to eagerly preload on init
const PRELOAD_SOUNDS = [
    SOUNDS.GAME.LEVEL_UP,
    SOUNDS.GAME.UPGRADE_INSTALL,
    SOUNDS.UI.CLICK,
    SOUNDS.UI.SUCCESS,
    SOUNDS.GAME.HARVEST,
    SOUNDS.GAME.PLANT,
    SOUNDS.GAME.WATER,
    SOUNDS.GAME.CASH,
];

class SoundPool {
    private pools: Map<string, PoolEntry> = new Map();
    private initialized = false;

    /**
     * Pre-load critical sounds into pools so they're ready for instant playback.
     */
    init(): void {
        if (this.initialized) return;
        this.initialized = true;

        for (const src of PRELOAD_SOUNDS) {
            this.ensurePool(src);
        }
    }

    /**
     * Play a sound from the pool. If all nodes are busy, recycle the oldest.
     */
    play(src: string, volume: number = 1.0): void {
        try {
            const pool = this.ensurePool(src);
            const howl = pool.howls[pool.nextIndex];

            // If this node is still playing, stop it (recycle)
            if (howl.playing()) {
                howl.stop();
            }

            howl.volume(volume);
            howl.play();

            // Advance round-robin index
            pool.nextIndex = (pool.nextIndex + 1) % pool.howls.length;
        } catch (error) {
            // Silently fail — audio should never crash the game
            console.warn('[SoundPool] Playback failed, silently recovering:', error);
        }
    }

    /**
     * Ensure a pool exists for the given source. Creates one if missing.
     */
    private ensurePool(src: string): PoolEntry {
        let pool = this.pools.get(src);
        if (pool) return pool;

        const size = PRIORITY_SOUNDS.has(src) ? PRIORITY_POOL_SIZE : DEFAULT_POOL_SIZE;
        const howls: Howl[] = [];

        for (let i = 0; i < size; i++) {
            howls.push(
                new Howl({
                    src: [src],
                    preload: true,
                    volume: 1.0,
                    onloaderror: (_id, err) => {
                        console.warn(`[SoundPool] Failed to load ${src}:`, err);
                    },
                    onplayerror: (_id, err) => {
                        console.warn(`[SoundPool] Play error for ${src}:`, err);
                    },
                })
            );
        }

        pool = { howls, nextIndex: 0 };
        this.pools.set(src, pool);
        return pool;
    }

    /**
     * Stop all sounds in all pools. Useful for cleanup.
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
        this.initialized = false;
    }
}

// Singleton instance
export const soundPool = new SoundPool();
