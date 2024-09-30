import { loadPreferences, RedditPreference, savePreferences, UserPreferences, XPreference } from '../settings';
import { isBrowser } from '../common';
import './options.css';

if (isBrowser()) {
  loadPreferences().then(preferences => main(preferences));
}

/**
 * Main function that handles loading user preferences and binding them to the options UI.
 * It listens for changes in the preferences and saves them.
 * @param preferences - The user's preferences loaded from storage.
 */
function main(preferences: UserPreferences) {
  const redditEl = document.body.querySelector('#reddit');
  if (redditEl && redditEl instanceof HTMLSelectElement) {
    redditEl.addEventListener('change', async () => {
      preferences.reddit = redditEl.value as RedditPreference;
      await savePreferences();
    });
  }
  const xEl = document.body.querySelector('#x');
  if (xEl && xEl instanceof HTMLSelectElement) {
    xEl.addEventListener('change', async () => {
      preferences.x = xEl.value as XPreference;
      await savePreferences();
    });
  }

  document.body.querySelector('#loading')?.classList.add('hidden');
  document.body.querySelector('#settings')?.classList.remove('hidden');
}
