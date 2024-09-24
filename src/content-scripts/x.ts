import {loadPreferences, UserPreferences, XPreference} from "../settings";
import {clipboardToast, isBrowser, isElement} from "../common";
import './x-styles.css';

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
  const mainEl = document.body.getElementsByTagName('main')[0];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const observer = new MutationObserver(mutationList => {
    observer.disconnect();
    afterLoading(preferences);
  });
  observer.observe(mainEl, { childList: true, subtree: true });
}

/**
 * Adds mutation observers to track tweets being added to the feed,
 * and attaches a custom share button to the Twitter/X share menu.
 * @param preferences - The user's preferences for share button behavior.
 */
function afterLoading(preferences: UserPreferences) {
  // the list of all elements that match the selector of your feed
  const feedEls = [...document.querySelectorAll('div[aria-label].css-175oi2r')];
  // the filtered down element that represents the feed
  const feedEl = feedEls.filter(e => e.classList.length === 1)[0];
  const observer = new MutationObserver(mutationList => {
    mutationList.forEach(mutation => {
      mutation.addedNodes.forEach(addedNode => {
        // see if the addedNode is a tweet, if it is, add an event listener to the share button
        if (isElement(addedNode)) {
          // each post on your feed is represented by an article node
          const feedNodes = addedNode.getElementsByTagName('article');
          [...feedNodes].forEach(child => {
            // the share button is deeply nested in the article parent, this searches for its selector
            const buttonEls = child.querySelectorAll('div.css-175oi2r[style]');
            // the shareButton will be the very last element that matches the selector
            const shareButton = buttonEls[buttonEls.length - 1];
            if (shareButton) {
              shareButton.addEventListener('click', clickOnPostEvent => {
                // wait a frame for the menu to appear
                setTimeout(() => {
                  // grab the share menu by its selector
                  const shareMenu = document.body.querySelector('div[data-testid="Dropdown"]');
                  // make sure we didn't already add our menu item
                  if (shareMenu?.querySelectorAll('[bsb-share-shareButton]').length === 0) {
                    // grab the html of the existing Share button, as it'll be copied for our own share button
                    const html = shareMenu.children[0].outerHTML;
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html;
                    const element = tempDiv.children[0];
                    // const hoverClass = 'r-1cuuowz'
                    element.setAttribute('bsb-share-shareButton', 'true');
                    element.addEventListener('mouseenter', () => {element.classList.add('r-1cuuowz');});
                    element.addEventListener('mouseleave', () => {element.classList.remove('r-1cuuowz');});
                    // change the text of our newly copied node
                    if (element && element.children[1]) {
                      const span = element.children[1].getElementsByTagName('span')[0];
                      if (span) {
                        span.textContent = 'Better share link';
                        (element as HTMLDivElement).addEventListener('click', event => {
                          // get the target of the initial share button click
                          const target = clickOnPostEvent.target;
                          if (target && target instanceof Element) {
                            // traverse up the tree to get the article
                            const targetEl = target as Element;
                            const parentEl = targetEl.closest('ARTICLE');
                            if (parentEl?.tagName === 'ARTICLE') {
                              // traverse back down the tree to find any links
                              const links = [...parentEl.querySelectorAll('a[href][dir="ltr"]')].filter(link => {
                                const href = link.getAttribute('href');
                                return href && href.split('/').length > 1 && !href.includes('hashtag');
                              });
                              if (links[0]) {
                                const href = links[0].getAttribute('href');
                                const hostName = window.location.hostname;
                                let url = 'https://' + hostName + href;
                                url = url.replace('twitter.com', 'x.com');
                                url = convertXLink(url, preferences.x);
                                navigator.clipboard.writeText(url).then(() => {
                                  clipboardToast(event.clientX, event.clientY);
                                  document.body.querySelector('main')?.click();
                                });
                              }
                            }
                          }
                        });
                        shareMenu.insertBefore(tempDiv.children[0], shareMenu.firstChild);
                      }
                    }
                  }
                }, 1);
              });
            }
          });
        } 
      });
    });
  });
  observer.observe(feedEl, { childList: true, subtree: true });
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
  case "fixupx":
    url = url.replace('x.com', 'fixupx.com');
    break;
  case "fxtwitter":
    url = url.replace('x.com', 'fxtwitter.com');
    break;
  case "twittpr":
    url = url.replace('x.com', 'twittpr.com');
    break;
  case "vxtwitter":
    url = url.replace('x.com', 'vxtwitter.com');
    break;
  default:
    return link;
  }
  
  return url;
}

// document.body.querySelectorAll('div[data-testid="Dropdown"]') <--- this is the dropdown menu
