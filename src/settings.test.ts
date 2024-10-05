import type { UserPreferences } from './settings';
import { mockBrowserLocalStorage, storageListener } from './__test__/test-helpers';

describe('onPreferenceUpdate', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should invoke the listener when the preferences are updated', async () => {
    const listeners: storageListener[] = [];
    mockBrowserLocalStorage({}, pref => (expectedSettings = pref.preferences), listeners);
    const settings = await import('./settings');
    let actualSettings: UserPreferences | null = null;
    let expectedSettings = settings.defaultPreferences();
    settings.onPreferenceUpdate(pref => {
      actualSettings = pref;
    });
    expectedSettings.x = 'twittpr';
    listeners[0]!({ preferences: { newValue: expectedSettings } });
    expect(actualSettings).not.toBeNull();
    expect(actualSettings!.x).toEqual(expectedSettings.x);
  });
});

describe('removePreferenceUpdateListener', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should not invoke the listener when preferences are updated', async () => {
    const listeners: storageListener[] = [];
    mockBrowserLocalStorage({}, pref => (expectedSettings = pref.preferences), listeners);
    const settings = await import('./settings');
    let actualSettings: UserPreferences | null = null;
    let expectedSettings = settings.defaultPreferences();
    const listener = (pref: UserPreferences) => {
      actualSettings = pref;
    };
    settings.onPreferenceUpdate(listener);
    settings.removePreferenceUpdateListener(listener);
    expectedSettings.x = 'twittpr';
    listeners[0]!({ preferences: { newValue: expectedSettings } });
    expect(actualSettings).toBeNull();
  });
});

describe('defaultPreferences', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should return a valid UserSettings object with the expected defaults', async () => {
    mockBrowserLocalStorage();
    const settings = await import('./settings');
    const preferences = settings.defaultPreferences();
    expect(preferences.version).toBe('1');
    expect(preferences.reddit).toBe('vxreddit');
    expect(preferences.x).toBe('fixupx');
    expect(preferences.instagram).toBe('ddinstagram');
  });
});

describe('loadPreferences', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should load the user preferences from localStorage', async () => {
    mockBrowserLocalStorage();
    const settings = await import('./settings');
    const preferences = await settings.loadPreferences();
    expect(preferences.version).toBe('1');
    expect(preferences.reddit).toBe('rxddit');
    expect(preferences.x).toBe('twittpr');
    expect(preferences.instagram).toBe('ddinstagram');
  });

  it('should use the default preferences if none are found', async () => {
    mockBrowserLocalStorage({});
    const settings = await import('./settings');
    const preferences = await settings.loadPreferences();
    expect(preferences.version).toBe('1');
    expect(preferences.reddit).toBe('vxreddit');
    expect(preferences.x).toBe('fixupx');
    expect(preferences.instagram).toBe('ddinstagram');
  });

  it('should use the default preferences if bad preferences are found', async () => {
    mockBrowserLocalStorage({ preferences: { stuff: 'lol' } });
    const settings = await import('./settings');
    const preferences = await settings.loadPreferences();
    expect(preferences.version).toBe('1');
    expect(preferences.reddit).toBe('vxreddit');
    expect(preferences.x).toBe('fixupx');
    expect(preferences.instagram).toBe('ddinstagram');
  });

  it('should listen to updates to the settings and apply them when loaded', async () => {
    const listeners: storageListener[] = [];
    mockBrowserLocalStorage({}, pref => (mySettings = pref.preferences), listeners);
    const settings = await import('./settings');
    let mySettings = settings.defaultPreferences();
    expect(listeners.length).not.toBe(0);
    listeners[0]!({ preferences: { newValue: { ...mySettings, x: 'vxtwitter' } } });
    mySettings = await settings.loadPreferences();
    expect(mySettings.x).toBe('vxtwitter');
  });
});

describe('savePreferences', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should save preferences to localStorage', async () => {
    let preferences: UserPreferences | null = null;
    mockBrowserLocalStorage({}, pref => {
      preferences = pref.preferences;
    });
    const settings = await import('./settings');
    await settings.savePreferences(settings.defaultPreferences());
    expect(preferences).not.toBeNull();
    expect(preferences!.version).toBeTruthy();
    expect(preferences!.reddit).toBeTruthy();
    expect(preferences!.x).toBeTruthy();
    expect(preferences!.instagram).toBeTruthy();
  });
});
