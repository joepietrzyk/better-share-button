import {loadPreferences, UserPreferences, XPreference} from '../settings';
import {clipboardToast, isBrowser, isElement} from '../common';

// the CSS class used by dropdown menu items when hovered
const MENU_HOVER_CLASS = 'r-1cuuowz';
// the attribute used 
const BSB_SHARE_BUTTON_ATTRIBUTE = 'bsb-share-button';

if (isBrowser()) {
  loadPreferences().then(preferences => main(preferences));
}

/**
 * Main entry point functionality to execute once preferences are loaded.
 * Sets up a MutationObserver on the main element to detect when the DOM is ready.
 * @param preferences - The user's preferences for share button behavior.
 */
function main(preferences: UserPreferences) {
  let link = '';
  const observer = createTweetObserver((article) => {
    handleTweet(article, () => {
      link = getLinkFromArticle(article);
    });
  }, dropdown => {
    const topMenuItem = dropdown.children[0];
    const bsb = createShareButtonByCopying(topMenuItem);
    attachToDropdown(dropdown, bsb, (event) => {
      shareButtonClick(event,  link, dropdown, preferences);
    });
  });
  observer.observe(document.body, {childList: true, subtree: true,});
}

/**
 * Creates a MutationObserver that watches for added nodes and detects tweets and dropdowns.
 * @param onTweetAdd - callback to be invoked when a tweet is added
 * @param onDropdownAdd - callback to be invoked when a dropdown is added
 * @returns A MutationObserver that observes the DOM for changes.
 */
export function createTweetObserver(onTweetAdd: (article: Element) => void, 
  onDropdownAdd: (dropdown: Element) => void): MutationObserver {
  return new MutationObserver(mutationList => {
    mutationList.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (!isElement(node)) return;
        // check for each added post
        const article = node.getElementsByTagName('article');
        if (article.length > 0) {
          onTweetAdd(article[0]);
          // check for the share menu
        } else {
          const dropdown = getDropdown(node);
          if (dropdown == null) return;
          onDropdownAdd(dropdown);
        }
      });
    });
  });
}

/**
 * Handles the click event of the share button, copies the modified link to the clipboard,
 * and displays a toast notification.
 * @param event - The mouse click event.
 * @param link - The link to be shared.
 * @param dropdown - The dropdown element.
 * @param preferences - The user's preferences.
 * @returns A promise that resolves once the share action completes.
 */
export async function shareButtonClick(event: MouseEvent, link: string, dropdown: Element,
  preferences: UserPreferences): Promise<void> {
  link = convertXLink(link, preferences.x);
  const dropdownParent = dropdown.closest('[role="menu"]');
  (dropdownParent?.previousElementSibling?.previousElementSibling as HTMLElement | undefined)?.click();
  await navigator.clipboard.writeText(link);
  clipboardToast(event.clientX, event.clientY);
}

/**
 * Extracts the link from a tweet article element.
 * @param article - The article element containing the tweet.
 * @returns The extracted link from the article.
 */
export function getLinkFromArticle(article: Element): string {
  let link = '';
  const links = [...article.querySelectorAll('a[href][dir="ltr"]'),].filter(link => {
    const href = link.getAttribute('href');
    // filter on href attributes that contain more than one / and exclude the text 'hashtag'
    return href && href.split('/').length > 1 && !href.includes('hashtag');
  });
  // if we're currently viewing a tweet instead of the feed, it won't have the href link
  if (links.length > 0) {
    link = links[0].getAttribute('href') || link;
    link = 'https://' + window.location.hostname + link;
  } else {
    link = window.location.href;
  }
  
  return link;
}

/**
 * Creates a new share button by copying an existing element.
 * @param elementToCopy - The element to copy.
 * @returns A new share button element.
 */
export function createShareButtonByCopying(elementToCopy: Element): Element {
  const menuOptionHTML = elementToCopy.outerHTML;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = menuOptionHTML;
  const newMenuItem = tempDiv.children[0];
  newMenuItem.setAttribute(BSB_SHARE_BUTTON_ATTRIBUTE, 'true');
  newMenuItem.addEventListener('mouseenter', () => {
    newMenuItem.classList.add(MENU_HOVER_CLASS);
  });
  newMenuItem.addEventListener('mouseleave', () => {
    newMenuItem.classList.remove(MENU_HOVER_CLASS);
  });
  const textNode = newMenuItem.children[1].getElementsByTagName('span')[0];
  textNode.textContent = 'Better share link';
  
  return newMenuItem;
}

/**
 * Gets the dropdown menu element from the parent.
 * @param parent - The parent element.
 * @returns The dropdown element or null if not found.
 */
export function getDropdown(parent: Element): Element | null {
  const dropdown = parent.querySelector('div[data-testid="Dropdown"]');
  if (!dropdown) return null;
  if (dropdown.querySelectorAll(`[${BSB_SHARE_BUTTON_ATTRIBUTE}]`).length !== 0) return null;
  return dropdown;
}

/**
 * Attaches the share button to the dropdown menu.
 * @param dropdown - The dropdown element.
 * @param bsb - The share button element.
 * @param onClickHandler - The click event handler for the share button.
 */
export function attachToDropdown(dropdown: Element, bsb: Element, onClickHandler: (event: MouseEvent) => void) {
  (bsb as HTMLDivElement).addEventListener('click', onClickHandler);
  dropdown.insertBefore(bsb, dropdown.firstChild);
}

/**
 * Attaches a click event handler to the tweet's share button.
 * @param article - The tweet article element.
 * @param shareButtonClick - The click event handler for the share button.
 */
function handleTweet(article: Element, shareButtonClick: (event: Event) => void) {
  const svgs = article.getElementsByTagName('svg');
  if (svgs.length === 0) return;
  // the share button svg will be the last svg added to the article
  const shareSvg = svgs[svgs.length - 1];
  const shareButton = shareSvg.closest('button') as Element | undefined;
  if (!shareButton) return;
  shareButton.addEventListener('click', shareButtonClick);
}

/**
 * Converts a Twitter/X link based on the user's preference.
 * @param link - The original link to convert.
 * @param preference - The user's X preference for how to modify the link.
 * @returns The modified X link.
 */
export function convertXLink(link: string, preference: XPreference): string {
  let url = link.replace('twitter.com', 'x.com');
  switch (preference) {
  case 'fixupx':
    url = url.replace('x.com', 'fixupx.com');
    break;
  case 'fxtwitter':
    url = url.replace('x.com', 'fxtwitter.com');
    break;
  case 'twittpr':
    url = url.replace('x.com', 'twittpr.com');
    break;
  case 'vxtwitter':
    url = url.replace('x.com', 'vxtwitter.com');
    break;
  default:
    return link;
  }
  
  return url;
}
