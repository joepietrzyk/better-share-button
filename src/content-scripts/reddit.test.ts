import {isNewOrOldReddit} from './reddit';
import {JSDOM} from 'jsdom';

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
  
  afterEach(() => {
    vi.unstubAllGlobals();
  });
});
