// Global Vitest setup.
//
// `@testing-library/jest-dom` was already in devDependencies but was never
// wired in (`vitest.config.ts` had `setupFiles: []`), so matchers like
// `toBeInTheDocument()` / `toHaveAttribute()` were unavailable and any test
// reaching for them failed with a confusing "not a function". Importing it here
// registers them for every test file.
import '@testing-library/jest-dom/vitest';

// Auto-unmount React trees and clear the jsdom container between tests, so a
// component left mounted by one test cannot leak into the next one's queries.
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
    cleanup();
});
