import { loadPreferences, XPreference } from '../settings';
import { clipboardToast, isBrowser, isElement } from '../common';

// the CSS class used by dropdown menu items when hovered
export const MENU_HOVER_CLASS = 'r-1cuuowz';
// the attribute used
export const BSB_SHARE_BUTTON_ATTRIBUTE = 'bsb-share-button';

if (isBrowser()) {
  main();
}

/**
 * Main entry point functionality to execute once preferences are loaded.
 * Sets up a MutationObserver on the main element to detect when the DOM is ready.
 */
export function main() {
  let link = '';
  const observer = createTweetObserver(
    article => {
      const shareButton = findShareButton(article);
      shareButton?.addEventListener('click', () => {
        link = getLinkFromArticle(article);
      });
    },
    dropdown => {
      if (link !== '') {
        const bsb = createShareButton();
        (bsb as HTMLDivElement).addEventListener('click', async event => {
          const preferences = await loadPreferences();
          const convertedLink = convertXLink(link, preferences.x);
          shareButtonClick(event, convertedLink, dropdown).then();
        });
        attachToDropdown(dropdown, bsb);
      }
    },
    () => {
      link = '';
    }
  );
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Creates a MutationObserver that watches for added nodes and detects tweets and dropdowns.
 * @param onTweetAdd - callback to be invoked when a tweet is added
 * @param onDropdownAdd - callback to be invoked when a dropdown is added
 * @param onDropdownRemove - callback to be invoked with a dropdown is removed
 * @returns A MutationObserver that observes the DOM for changes.
 */
export function createTweetObserver(
  onTweetAdd: (article: Element) => void,
  onDropdownAdd: (dropdown: Element) => void,
  onDropdownRemove?: () => void | null
): MutationObserver {
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
      if (onDropdownRemove) {
        mutation.removedNodes.forEach(node => {
          if (!isElement(node)) return;
          const bsbButton = node.querySelector(`[${BSB_SHARE_BUTTON_ATTRIBUTE}]`);
          if (bsbButton) onDropdownRemove();
        });
      }
    });
  });
}

/**
 * Handles the click event of the share button, copies the modified link to the clipboard,
 * and displays a toast notification.
 * @param event - The mouse click event.
 * @param link - The link to be shared.
 * @param dropdown - The dropdown element.
 * @returns A promise that resolves once the share action completes.
 */
export async function shareButtonClick(event: MouseEvent, link: string, dropdown: Element): Promise<void> {
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
  const linkFormat = /\/[^/]+\/status\/\d+$/;
  let link = '';
  const links = [...article.querySelectorAll('a[href][dir="ltr"]')].filter(a => {
    const href = a.getAttribute('href');
    // filter on href attributes that contain more than one / and exclude the text 'hashtag'
    return href && linkFormat.test(href);
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
 * Creates the Share button. Right now it's just a copy of the existing 'Copy Link' button on twitter.
 * @returns the Share Button Element with no events added
 */
export function createShareButton(): Element {
  const menuItemDiv = document.createElement('div');
  menuItemDiv.setAttribute('role', 'menuitem');
  menuItemDiv.setAttribute('tabindex', '0');
  menuItemDiv.setAttribute(
    'class',
    'css-175oi2r r-1loqt21 r-18u37iz r-1mmae3n r-3pj75a r-13qz1uu r-o7ynqc r-6416eg r-1ny4l3l'
  );
  menuItemDiv.setAttribute('bsb-share-button', 'true');
  const firstInnerDiv = document.createElement('div');
  firstInnerDiv.setAttribute('class', 'css-175oi2r r-1777fci r-faml9v');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-lrvibr r-m6rgpd r-1nao33i r-1q142lx');
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute(
    'd',
    'M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 ' +
      '0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 ' +
      '7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 ' +
      '1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z'
  );
  g.appendChild(p);
  svg.appendChild(g);
  firstInnerDiv.appendChild(svg);
  const secondInnerDiv = document.createElement('div');
  secondInnerDiv.setAttribute('class', 'css-175oi2r r-16y2uox r-1wbh5a2');
  const innermostDiv = document.createElement('div');
  innermostDiv.setAttribute('dir', 'ltr');
  innermostDiv.setAttribute('class', 'css-146c3p1 r-bcqeeo r-1ttztb7 r-qvutc0 r-37j5jr r-a023e6 r-rjixqe r-b88u0q');
  innermostDiv.style.textOverflow = 'unset';
  innermostDiv.style.color = 'rgb(231, 233, 234)';
  const span = document.createElement('span');
  span.setAttribute('class', 'css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3');
  span.style.textOverflow = 'unset';
  span.textContent = 'Better share link';
  innermostDiv.appendChild(span);
  secondInnerDiv.appendChild(innermostDiv);
  menuItemDiv.appendChild(firstInnerDiv);
  menuItemDiv.appendChild(secondInnerDiv);
  menuItemDiv.addEventListener('mouseenter', () => {
    menuItemDiv.classList.add(MENU_HOVER_CLASS);
  });
  menuItemDiv.addEventListener('mouseleave', () => {
    menuItemDiv.classList.remove(MENU_HOVER_CLASS);
  });

  return menuItemDiv;
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
 */
export function attachToDropdown(dropdown: Element, bsb: Element) {
  dropdown.insertBefore(bsb, dropdown.firstChild);
}

/**
 * Finds the tweet's share button if it exists
 * @param article - The tweet article element.
 * @returns The share button if it exists
 */
export function findShareButton(article: Element): Element | null {
  const svgs = article.getElementsByTagName('svg');
  if (svgs.length === 0) return null;
  // the share button svg will be the last svg added to the article
  const shareSvg = svgs[svgs.length - 1];
  return (shareSvg.closest('button') as Element) || null;
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
