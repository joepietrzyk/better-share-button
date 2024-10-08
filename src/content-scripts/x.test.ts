﻿import {
  attachToDropdown,
  BSB_SHARE_BUTTON_ATTRIBUTE,
  convertXLink,
  createShareButton,
  createTweetObserver,
  findShareButton,
  getDropdown,
  getLinkFromArticle,
  main,
  MENU_HOVER_CLASS,
  shareButtonClick,
} from './x';
import { resolveOnNextFrame, stubClipboard } from '../__test__/test-helpers';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { defaultPreferences, XPreference } from '../settings';
import * as settings from '../settings';

const dropdownPath = path.resolve(__dirname, '__test__/dropdown.html');
const dropdownHTML = fs.readFileSync(dropdownPath, 'utf8');

describe('main', () => {
  function addArticle() {
    const div = document.createElement('div');
    div.innerHTML = `
        <article>
        <a href="/test/status/1" dir="ltr"></a>
        <button id="share-button">
            <svg></svg>
        </button>
        </article>`;
    document.body.appendChild(div);
    return resolveOnNextFrame();
  }

  function addShareMenu() {
    const div = document.createElement('div');
    div.innerHTML = `<div data-testid="Dropdown"></div>`;
    document.body.appendChild(div);
    return resolveOnNextFrame();
  }

  beforeEach(() => {
    document.body.innerHTML = '<body></body>';
  });

  it('should add a listener to the existing tweets', async () => {
    await addArticle();
    main();
    (document.body.querySelector('#share-button') as HTMLDivElement).click();
    await addShareMenu();
    const actualBsb = document.body.querySelector(`[${BSB_SHARE_BUTTON_ATTRIBUTE}]`);
    expect(actualBsb).not.toBeNull();
  });

  it('should add the Better Share Button when the share menu appears', async () => {
    main();
    await addArticle();
    (document.querySelector('#share-button') as HTMLDivElement).click();
    await addShareMenu();
    const actualBsb = document.body.querySelector(`[${BSB_SHARE_BUTTON_ATTRIBUTE}]`);
    expect(actualBsb).not.toBeNull();
  });

  it('should copy the URL to the clipboard when the Better Share Button is clicked', async () => {
    let clipboardText = '';
    const preferences = defaultPreferences();
    const loadPreferencesSpy = jest.spyOn(settings, 'loadPreferences').mockReturnValue(Promise.resolve(preferences));
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn((text: string) => {
          clipboardText = text;
          return Promise.resolve();
        }),
      },
      writable: true, // Allow overwriting if needed
    });
    main();
    await addArticle();
    (document.querySelector('#share-button') as HTMLDivElement).click();
    await addShareMenu();
    const actualBsb = document.body.querySelector(`[${BSB_SHARE_BUTTON_ATTRIBUTE}]`) as HTMLDivElement;
    actualBsb.click();
    await resolveOnNextFrame();
    loadPreferencesSpy.mockRestore();
    expect(clipboardText).toContain('/test/status/1');
  });
});

describe('createTweetObserver', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = '<head><title>Unit tests</title></head><body></body>';
  });

  it('should invoke the onTweetAdd callback when a tweet is added', async () => {
    let actualArticle: Element | null = null;
    const observer = createTweetObserver(
      article => {
        actualArticle = article;
      },
      () => {}
    );
    observer.observe(document.body, { childList: true, subtree: true });
    const div = document.createElement('div');
    div.innerHTML = '<article id="test"></article>';
    document.body.appendChild(div);
    await resolveOnNextFrame();
    observer.disconnect();
    expect(actualArticle!.tagName.toLowerCase()).toBe('article');
    expect(actualArticle!.id).toBe('test');
  });

  it('should invoke the onDropdownAdd callback when the dropdown menu is added', async () => {
    let actualDropdown: Element | null = null;
    const observer = createTweetObserver(
      () => {},
      dropdown => {
        actualDropdown = dropdown;
      }
    );
    observer.observe(document.body, { childList: true, subtree: true });
    const div = document.createElement('div');
    div.innerHTML = '<div data-testid="Dropdown"></div>';
    document.body.appendChild(div);
    await resolveOnNextFrame();
    observer.disconnect();
    expect(actualDropdown!.tagName.toLowerCase()).toBe('div');
    expect(actualDropdown!.getAttribute('data-testid')).toBe('Dropdown');
  });

  it('should invoke the onDropdownRemove callback when the Better Share Button is removed', async () => {
    let hasFired = false;
    const parent = document.createElement('div');
    const div = document.createElement('div');
    parent.appendChild(div);
    div.setAttribute(BSB_SHARE_BUTTON_ATTRIBUTE, 'true');
    document.body.appendChild(parent);
    const observer = createTweetObserver(
      () => {},
      () => {},
      () => {
        hasFired = true;
      }
    );
    observer.observe(document.body, { childList: true, subtree: true });
    parent.remove();
    await resolveOnNextFrame();
    expect(hasFired).toBe(true);
  });
});

