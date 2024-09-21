import {clipboardToast, isBrowser, isElement} from "../common";
import {UserPreferences, loadPreferences, RedditPreference} from "../settings";
import './reddit-styles.css';

// Run the main logic only when the script is executed directly
if (isBrowser()) {
  loadPreferences().then(preferences => main(preferences));
}

/**
 * Interface representing the result of determining whether the page is using new or old Reddit.
 */
interface RedditVersion {
    /**
     * Indicates if the current page is using new Reddit.
     */
    isNewReddit: boolean;

    /**
     * Indicates if the current page is using old Reddit.
     */
    isOldReddit: boolean;
}

/**
 * Determines if the current page is using new or old Reddit.
 * @returns An object indicating whether the page is new or old Reddit.
 */
export function isNewOrOldReddit(): RedditVersion {
  const hostName = window.location.hostname.split('.')[0];
  let isNewReddit = false;
  let isOldReddit = false;

  if (hostName === 'old') {
    isOldReddit = true;
  } else if (hostName === 'new') {
    isNewReddit = true;
  }

  // Check for new Reddit by presence of shreddit-app
  if (!isNewReddit && !isOldReddit) {
    const shredditAppEls = document.getElementsByTagName('shreddit-app');
    if (shredditAppEls && shredditAppEls.length > 0) {
      isNewReddit = true;
    } else {
      isOldReddit = true;
    }
  }

  return { isNewReddit, isOldReddit };
}

/**
 * Main entry point functionality to execute once preferences are loaded.
 * Determines if the current page is using old or new Reddit and attaches the necessary observers.
 * @param preferences - The user's preferences for share button behavior.
 */
function main(preferences: UserPreferences): void {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isNewReddit, isOldReddit } = isNewOrOldReddit();

  if (isOldReddit) {
    const observer = new MutationObserver((mutationsList: MutationRecord[]) => {
      mutationsList.forEach((mutation: MutationRecord) => {
        mutation.addedNodes.forEach((element: Node) => {
          if (isElement(element) && element.classList.contains('post-sharing')) {
            attachRecursiveObservers(element, preferences);
          }
        });
      });
    });
    const observerParameters = { childList: true, subtree: true };
    let appBody = document.querySelector('.content[role="main"]');
    if (!appBody) {
      appBody = document.body;
    }
    observer.observe(appBody, observerParameters);
  }
}

/**
 * Recursively attaches mutation observers to the given element and its children.
 * Observes for specific key elements (such as the share buttons or post-sharing containers),
 * and disconnects when the button is found.
 * @param element - The element to attach observers to.
 * @param preferences - The user's preferences for the share button behavior.
 */
function attachRecursiveObservers(element: Element, preferences: UserPreferences): void {
  if (!isElement(element)) {
    return;
  }

  if (element.classList.contains('post-sharing-option-embed')) {
    addShareButton(element, 'right', preferences);
    return;
  }

  const nestedObserver = new MutationObserver((nestedMutationsList: MutationRecord[]) => {
    nestedMutationsList.forEach((nestedMutation: MutationRecord) => {
      nestedMutation.addedNodes.forEach((nestedElement: Node) => {
        if (isElement(nestedElement)) {
          attachRecursiveObservers(nestedElement, preferences);
        }
      });
    });
  });

  nestedObserver.observe(element, {
    childList: true,
    subtree: true
  });

  const children = element.children;
  for (let i = 0; i < children.length; i++) {
    attachRecursiveObservers(children[i], preferences);
  }
}

/**
 * Adds the share button relative to its sibling. This is used in the old Reddit format.
 * @param siblingElement - The sibling element to add the share button next to.
 * @param position - The position to add the share button ('right' or 'left').
 * @param preferences - The user's preferences for the share button behavior.
 */
function addShareButton(siblingElement: Element, position: 'right' | 'left', preferences: UserPreferences): void {
  const htmlString = '<div class="bsb-c-tooltip" role="tooltip">' +
        '<div class="bsb-tooltip-arrow bottom"></div>' +
        '<div class="bsb-tooltip-inner">Better Embed Link</div></div>';
  const shareButtonDiv = document.createElement('div');
  shareButtonDiv.innerHTML = htmlString;
  shareButtonDiv.className = 'bsb-post-sharing-option';
  shareButtonDiv.addEventListener('click', event => {
    shareButtonClick(event, preferences);
  });
  if (position === 'right') {
    siblingElement.insertAdjacentElement('afterend', shareButtonDiv);
  } else if (position === 'left') {
    siblingElement.parentElement?.insertBefore(shareButtonDiv, siblingElement.firstChild);
  }
}

/**
 * Gets the URL of the Reddit post, either from the input field or the window location.
 * @returns The URL of the Reddit post.
 */
export function getPostURL(): string {
  const linkInputEl = document.body.getElementsByClassName('post-sharing-link-input')[0];
  let url: string | undefined;
  if (linkInputEl) {
    url = linkInputEl.getAttribute('value')?.toString();
    url = url?.split('?')[0];
  }
  if (!url) url = window.location.toString();
  url = url.replace('old.reddit.', 'reddit.');
  url = url.replace('new.reddit.', 'reddit.');
  return url;
}

/**
 * Converts the given Reddit URL to a shareable URL based on user preferences.
 * @param url - The original Reddit URL.
 * @param preference - The user's preferences for converting the URL.
 * @returns The converted, shareable URL.
 */
export function convertToShareableURL(url: string, preference: RedditPreference): string {
  let newURL: string;
  switch (preference) {
  case "rxddit":
    newURL = url.replace('reddit.', 'rxddit.');
    break;
  case "vxreddit":
    newURL = url.replace('reddit.', 'vxreddit.');
    break;
  default:
    newURL = url;
  }
  return newURL;
}

/**
 * Handles the behavior when the custom share button is clicked.
 * Converts the current post URL to a shareable URL based on the user's preferences,
 * copies the URL to the clipboard, and displays a toast notification anchored to the button element.
 * @param event - The mouse event triggering the click
 * @param preferences - The user's preferences for converting and sharing the URL, including specific platform settings.
 */
function shareButtonClick(event: MouseEvent, preferences: UserPreferences): void {
  const { clientX: x, clientY: y } = event;
  let url = getPostURL();
  url = convertToShareableURL(url, preferences.reddit);
  navigator.clipboard.writeText(url).then(() => {
    clipboardToast(x, y);
  });
}
