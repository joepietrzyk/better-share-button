/**
 * Returns a `Promise` that resolves on the next frame
 */
export function resolveOnNextFrame(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 0);
  });
}

/**
 * Stubs the clipboard for unit tests
 */
export function stubClipboard() {
  Object.defineProperty(global, 'navigator', {
    value: {
      clipboard: {
        writeText: jest.fn(),
      },
    },
    writable: true,
  });
}