describe('shareButtonClick', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = dropdownHTML;
  });

  it('should click off the menu to close the dropdown', async () => {
    stubClipboard();
    let hasClicked = false;
    const menuHider = document.body.querySelector('#menu-hider');
    menuHider!.addEventListener('click', () => {
      hasClicked = true;
    });
    const dropdown = document.body.querySelector('#dropdown')!;
    const mouseEvent = new MouseEvent('click');
    await shareButtonClick(mouseEvent, '', dropdown);
    expect(hasClicked).toBe(true);
  });

  it('should copy the link to the clipboard', () => {});

  it("should invoke clipboardToast with the cursor's x and y coordinates", () => {});
});

describe('getLinkFromArticle', () => {
  const expectedLink = 'https://x.com/test/status/1';
  const articleHTML =
    '<article>' +
    '<a dir="ltr" href="/test"></a>' +
    '<a dir="ltr" href="/hashtag/test-hashtag?src=hashtag_click"></a>' +
    '<a id="correct-link" dir="ltr" href="/test/status/1"></a>' +
    '<a dir="ltr" href="/test/status/1/hidden"></a>' +
    '</article>';
  beforeEach(() => {
    const div = document.createElement('div');
    div.innerHTML = articleHTML;
    document.documentElement.innerHTML = div.outerHTML;
  });

  it('should get a link that matches the pattern `/user/status/id` from your feed', () => {
    Object.defineProperty(global, 'location', {
      value: {
        href: 'https://x.com',
        protocol: 'https:',
        host: 'x.com',
        hostname: 'x.com',
        pathname: '',
      },
    });
    const article = document.body.getElementsByTagName('article')[0]!;
    const actualLink = getLinkFromArticle(article);
    expect(actualLink).toBe(expectedLink);
  });

  it("should use the window URL if you're viewing an image in an album", () => {
    const expectedLink = 'https://x.com/1/test/status/1/photo/1';
    Object.defineProperty(global, 'location', {
      value: {
        href: expectedLink,
      },
    });
    const actualLink = getLinkFromArticle(document.createElement('article'));
    expect(actualLink).toBe(expectedLink);
  });

  it("should use the window URL if you're viewing a video in an album", () => {
    const expectedLink = 'https://x.com/1/test/status/1/video/1';
    Object.defineProperty(global, 'location', {
      value: {
        href: expectedLink,
      },
    });
    const actualLink = getLinkFromArticle(document.createElement('article'));
    expect(actualLink).toBe(expectedLink);
  });

  it("should fall back to the window URL if it's unable to find it in the tweet", () => {
    Object.defineProperty(global, 'location', {
      value: {
        href: expectedLink,
        protocol: 'https:',
        host: 'x.com',
        hostname: 'x.com',
        pathname: '/test/status/1',
      },
    });
    const article = document.body.getElementsByTagName('article')[0]!;
    const correctLink = article.querySelector('#correct-link')!;
    correctLink.remove();
    const actualLink = getLinkFromArticle(article);
    expect(actualLink).toBe(expectedLink);
  });
});

