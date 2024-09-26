import {convertToShareableURL, getPostURL, isNewOrOldReddit} from './reddit';
import {JSDOM} from 'jsdom';
import * as path from 'node:path';
import * as fs from 'node:fs';

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
    const htmlContent = '<div>This is reddit!</div>';
    const dom = new JSDOM(htmlContent);
    vi.stubGlobal('window', dom.window);
    vi.stubGlobal('document', dom.window.document);
    
    const actual = isNewOrOldReddit();
    expect(actual.isNewReddit).toBe(false);
    expect(actual.isOldReddit).toBe(true);
    dom.window.close();
  });
});

describe('convertToShareableURL', () => {
  beforeEach(() => {
    mockRedditURL();
  });
  
  afterEach(() => {
    vi.unstubAllGlobals();
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
    const dom = new JSDOM(html);
    vi.stubGlobal('window', dom.window);
    vi.stubGlobal('document', dom.window.document);
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
