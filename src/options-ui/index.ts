import {
  loadPreferences,
  onPreferenceUpdate,
  RedditPreference,
  savePreferences,
  UserPreferences,
  XPreference,
} from '../settings';
import { isBrowser } from '../common';
import './options.css';

if (isBrowser()) {
  main().then();
}

/**
 * Main function that handles loading user preferences and binding them to the options UI.
 * It listens for changes in the preferences and saves them.
 */
async function main() {
  const preferences = await loadPreferences();
  const redditEl = document.body.querySelector('#reddit');
  if (redditEl && redditEl instanceof HTMLSelectElement) {
    redditEl.addEventListener('change', async () => {
      preferences.reddit = redditEl.value as RedditPreference;
      await savePreferences(preferences);
    });
  }
  const xEl = document.body.querySelector('#x');
  if (xEl && xEl instanceof HTMLSelectElement) {
    xEl.addEventListener('change', async () => {
      preferences.x = xEl.value as XPreference;
      await savePreferences(preferences);
    });
  }
  updatePageWithPreferences(preferences);
  onPreferenceUpdate(updatePageWithPreferences);
  document.body.querySelector('#loading')?.classList.add('hidden');
  document.body.querySelector('#settings')?.classList.remove('hidden');
}

/**
 * Updates the page with the new preferences
 * @param newPref - the new preferences to update to
 */
function updatePageWithPreferences(newPref: UserPreferences): void {
  const redditEl = document.body.querySelector('#reddit');
  if (redditEl && redditEl instanceof HTMLSelectElement && redditEl.value !== newPref.reddit) {
    redditEl.value = newPref.reddit;
  }

  const xEl = document.body.querySelector('#x');
  if (xEl && xEl instanceof HTMLSelectElement && xEl.value !== newPref.x) {
    xEl.value = newPref.x;
  }
}
