import {
  BSB_SHARE_BUTTON_ATTRIBUTE,
  createShareButtonByCopying,
  createTweetObserver, getDropdown,
  getLinkFromArticle,
  MENU_HOVER_CLASS,
  shareButtonClick
} from './x';
import {resolveOnNextFrame, stubClipboard} from '../test-helpers';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('createTweetObserver', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = '<head><title>Unit tests</title></head><body></body>';
  });
  
  it('should invoke the onTweetAdd callback when a tweet is added', async () => {
    let actualArticle: Element | null = null;
    const observer = createTweetObserver(article => {
      actualArticle = article;
    }, () => {});
    observer.observe(document.body, {childList: true, subtree: true,});
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
    const observer = createTweetObserver(() => {},
      dropdown => {
        actualDropdown = dropdown;
      });
    observer.observe(document.body, {childList: true, subtree: true,});
    const div = document.createElement('div');
    div.innerHTML = '<div data-testid="Dropdown"></div>';
    document.body.appendChild(div);
    await resolveOnNextFrame();
    observer.disconnect();
    expect(actualDropdown!.tagName.toLowerCase()).toBe('div');
    expect(actualDropdown!.getAttribute('data-testid')).toBe('Dropdown');
  });
});

describe('shareButtonClick', () => {
  const pathName = path.resolve(__dirname, './__test__/dropdown.html');
  const shareButtonHTML = fs.readFileSync(pathName, 'utf8');
  beforeEach(() => {
    document.documentElement.innerHTML = shareButtonHTML;
  });
  afterEach(() => {
    vi.unstubAllGlobals();
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

  it('should copy the link to the clipboard', () => {
        
  });

  it('should invoke clipboardToast with the cursor\'s x and y coordinates', () => {
        
  });
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
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  
  it('should get a link that matches the pattern `/user/status/id` from your feed', () => {
    vi.stubGlobal('location', {
      href: 'https://x.com',
      protocol: 'https:',
      host: 'x.com',
      hostname: 'x.com',
      pathname: '',
    });
    const article = document.body.getElementsByTagName('article')[0]!;
    const actualLink = getLinkFromArticle(article);
    expect(actualLink).toBe(expectedLink);
  });

  it('should fall back to the window URL if it\'s unable to find it in the tweet', () => {
    vi.stubGlobal('location', {
      href: expectedLink,
      protocol: 'https:',
      host: 'x.com',
      hostname: 'x.com',
      pathname: '/test/status/1',
    });
    const article = document.body.getElementsByTagName('article')[0]!;
    const correctLink = article.querySelector('#correct-link')!;
    correctLink.remove();
    const actualLink = getLinkFromArticle(article);
    expect(actualLink).toBe(expectedLink);
  });
});

describe('createShareButtonByCopying', () => {
  it('should copy the elementToCopy and all of its children', () => {
    const div = document.createElement('div');
    div.innerHTML = '<div id="parent"><div id="child-node"><div id="deep-node"></div></div></div>';
    const actualCopy = createShareButtonByCopying(div.children[0]);
    const actualDeepNode = actualCopy.querySelector('#deep-node');
    expect(actualDeepNode).not.toBe(null);
  });

  it('should add the hover style to the button when hovered and remove when the mouse moves away', () => {
    const div = document.createElement('div');
    const actualCopy = createShareButtonByCopying(div);
    const mouseenter = new MouseEvent('mouseenter', {
      bubbles: true,
      cancelable: true,
    });
    actualCopy.dispatchEvent(mouseenter);
    expect(actualCopy.classList).toContain(MENU_HOVER_CLASS);
    
    const mouseleave = new MouseEvent('mouseleave', {
      bubbles: true,
      cancelable: true,
    });
    actualCopy.dispatchEvent(mouseleave);
    expect(actualCopy.classList).not.toContain(MENU_HOVER_CLASS);
  });

  it('should change the text on the button to \'Better share link\'', () => {
    const div = document.createElement('div');
    div.innerHTML = 
        '<div role="menuitem" tabindex="0" ' +
        'class="css-175oi2r r-1loqt21 r-18u37iz r-1mmae3n r-3pj75a r-13qz1uu r-o7ynqc r-6416eg r-1ny4l3l">\n' +
        '                <div class="css-175oi2r r-1777fci r-faml9v">\n' +
        '                </div>\n' +
        '                <div class="css-175oi2r r-16y2uox r-1wbh5a2"><div dir="ltr" ' +
        'class="css-146c3p1 r-bcqeeo r-1ttztb7 r-qvutc0 r-37j5jr r-a023e6 r-rjixqe r-b88u0q" ' +
        'style="text-overflow: unset; color: rgb(231, 233, 234);">\n' +
        '                    <span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3" ' +
        'style="text-overflow: unset;">Copy link</span>\n' +
        '                </div>\n' +
        '                </div>\n' +
        '            </div>';
    const copyLink = div.children[0]!;
    const actualCopy = createShareButtonByCopying(copyLink);
    const textEl = actualCopy.getElementsByTagName('span')[0]!;
    expect(textEl.textContent).toBe('Better share link');
  });

  it('should add a unique attribute to the button so we can ensure it\'s only added once', () => {
    const div = document.createElement('div');
    div.innerHTML = '<div></div>';
    const actualCopy = createShareButtonByCopying(div.children[0]);
    expect(actualCopy.getAttribute(BSB_SHARE_BUTTON_ATTRIBUTE)).toBeTruthy();
  });
});

describe('getDropdown', () => {
  const dropdownPath = path.resolve(__dirname, './__test__/dropdown.html');
  const dropdownHTML = fs.readFileSync(dropdownPath, 'utf8');
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
    oldDropdownItem.setAttribute(BSB_SHARE_BUTTON_ATTRIBUTE,'true');
    
    const actual = getDropdown(document.body);
    expect(actual).toBeNull();
  });
});

describe('attachToDropdown', () => {
  it('should attach the button to the top of the dropdown', () => {
    
  });

  it('should ', () => {
    
  });
});

describe('findShareButton', () => {
  it('should locate a tweet\'s share button via its SVG', () => {
        
  });

  it('should not locate any button except the share button', () => {
        
  });
});

describe('convertXLink', () => {
  it('should handle twitter.com and x.com URLs', () => {
        
  });

  it('should use the hostname fixupx.com when the preference is \'fixupx\'', () => {
        
  });
  
  it('should use the hostname fxtwitter.com when the preference is \'fxtwitter\'', () => {

  });

  it('should use the hostname twittpr.com when the preference is \'twittpr\'', () => {

  });

  it('should use the hostname vxtwitter.com when the preference is \'vxtwitter\'', () => {

  });
});
