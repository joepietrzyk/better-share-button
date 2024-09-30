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
