import {clipboardToast, isBrowser, isElement} from '../common';
import {loadPreferences, RedditPreference, UserPreferences} from '../settings';
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

  return { isNewReddit, isOldReddit, };
}

/**
 * Main entry point functionality to execute once preferences are loaded.
 * Determines if the current page is using old or new Reddit and attaches the necessary observers.
 * @param preferences - The user's preferences for share button behavior.
 */
function main(preferences: UserPreferences): void {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isNewReddit, isOldReddit, } = isNewOrOldReddit();

  if (isOldReddit) {
    const appBody = getAppBody();
    const observer = createEmbedButtonObserver(embedButton => {
      addShareButton(embedButton, 'right', event => {
        let url = getPostURL();
        url = convertToShareableURL(url, preferences.reddit);
         
        shareButtonClick(event, url).then();
      });
    });
    observer.observe(appBody, { childList: true, subtree: true, });
  }
}

/**
 * Retrieves the main application body element for observing mutations on Reddit.
 * If the specific content element is not found, it defaults to the entire document body.
 * @returns The main content element or the document body.
 */
export function getAppBody(): Element {
  let appBody = document.body.querySelector('.content[role="main"]');
  if (!appBody) {
    appBody = document.body;
  }
  return appBody;
}

/**
 * Creates a mutation observer that listens for the embed button
 * and attaches a share button next to the embed button on old Reddit.
 * @param onShareButtonFind - Event Listener for finding the embed button
 * @returns The configured mutation observer that attaches share buttons.
 */
export function createEmbedButtonObserver(onShareButtonFind: (embedButton: HTMLDivElement) => void) {
  return new MutationObserver((mutationsList: MutationRecord[]) => {
    mutationsList.forEach((mutation: MutationRecord) => {
      mutation.addedNodes.forEach(element => {
        if (!isElement(element)) return;
        const embedButtons = element.getElementsByClassName('post-sharing-option-embed');
        if (embedButtons.length === 0) return;
        const embedButton = embedButtons[0] as HTMLDivElement;
        onShareButtonFind(embedButton);
      });
    });
  });
}

/**
 * Adds the share button relative to its sibling. This is used in the old Reddit format.
 * @param siblingElement - The sibling element to add the share button next to.
 * @param position - The position to add the share button ('right' or 'left').
 * @param buttonClickListener - The event listener to add to the button's onClick event
 */
export function addShareButton(siblingElement: Element, position: 'right' | 'left', 
  buttonClickListener: (event: MouseEvent) => void): void {
  // create the button tooltip programmatically
  const shareButtonDiv = document.createElement('div');
  shareButtonDiv.className = 'bsb-post-sharing-option';
  let parent = shareButtonDiv;
  let el = document.createElement('div');
  el.classList.add('bsb-c-tooltip');
  el.setAttribute('role', 'tooltip');
  parent.appendChild(el);
  parent = el;
  el = document.createElement('div');
  el.classList.add('bsb-tooltip-arrow', 'bottom');
  parent.appendChild(el);
  el = document.createElement('div');
  el.classList.add('bsb-tooltip-inner');
  el.textContent = 'Better Embed Link';
  parent.appendChild(el);
  
  shareButtonDiv.addEventListener('click', buttonClickListener);
  if (position === 'right') {
    siblingElement.insertAdjacentElement('afterend', shareButtonDiv);
  } else if (position === 'left') {
    siblingElement.insertAdjacentElement('beforebegin', shareButtonDiv);
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
  case 'rxddit':
    newURL = url.replace('reddit.', 'rxddit.');
    break;
  case 'vxreddit':
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
 * @param url - the URL to write to the clipboard
 */
export async function shareButtonClick(event: MouseEvent, url: string): Promise<void> {
  const { clientX: x, clientY: y, } = event;
  await navigator.clipboard.writeText(url);
  clipboardToast(x, y);
}
