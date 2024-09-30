import {
  addShareButton,
  convertToShareableURL,
  createEmbedButtonObserver,
  getAppBody,
  getPostURL,
  isNewOrOldReddit,
  shareButtonClick,
} from './reddit';
import { JSDOM } from 'jsdom';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as common from '../common';
import { resolveOnNextFrame, setHTMLStringAsDocument } from '../test-helpers';

function mockRedditURL(newOrOld = '', pathname = '/r/funny') {
  vi.stubGlobal('location', {
    href: `https://${newOrOld}reddit.com${pathname}`,
    protocol: 'https:',
    host: `${newOrOld}reddit.com`,
    hostname: `${newOrOld}reddit.com`,
    pathname: pathname,
  });
}

describe('isNewOrOldReddit', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should recognize the window URL as new.reddit.com', () => {
    mockRedditURL('new.');
    const actual = isNewOrOldReddit();
    expect(actual.isNewReddit).toBe(true);
    expect(actual.isOldReddit).toBe(false);
  });

  it('should recognize the window URL as old.reddit.com', () => {
    mockRedditURL('old.');
    const actual = isNewOrOldReddit();
    expect(actual.isNewReddit).toBe(false);
    expect(actual.isOldReddit).toBe(true);
  });

  it('should recognize new reddit html as new reddit', () => {
    mockRedditURL();
    const htmlContent = '<shreddit-app></shreddit-app>';
    const dom = new JSDOM(htmlContent);
    vi.stubGlobal('window', dom.window);
    vi.stubGlobal('document', dom.window.document);

    const actual = isNewOrOldReddit();
    expect(actual.isNewReddit).toBe(true);
    expect(actual.isOldReddit).toBe(false);
    dom.window.close();
  });

  it('should treat all non-new reddit html as old reddit', () => {
    mockRedditURL();
    const htmlString = '<div>This is reddit!</div>';
    const dom = new JSDOM(htmlString);
    vi.stubGlobal('window', dom.window);
    vi.stubGlobal('document', dom.window.document);

    const actual = isNewOrOldReddit();
    expect(actual.isNewReddit).toBe(false);
    expect(actual.isOldReddit).toBe(true);
    dom.window.close();
  });
});

describe('getAppBody', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should find the main body of the reddit app when present', () => {
    const htmlString = '<body><div class="body"></div><div class="content" role="main"></div></body>';
    setHTMLStringAsDocument(htmlString);

    const actualEl = getAppBody();
    const actualRole = actualEl.getAttribute('role');
    const actualClass = actualEl.getAttribute('class');
    expect(actualRole).toBe('main');
    expect(actualClass).toBe('content');
  });

  it("should fall back to the document body if the app body isn't found", () => {
    const htmlString = '<body></body>';
    setHTMLStringAsDocument(htmlString);

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
    setHTMLStringAsDocument('<body></body>');
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create a MutationObserver', () => {
    const observer = createEmbedButtonObserver(() => {});
    expect(observer).not.toBeNull();
    expect(observer instanceof MutationObserver).toBe(true);
  });

  it('should invoke the callback when the embed button is added', async () => {
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

  it('should include the embed button when it invokes the callback', async () => {
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
    setHTMLStringAsDocument('<body></body>');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should add the share button to the right of the provided element when passed 'right'", () => {
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

  it("should add the share button to the left of the provided element when passed 'left'", () => {
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

  it('should invoke the buttonClickListener when clicked', () => {
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

  it('should convert reddit urls to vxreddit when the user chooses vxreddit', () => {
    const actual = convertToShareableURL(window.location.href, 'vxreddit');
    expect(actual).toEqual('https://vxreddit.com/r/funny');
  });

  it('should convert reddit urls to rxddit when the user chooses rxddit', () => {
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
    setHTMLStringAsDocument(html);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should extract the post URL from the DOM and remove the query strings', () => {
    const actual = getPostURL();
    expect(actual).toBe(STRIPPED_URL);
  });

  it('should strip old.reddit from the URL', () => {
    const oldRedditURL = TEST_URL.replace('reddit.com', 'old.reddit.com');
    document.body.querySelector('#test-url')!.setAttribute('value', oldRedditURL);
    const actual = getPostURL();
    expect(actual).toBe(STRIPPED_URL);
  });

  it('should strip new.reddit from the URL', () => {
    const newRedditURL = TEST_URL.replace('reddit.com', 'new.reddit.com');
    document.body.querySelector('#test-url')!.setAttribute('value', newRedditURL);
    const actual = getPostURL();
    expect(actual).toBe(STRIPPED_URL);
  });
});

describe('shareButtonClick', () => {
  beforeEach(async () => {
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn(),
      },
    });
    setHTMLStringAsDocument('<body></body>');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should invoke clipboardToast and pass the mouse coordinates', async () => {
    const expectedX = 9;
    const expectedY = 9;
    let actualX = 0;
    let actualY = 0;
    const spyClipboard = vi.spyOn(common, 'clipboardToast');
    spyClipboard.mockImplementation((x: number, y: number) => {
      actualX = x;
      actualY = y;
    });
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn(),
      },
    });
    const mouseEvent = new MouseEvent('click', { clientX: expectedX, clientY: expectedY });
    await shareButtonClick(mouseEvent, '');
    expect(spyClipboard).toHaveBeenCalledTimes(1);
    expect(actualX).toBe(expectedX);
    expect(actualY).toBe(expectedY);
  });

  it('should copy the URL to the clipboard', async () => {
    let actualText: string | null = null;
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn().mockImplementation((text: string) => {
          actualText = text;
        }),
      },
    });
    const expected = 'url';
    const mouseEvent = new MouseEvent('click');
    await shareButtonClick(mouseEvent, expected);
    expect(actualText).toBe(expected);
  });
});
