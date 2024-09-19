export type RedditPreference = 'rxddit' | 'vxreddit';
export type XPreference = 'fixupx';
export type TwitterPreference = 'fxtwitter' | 'twittpr' | 'vxtwitter';
export type InstagramPreference = 'ddinstagram';
type PreferenceOverride<T> = 'default' | T;

interface BSBPreferences { 
        version: string;
}

interface BSBPreferences_v1 extends BSBPreferences {
    version: '1',
    reddit: RedditPreference,
    x: XPreference,
    twitter: TwitterPreference,
    instagram: InstagramPreference,
}

export type UserPreferences = BSBPreferences_v1;
const CURRENT_VERSION = '1';

/**
 * Determines if the object is a preferences file of the current version
 * @param preferences The object we're checking
 * @returns true if the object is a Preferences object of the current version
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPreferencesCurrentVersion(preferences: any): preferences is UserPreferences
{
    return (preferences && preferences.version && preferences.version === CURRENT_VERSION);
}

/**
 * Creates a new preferences object from the defaults
 * @returns a preferences object from defaults
 */
function defaultPreferences(): UserPreferences {
    return {
        version: '1',
        reddit: 'vxreddit',
        x: 'fixupx',
        twitter: 'fxtwitter',
        instagram: 'ddinstagram',
    };
}

let preferences: UserPreferences | null;

/**
 * Loads the preferences
 * @returns a Promise containing the preferences
 */
export async function loadPreferences(): Promise<UserPreferences> {
    if (preferences) return preferences;
    const results = await browser.storage.local.get('preferences');
    if (results.preferences) {
        preferences = results.preferences;
        if (isPreferencesCurrentVersion(preferences)) {
            return preferences;
        } 
    }
    preferences = defaultPreferences();
    await savePreferences();
    return defaultPreferences();
}

/**
 * Saves the current preferences
 */
export async function savePreferences(): Promise<void> {
    if (!preferences) return;
    await browser.storage.local.set({preferences: preferences});
}
