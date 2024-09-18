import {isBrowser, isElement} from "../common";

// Run the main logic only when the script is executed directly
if (isBrowser()) {
    console.log('Is browser!');
    main();
}

/**
 * main entry point functionality to execute
 */
function main(): void {
    const hostName = window.location.hostname.split('.')[0];
    let isNewReddit = false;
    let isOldReddit = false;
    if (hostName === 'old') isOldReddit = true;
    else if (hostName === 'new') isNewReddit = true;

    // determine if new or old reddit
    if (!isNewReddit && !isOldReddit) {
        const shredditAppEls = document.getElementsByTagName('shreddit-app');
        if (shredditAppEls && shredditAppEls.length > 0) {
            isNewReddit = true;
        } else {
            isOldReddit = true;
        }
    }

    if (isOldReddit) {
        const observer = new MutationObserver((mutationsList) => {
            mutationsList.forEach((mutation) => {
                mutation.addedNodes.forEach((element) => {
                    if (isElement(element) && element.classList.contains('post-sharing')) {
                        const shareButtonEls = document.getElementsByClassName('post-sharing-option');
                        if (shareButtonEls && shareButtonEls.length > 0) {
                            const sibling = shareButtonEls[shareButtonEls.length - 1];
                            addShareButton(sibling, 'right');
                        }
                    }
                });
            });
        });
        const observerParameters = {childList: true, subtree: true};
        const topMatter = document.getElementsByClassName('top-matter')[0];
        if (topMatter) {
            observer.observe(topMatter, observerParameters);
        } else {
            const postEls = document.body.getElementsByClassName('entry unvoted');
            for (const postEl of postEls)
            {
                observer.observe(postEl, observerParameters);
            }
        }
    } else if (isNewReddit) {
        console.log('It\'s new reddit.');
    }
}

/**
 * Adds the share button relative to its sibling. This is used in old reddit format
 * @param siblingElement the sibling element to add the share button to
 * @param position what position to add the share button to
 */
function addShareButton(siblingElement: Element, position: 'right' | 'left'): void {
    const htmlString = '<div class="c-tooltip" role="tooltip">' +
        '<div class="tooltip-arrow bottom"></div>' +
        '<div class="tooltip-inner">Better Embed Link</div></div>';
    const shareButtonDiv = document.createElement('div');
    shareButtonDiv.innerHTML = htmlString;
    shareButtonDiv.className = 'post-sharing-option better-share-button';
    shareButtonDiv.addEventListener('click', shareButtonClick);
    if (position === 'right') {
        siblingElement.insertAdjacentElement('afterend', shareButtonDiv);
        console.log(shareButtonDiv);
    } else if (position === 'left') {
        siblingElement.parentElement?.insertBefore(shareButtonDiv, siblingElement.firstChild);
    }
}

/**
 * Gets the URL of the reddit post
 * @returns the URL of the reddit post
 */
export function getPostURL(): string {
    const linkInputEl = document.body.getElementsByClassName('post-sharing-link-input')[0];
    let url: string | undefined;
    if (linkInputEl) {
        url = linkInputEl.getAttribute('value')?.toString();
        url = url?.split('?')[0];
    }
    if (!url) url = window.location.toString();
    // TODO: get the URL from the input text box
    url = url.replace('old.reddit.', 'reddit.');
    url = url.replace('new.reddit.', 'reddit.');
    return url.replace('reddit.', 'vxreddit.');
}

/**
 * The behavior for when the custom share button is clicked
 */
function shareButtonClick() {
    const url = getPostURL();
    navigator.clipboard.writeText(url).then(() => {
        console.log('Copied ' + url + ' to clipboard!');
    });
}
