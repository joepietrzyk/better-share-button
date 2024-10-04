export type RedditPreference = 'rxddit' | 'vxreddit';
export type XPreference = 'fixupx' | 'fxtwitter' | 'twittpr' | 'vxtwitter';
export type InstagramPreference = 'ddinstagram';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type PreferenceOverride<T> = 'default' | T;

/**
 * Base interface representing the common structure of all preference versions.
 */
interface BSBPreferences {
  /**
   * Version of the preferences format.
   */
  version: string;
}

/**
 * Interface representing the preferences structure for version 1.
 */
interface BSBPreferences_v1 extends BSBPreferences {
  /**
   * Version identifier for v1 preferences.
   */
  version: '1';
  /**
   * User's preference for Reddit domains.
   */
  reddit: RedditPreference;
  /**
   * User's preference for X (formerly known as Twitter) domains.
   */
  x: XPreference;
  /**
   * User's preference for Instagram domains.
   */
  instagram: InstagramPreference;
}

/**
 * Type representing user preferences based on the current version.
 */
export type UserPreferences = BSBPreferences_v1;

const CURRENT_VERSION = '1';

/**
 * Determines if the object is a preferences file of the current version.
 * @param preferences - The object to check.
 * @returns True if the object is a valid `UserPreferences` object of the current version.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPreferencesCurrentVersion(preferences: any): preferences is UserPreferences {
  return preferences && preferences.version && preferences.version === CURRENT_VERSION;
}

/**
 * Creates a new preferences object with default values.
 * @returns A new `UserPreferences` object with default settings.
 */
export function defaultPreferences(): UserPreferences {
  return {
    version: '1',
    reddit: 'vxreddit',
    x: 'fixupx',
    instagram: 'ddinstagram',
  };
}

type preferenceUpdateListener = (newPref: UserPreferences) => void;
const preferenceUpdates: preferenceUpdateListener[] = [];

let preferences: UserPreferences | null = null;
browser.storage.local.onChanged.addListener(event => {
  if (event.preferences && event.preferences.newValue && isPreferencesCurrentVersion(event.preferences.newValue)) {
    preferences = event.preferences.newValue;
    preferenceUpdates.forEach(preferenceUpdate => preferenceUpdate(preferences!));
  }
});

/**
 * Listens for preference updates
 * @param listener - listener for receiving preference updates
 */
export function onPreferenceUpdate(listener: preferenceUpdateListener) {
  preferenceUpdates.push(listener);
}

/**
 * Stops listening to preference updates
 * @param listener - the listener to remove
 */
export function removePreferenceUpdateListener(listener: preferenceUpdateListener) {
  for (let i = 0; i < preferenceUpdates.length; i++) {
    // eslint-disable-next-line security/detect-object-injection
    if (preferenceUpdates[i] === listener) {
      if (i >= 0 && i < preferenceUpdates.length) {
        preferenceUpdates.splice(i, 1);
      }
    }
  }
}

/**
 * Loads the user's preferences from local storage.
 * If no preferences are found or the version is outdated, defaults are used.
 * @returns A `Promise` that resolves to the loaded or default `UserPreferences`.
 */
export async function loadPreferences(): Promise<UserPreferences> {
  if (preferences) return preferences;
  const results = await browser.storage.local.get('preferences');
  if (results.preferences) {
    const newPreferences = results.preferences;
    if (newPreferences && isPreferencesCurrentVersion(newPreferences)) {
      preferences = newPreferences;
      return newPreferences;
    }
    preferences = defaultPreferences();
  } else {
    preferences = defaultPreferences();
    await savePreferences(preferences);
  }
  return preferences as UserPreferences;
}

/**
 * Saves the current preferences to local storage.
 * If preferences are not set, the function does nothing.
 * @param preferences the preferences to save
 * @returns A `Promise` that resolves when the preferences are saved.
 */
export async function savePreferences(preferences: UserPreferences): Promise<void> {
  await browser.storage.local.set({ preferences });
}
