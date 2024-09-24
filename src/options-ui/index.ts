import {loadPreferences, savePreferences, UserPreferences} from "../settings";
import {isBrowser} from "../common";
import "./options.css";

if (isBrowser()) {
  loadPreferences().then(preferences => main(preferences));
}

/**
 * Main function that handles loading user preferences and binding them to the options UI.
 * It listens for changes in the preferences and saves them.
 * @param preferences - The user's preferences loaded from storage.
 */
function main(preferences: UserPreferences)
{
  for (const preference in preferences) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = preferences as any;
    const select = document.body.querySelector(`#${preference}`) as HTMLSelectElement | null;
    if (!select) continue;
    select.value = p[preference];
    select.addEventListener('change', async () => {
      p[preference] = select.value;
      await savePreferences();
    });
  }
  document.body.querySelector('#loading')?.classList.add('hidden');
  document.body.querySelector('#settings')?.classList.remove('hidden');
}
