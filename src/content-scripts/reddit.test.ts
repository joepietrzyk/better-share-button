import {
  addShareButton,
  convertToShareableURL,
  createEmbedButtonObserver,
  getAppBody,
  getPostURL,
  isNewOrOldReddit,
  shareButtonClick,
} from './reddit';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as common from '../common';
import { resolveOnNextFrame } from '../test-helpers';

function mockRedditURL(newOrOld = '', pathname = '/r/funny') {
  // Mock the global location object
  Object.defineProperty(global, 'location', {
    value: {
      href: `https://${newOrOld}reddit.com${pathname}`,
      protocol: 'https:',
      host: `${newOrOld}reddit.com`,
      hostname: `${newOrOld}reddit.com`,
      pathname: pathname,
    },
    writable: true, // Make sure the mock can be updated during tests
  });
}

describe('isNewOrOldReddit', () => {
  test('should recognize the window URL as new.reddit.com', () => {
    mockRedditURL('new.');
    const actual = isNewOrOldReddit();
    expect(actual.isNewReddit).toBe(true);
    expect(actual.isOldReddit).toBe(false);
  });

  test('should recognize the window URL as old.reddit.com', () => {
    mockRedditURL('old.');
    const actual = isNewOrOldReddit();
    expect(actual.isNewReddit).toBe(false);
    expect(actual.isOldReddit).toBe(true);
  });

  test('should recognize new reddit html as new reddit', () => {
    mockRedditURL();
    document.body.innerHTML = '<shreddit-app></shreddit-app>';
    const actual = isNewOrOldReddit();
    expect(actual.isNewReddit).toBe(true);
    expect(actual.isOldReddit).toBe(false);
  });

  test('should treat all non-new reddit html as old reddit', () => {
    mockRedditURL();
    document.body.innerHTML = '<div>This is reddit!</div>';

    const actual = isNewOrOldReddit();
    expect(actual.isNewReddit).toBe(false);
    expect(actual.isOldReddit).toBe(true);
  });
});

describe('getAppBody', () => {
  test('should find the main body of the reddit app when present', () => {
    document.body.innerHTML = '<body><div class="body"></div><div class="content" role="main"></div></body>';
    const actualEl = getAppBody();
    const actualRole = actualEl.getAttribute('role');
    const actualClass = actualEl.getAttribute('class');
    expect(actualRole).toBe('main');
    expect(actualClass).toBe('content');
  });

  test("should fall back to the document body if the app body isn't found", () => {
    document.body.innerHTML = '<body></body>';
    const actualEl = getAppBody();
    const actualTagName = actualEl.tagName;
    expect(actualTagName.toLowerCase()).toBe('body');
  });
});

