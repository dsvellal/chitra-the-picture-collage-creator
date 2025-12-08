import '@testing-library/jest-dom';
import { vi, beforeAll } from 'vitest';

// Explicitly fail on network requests
const failOnNetwork = (url: string) => {
    throw new Error(`[NETWORK VIOLATION] Attempted to access ${url}. Tests must be offline.`);
};

beforeAll(() => {
    // Mock global fetch
    vi.stubGlobal('fetch', vi.fn((url) => {
        const urlStr = url instanceof Request ? url.url : String(url);
        failOnNetwork(urlStr);
    }));

    // Mock XMLHttpRequest
    if (typeof XMLHttpRequest !== 'undefined') {
        const originalOpen = XMLHttpRequest.prototype.open;

        vi.spyOn(XMLHttpRequest.prototype, 'open').mockImplementation(function (this: XMLHttpRequest, ...args: Parameters<XMLHttpRequest['open']>) {
            failOnNetwork(args[1].toString());

            return originalOpen.apply(this, args);
        });
    }
});
