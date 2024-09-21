import {vi} from 'vitest';

/**
 * Mocks the `window.location` object with the specified URL for unit testing.
 * This function uses Vitest's `vi.stubGlobal` to temporarily replace `window.location`.
 * @param url - The URL to set as the mocked `window.location`.
 * @example
 * // Mock the window.location to a specific URL
 * mockWindowURL('https://example.com/test');
 *
 * // Remember to restore the original `window.location` after the test
 * vi.restoreAllMocks(); 
 */
export function mockWindowURL(url: string): void {
  const mockedLocation = new URL(url);

  vi.stubGlobal('window', {
    location: mockedLocation,
  });
}
