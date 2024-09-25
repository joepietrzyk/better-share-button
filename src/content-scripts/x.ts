import {loadPreferences, UserPreferences, XPreference} from '../settings';
import {clipboardToast, isBrowser, isElement} from '../common';

// the CSS class used by dropdown menu items when hovered
const MENU_HOVER_CLASS = 'r-1cuuowz';
// the query selector used to find a post's link 
const POST_LINK_QUERY_SELECTOR = 'a[href][dir="ltr"]';
// the attribute used 
const BSB_SHARE_BUTTON_ATTRIBUTE = 'bsb-share-button';
// the query selector to find the dropdown menu
const DROPDOWN_QUERY_SELECTOR = 'div[data-testid="Dropdown"]';

if (isBrowser()) {
  loadPreferences().then(preferences => main(preferences));
}

/**
 * Main entry point functionality to execute once preferences are loaded.
 * Sets up a MutationObserver on the main element to detect when the DOM is ready.
 * @param preferences - The user's preferences for share button behavior.
 */
function main(preferences: UserPreferences)
{
  let href: string;

  const observer = new MutationObserver(mutationList => {
    mutationList.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (!isElement(node)) return;
        // check for each added post
        const article = node.getElementsByTagName('article');
        if (article.length > 0) {
          const svgs = article[0].getElementsByTagName('svg');
          if (svgs.length === 0) return;
          // the share button svg will be the last svg added to the article
          const shareSvg = svgs[svgs.length - 1];
          const shareButton = shareSvg.closest('button') as Element | undefined;
          if (!shareButton) return;
          shareButton.addEventListener('click', () => {
            const links = [...article[0].querySelectorAll(POST_LINK_QUERY_SELECTOR),].filter(link => {
              const href = link.getAttribute('href');
              return href && href.split('/').length > 1 && !href.includes('hashtag');
            });
            
            // if we're currently viewing a tweet instead of the feed, it won't have the href link
            if (links.length > 0) {
              href = links[0].getAttribute('href') || href;
            } else {
              href = window.location.href;
              href = href.replace('https://', '').replace('https://', '').replace('x.com', '')
                .replace('twitter.com','');
            }
          });
          // check for the share menu
        } else {
          const dropdown = node.querySelector(DROPDOWN_QUERY_SELECTOR);
          if (!dropdown) return;
          if (dropdown.querySelectorAll(`[${BSB_SHARE_BUTTON_ATTRIBUTE}]`).length !== 0) return;
          // grab the html of the existing Share button, as it'll be copied for our own share button
          const menuOptionHTML = dropdown.children[0].outerHTML;
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = menuOptionHTML;
          const newMenuItem = tempDiv.children[0];
          newMenuItem.setAttribute(BSB_SHARE_BUTTON_ATTRIBUTE, 'true');
          newMenuItem.addEventListener('mouseenter', () => {newMenuItem.classList.add(MENU_HOVER_CLASS);});
          newMenuItem.addEventListener('mouseleave', () => {newMenuItem.classList.remove(MENU_HOVER_CLASS);});
          const textNode = newMenuItem.children[1].getElementsByTagName('span')[0];
          textNode.textContent = 'Better share link';
          (newMenuItem as HTMLDivElement).addEventListener('click', event => {
            let url = 'https://' + window.location.hostname + href;
            url = convertXLink(url, preferences.x);
            const dropdownParent = dropdown.closest('[role="menu"]');
            (dropdownParent?.previousElementSibling?.previousElementSibling as HTMLElement | undefined)?.click();
            navigator.clipboard.writeText(url).then(() => {
              clipboardToast(event.clientX, event.clientY);
            });
          });
          dropdown.insertBefore(newMenuItem, dropdown.firstChild);
        }
      });
    });
  });

  observer.observe(document.body, {childList: true, subtree: true,});

}

/**
 * Converts a Twitter/X link based on the user's preference.
 * @param link - The original link to convert.
 * @param preference - The user's X preference for how to modify the link.
 * @returns The modified X link.
 */
export function convertXLink(link: string, preference: XPreference): string
{
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
 
