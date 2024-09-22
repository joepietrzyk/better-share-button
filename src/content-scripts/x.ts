// Run the main logic only when the script is executed directly
import {loadPreferences, UserPreferences} from "../settings";
import {isBrowser} from "../common";

if (isBrowser()) {
  loadPreferences().then(preferences => main(preferences));
}

/**
 *
 * @param preferences
 */
function main(preferences: UserPreferences)
{
    
}
