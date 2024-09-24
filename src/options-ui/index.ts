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
  for (const preferenceKey of Object.keys(preferences) as (keyof UserPreferences)[]) {
    const select = document.body.querySelector(`#${preferenceKey}`) as HTMLSelectElement | null;
    if (!select) continue;

    // Set the select value based on the loaded preferences.
    select.value = preferences[preferenceKey] as string;

    // Add event listener to save the updated preference when changed.
    select.addEventListener('change', async () => {
      preferences[preferenceKey] = select.value as never; // Safely update the preference.
      await savePreferences();
    });
  }
  document.body.querySelector('#loading')?.classList.add('hidden');
  document.body.querySelector('#settings')?.classList.remove('hidden');
}
