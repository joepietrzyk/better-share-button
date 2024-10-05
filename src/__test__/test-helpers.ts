import type { UserPreferences } from '../settings';

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

type storageChangeType = { [p: string]: browser.storage.StorageChange };
export type storageListener = (e: storageChangeType) => void;

/**
 * Define and mock the browser local storage out
 * @param preferences - the preferences to provide when you load from the storage
 * @param onSet - the event listener to call when the storage is set
 * @param onChangedListeners - event listeners for `browser.storage.local.onChanged` that you can track and invoke
 */
export function mockBrowserLocalStorage(
  preferences = {
    version: '1',
    reddit: 'rxddit',
    x: 'twittpr',
    instagram: 'ddinstagram',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  onSet?: (preferences: { preferences: UserPreferences }) => void,
  onChangedListeners?: storageListener[]
) {
  global.browser = {
    // @ts-ignore
    storage: {
      local: {
        get: jest.fn().mockImplementation(() =>
          Promise.resolve({
            preferences,
          })
        ),
        set: jest.fn().mockImplementation(pref => onSet?.(pref)),
        remove: jest.fn(),
        clear: jest.fn(),
        onChanged: {
          addListener: jest.fn().mockImplementation(listener => {
            if (onChangedListeners) onChangedListeners.push(listener);
          }),
          removeListener: jest.fn(),
          hasListener: jest.fn(),
        },
      },
    },
  };
}