describe('createShareButton', () => {
  it('should create a button with role="menuitem"', () => {
    const button = createShareButton();
    expect(button.getAttribute('role')).toBeTruthy();
    expect(button.getAttribute('role')).toBe('menuitem');
  });

  it('should add the hover style to the button when hovered and remove when the mouse moves away', () => {
    const button = createShareButton();
    const mouseenter = new MouseEvent('mouseenter', {
      bubbles: true,
      cancelable: true,
    });
    button.dispatchEvent(mouseenter);
    expect(button.classList).toContain(MENU_HOVER_CLASS);

    const mouseleave = new MouseEvent('mouseleave', {
      bubbles: true,
      cancelable: true,
    });
    button.dispatchEvent(mouseleave);
    expect(button.classList).not.toContain(MENU_HOVER_CLASS);
  });

  it('should include the icon svg', () => {
    const button = createShareButton();
    const svg = button.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it("should contain the text 'Better share link'", () => {
    const button = createShareButton();
    const textSpan = button.querySelector('span');
    expect(textSpan).not.toBeNull();
    expect(textSpan!.textContent).toBe('Better share link');
  });
});

describe('getDropdown', () => {
  beforeEach(() => {
    document.body.innerHTML = dropdownHTML;
  });

  it('should find the dropdown when present', () => {
    const dropdown = getDropdown(document.body);
    expect(dropdown).not.toBeNull();
    expect(dropdown!.tagName.toLowerCase()).toBe('div');
    const actualDataTestid = dropdown!.getAttribute('data-testid');
    expect(actualDataTestid).toBeTruthy();
    expect(actualDataTestid!.toLowerCase()).toBe('dropdown');
  });

  it('should ignore dropdowns with our custom attribute added', () => {
    const oldDropdownItem = document.body.querySelector('#dropdown')!.children[0]!;
    oldDropdownItem.setAttribute(BSB_SHARE_BUTTON_ATTRIBUTE, 'true');

    const actual = getDropdown(document.body);
    expect(actual).toBeNull();
  });
});

describe('attachToDropdown', () => {
  beforeEach(() => {
    document.body.innerHTML = dropdownHTML;
  });

  it('should attach the button to the top of the dropdown', () => {
    const button = document.createElement('div');
    button.id = 'my-button';
    const dropdown = document.body.querySelector('#dropdown')!;
    attachToDropdown(dropdown, button);
    const actualSibling = button.nextElementSibling;
    expect(actualSibling).not.toBeNull();
    expect(actualSibling!.id.toLowerCase()).toBe('first-item');
  });
});

describe('findShareButton', () => {
  it("should locate a tweet's share button via its SVG and return the parent button", () => {
    const html = '<article>' + '<button id="correct-button">' + '<svg></svg>' + '</button>' + '</article>';
    const div = document.createElement('div');
    div.innerHTML = html;

    const actualButton = findShareButton(div.children[0]);
    expect(actualButton).not.toBeNull();
    expect(actualButton!.id).toBe('correct-button');
  });

  it('should not locate any button except the share button', () => {
    const html =
      '<article>' +
      '<button id="wrong-button">' +
      '<svg></svg>' +
      '</button>' +
      '<button id="wrong-button-2">' +
      "<svg></svg>' +\n" +
      '</button>' +
      '<button id="correct-button">' +
      '<svg></svg>' +
      '</button>';
    const div = document.createElement('div');
    div.innerHTML = html;
    const actualButton = findShareButton(div.children[0]);
    expect(actualButton).not.toBeNull();
    expect(actualButton!.id).toBe('correct-button');
  });
});

describe('convertXLink', () => {
  const testHref = '/test/1';
  const testXInput = 'https://x.com' + testHref;
  const testTwitterInput = 'https://twitter.com' + testHref;

  it('should handle twitter.com and x.com URLs', () => {
    const actualXLink = convertXLink(testXInput, 'fixupx');
    const actualTwitterLink = convertXLink(testTwitterInput, 'fixupx');

    expect(actualXLink).toBe('https://fixupx.com' + testHref);
    expect(actualTwitterLink).toBe('https://fixupx.com' + testHref);
  });

  it("should use the hostname fixupx.com when the preference is 'fixupx'", () => {
    const actualXLink = convertXLink(testXInput, 'fixupx');
    expect(actualXLink).toBe('https://fixupx.com' + testHref);
  });

  it("should use the hostname fxtwitter.com when the preference is 'fxtwitter'", () => {
    const actualXLink = convertXLink(testXInput, 'fxtwitter');
    expect(actualXLink).toBe('https://fxtwitter.com' + testHref);
  });

  it("should use the hostname twittpr.com when the preference is 'twittpr'", () => {
    const actualXLink = convertXLink(testXInput, 'twittpr');
    expect(actualXLink).toBe('https://twittpr.com' + testHref);
  });

  it("should use the hostname vxtwitter.com when the preference is 'vxtwitter'", () => {
    const actualXLink = convertXLink(testXInput, 'vxtwitter');
    expect(actualXLink).toBe('https://vxtwitter.com' + testHref);
  });

  it('should return the regular URL when the preference is invalid', () => {
    const actualXLink = convertXLink(testXInput, 'fasdfd' as never as XPreference);
    expect(actualXLink).toBe(testXInput);
  });
});