describe('createEmbedButtonObserver', () => {
  const EMBED_BUTTON_HTML =
    '<div class="post-sharing-option post-sharing-option-embed" data-post-sharing-option="embed">' +
    '<div class="c-tooltip" role="tooltip">' +
    '<div class="tooltip-arrow bottom"></div>' +
    '<div class="tooltip-inner">Embed Post</div>' +
    '</div>' +
    '</div>';
  beforeEach(() => {
    document.body.innerHTML = '<body></body>';
  });

  test('should create a MutationObserver', () => {
    const observer = createEmbedButtonObserver(() => {});
    expect(observer).not.toBeNull();
    expect(observer instanceof MutationObserver).toBe(true);
  });

  test('should invoke the callback when the embed button is added', async () => {
    let hasFired = false;
    const observer = createEmbedButtonObserver(() => {
      hasFired = true;
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const embedButtonParent = document.createElement('div');
    embedButtonParent.innerHTML = EMBED_BUTTON_HTML;
    document.body.appendChild(embedButtonParent);
    await resolveOnNextFrame();
    expect(hasFired).toBe(true);
    observer.disconnect();
  });

  test('should include the embed button when it invokes the callback', async () => {
    let actualEmbedButton: HTMLDivElement | null = null;
    const observer = createEmbedButtonObserver(embedButton => (actualEmbedButton = embedButton));
    observer.observe(document.body, { childList: true, subtree: true });
    const embedButtonParent = document.createElement('div');
    embedButtonParent.innerHTML = EMBED_BUTTON_HTML;
    document.body.appendChild(embedButtonParent);
    await resolveOnNextFrame();
    expect(actualEmbedButton).not.toBe(null);
    const actualTagName = actualEmbedButton!.tagName;
    const actualClassList = actualEmbedButton!.classList;
    expect(actualTagName.toLowerCase()).toBe('div');
    expect(actualClassList).toContain('post-sharing-option-embed');
    observer.disconnect();
  });
});

describe('addShareButton', () => {
  beforeEach(() => {
    document.body.innerHTML = '<body></body>';
  });

  test("should add the share button to the right of the provided element when passed 'right'", () => {
    const sibling = document.createElement('div');
    document.body.appendChild(sibling);
    addShareButton(sibling, 'right', () => {});
    const actual = document.body.children[1];
    expect(actual).not.toBe(null);
    const actualTagName = actual.tagName;
    const actualClassList = actual.classList;
    expect(actualTagName.toLowerCase()).toBe('div');
    expect(actualClassList).toContain('bsb-post-sharing-option');
  });

  test("should add the share button to the left of the provided element when passed 'left'", () => {
    const sibling = document.createElement('div');
    document.body.appendChild(sibling);
    addShareButton(sibling, 'left', () => {});
    const actual = document.body.children[0];
    expect(actual).not.toBe(null);
    const actualTagName = actual.tagName;
    const actualClassList = actual.classList;
    expect(actualTagName.toLowerCase()).toBe('div');
    expect(actualClassList).toContain('bsb-post-sharing-option');
  });

  test('should invoke the buttonClickListener when clicked', () => {
    let hasFired = false;
    const sibling = document.createElement('div');
    document.body.appendChild(sibling);
    addShareButton(sibling, 'right', () => {
      hasFired = true;
    });
    const actual = document.body.children[1];
    (actual as HTMLDivElement).click();
    expect(hasFired).toBe(true);
  });
});

describe('convertToShareableURL', () => {
  beforeAll(() => {
    mockRedditURL();
  });

  test('should convert reddit urls to vxreddit when the user chooses vxreddit', () => {
    const actual = convertToShareableURL(window.location.href, 'vxreddit');
    expect(actual).toEqual('https://vxreddit.com/r/funny');
  });

  test('should convert reddit urls to rxddit when the user chooses rxddit', () => {
    const actual = convertToShareableURL(window.location.href, 'rxddit');
    expect(actual).toEqual('https://rxddit.com/r/funny');
  });
});

describe('getPostURL', () => {
  const filePath = path.resolve(__dirname, './__test__/post-sharing.html');
  const html = fs.readFileSync(filePath, 'utf8');
  const TEST_URL = 'https://reddit.com/r/test/comments/1111111/test/?ref=share&amp;ref_source=link';
  const STRIPPED_URL = 'https://reddit.com/r/test/comments/1111111/test/';

  beforeEach(() => {
    document.body.innerHTML = html;
  });

  test('should extract the post URL from the DOM and remove the query strings', () => {
    const actual = getPostURL();
    expect(actual).toBe(STRIPPED_URL);
  });

  test('should strip old.reddit from the URL', () => {
    const oldRedditURL = TEST_URL.replace('reddit.com', 'old.reddit.com');
    document.body.querySelector('#test-url')!.setAttribute('value', oldRedditURL);
    const actual = getPostURL();
    expect(actual).toBe(STRIPPED_URL);
  });

  test('should strip new.reddit from the URL', () => {
    const newRedditURL = TEST_URL.replace('reddit.com', 'new.reddit.com');
    document.body.querySelector('#test-url')!.setAttribute('value', newRedditURL);
    const actual = getPostURL();
    expect(actual).toBe(STRIPPED_URL);
  });
});

describe('shareButtonClick', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: {
        clipboard: {
          writeText: jest.fn(),
        },
      },
      writable: true,
    });

    document.body.innerHTML = '<body></body>';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should invoke clipboardToast and pass the mouse coordinates', async () => {
    const expectedX = 9;
    const expectedY = 9;
    let actualX = 0;
    let actualY = 0;
    const spyClipboard = jest.spyOn(common, 'clipboardToast');
    spyClipboard.mockImplementation((x: number, y: number) => {
      actualX = x;
      actualY = y;
    });
    const mouseEvent = new MouseEvent('click', { clientX: expectedX, clientY: expectedY });
    await shareButtonClick(mouseEvent, '');
    expect(spyClipboard).toHaveBeenCalledTimes(1);
    expect(actualX).toBe(expectedX);
    expect(actualY).toBe(expectedY);
  });

  test('should copy the URL to the clipboard', async () => {
    let actualText: string | null = null;
    Object.defineProperty(global, 'navigator', {
      value: {
        clipboard: {
          writeText: jest.fn().mockImplementation((text: string) => {
            actualText = text;
          }),
          isNewOrOldReddit,
        },
      },
      writable: true,
    });
    jest.mock('../common', () => ({
      clipboardToast: jest.fn(),
    }));
    const expected = 'url';
    const mouseEvent = new MouseEvent('click');
    await shareButtonClick(mouseEvent, expected);
    expect(actualText).toBe(expected);
  });
});
